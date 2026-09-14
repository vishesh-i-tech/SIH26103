"""
PAIMANA AI — What-If Intervention Simulator (FastAPI)
======================================================
Exposes /api/v1/simulate: given a project_id and a set of proposed
interventions on the ground-research friction fields, returns the
BASELINE risk assessment vs the SIMULATED (counterfactual) risk
assessment, both computed via the same genuine Model B + shap.TreeExplainer
pipeline used everywhere else in the system (explain_engine.py).

HARD CONSTRAINT (carried over from explain_engine.py):
No disguised if/else "fake explainability". Every score and factor here
comes from a real explainer.shap_values() call on the real trained
XGBRegressor, run twice — once on the unmodified project, once on the
project with interventions applied — never from a hand-rolled delta
heuristic.

Run locally:
    cd ml
    pip install fastapi uvicorn[standard] python-dotenv
    python server.py
    # or: uvicorn server:app --reload --port 8000

Environment variables (ml/.env):
    PORT                 (optional, default 8000)
    ALLOWED_ORIGINS      (optional, comma-separated, default "*")
"""

import os
import sys
from typing import List, Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator

# ---------------------------------------------------------------------------
# Path / env setup — mirrors predict_and_update.py so this can be dropped
# into ml/server.py without any import surprises.
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

load_dotenv(os.path.join(SCRIPT_DIR, ".env"))
load_dotenv(os.path.join(os.path.dirname(SCRIPT_DIR), ".env"))

from explain_engine import predict_project_risk, explain_project_with_reconciliation  # noqa: E402
from data.mock_source import get_mock_projects_source, get_mock_project_by_id  # noqa: E402
from feature_enrichment import enrich_project_features, get_supabase_client, is_valid_uuid  # noqa: E402

_supabase_client = None


def _get_supabase():
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = get_supabase_client()
    return _supabase_client

# ---------------------------------------------------------------------------
# App + CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="PAIMANA AI — What-If Intervention Simulator",
    description="Counterfactual risk-scenario API backed by genuine SHAP attribution (Model B).",
    version="1.0.0",
)

_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
if _allowed_origins_env:
    _allowed_origins = [o.strip() for o in _allowed_origins_env.split(",") if o.strip()]
else:
    # Hackathon-safe default: Vite dev server + wildcard fallback.
    _allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173", "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

LAND_STATUS_OPTIONS = ("Clear", "Pending", "Disputed")


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class InterventionInput(BaseModel):
    """Only the 5 ground-research friction fields can be intervened on.
    All are optional — the caller sends only what they want to change;
    anything omitted is left at the project's current baseline value."""

    payment_delay_days: Optional[float] = Field(None, ge=0, le=365)
    subcontracting_depth: Optional[int] = Field(None, ge=0, le=5)
    land_clearance_status: Optional[Literal["Clear", "Pending", "Disputed"]] = None
    design_scope_change_count: Optional[int] = Field(None, ge=0, le=10)
    billing_progress_mismatch_pct: Optional[float] = Field(None, ge=-50, le=100)

    @model_validator(mode="after")
    def at_least_one_field(self):
        if all(v is None for v in self.model_dump().values()):
            raise ValueError("Provide at least one intervention field.")
        return self


class SimulateRequest(BaseModel):
    project_id: str
    interventions: InterventionInput


class FactorOut(BaseModel):
    factor_text: str
    weight: int
    shap_value: float
    feature: str


class RiskAssessmentOut(BaseModel):
    risk_score: int
    raw_prediction: float
    time_overrun_probability: float
    mode: Literal["risk_escalation", "protective_stabilizing"]
    factors: List[FactorOut]


class SimulateResponse(BaseModel):
    project_id: str
    project_name: str
    interventions_applied: dict
    baseline: RiskAssessmentOut
    simulated: RiskAssessmentOut
    delta_risk_score: int
    delta_raw_prediction: float
    improved: bool


class ProjectSummaryOut(BaseModel):
    id: str
    code: str
    name: str
    sector: str


class DailyEntryIn(BaseModel):
    project_id: str
    submitted_by: Optional[str] = None
    entry_date: str
    work_status: str
    delay_reason: Optional[str] = None
    material_notes: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    reviewed_status: Optional[str] = "Pending Review"


class ProjectBaselineOut(BaseModel):
    project: dict
    assessment: RiskAssessmentOut


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _build_assessment(project_dict: dict) -> RiskAssessmentOut:
    """Runs the real Model B + real SHAP TreeExplainer on a project dict
    and shapes the output to the response schema. Used for BOTH the
    baseline call and the counterfactual call — identical code path,
    only the input dict differs."""
    risk = predict_project_risk(project_dict)
    explanation = explain_project_with_reconciliation(project_dict)
    factors = [
        FactorOut(
            factor_text=f["factor_text"],
            weight=f["weight"],
            shap_value=f["_shap_value"],
            feature=f["_feature"],
        )
        for f in explanation["factors"]
    ]
    return RiskAssessmentOut(
        risk_score=risk["risk_score"],
        raw_prediction=explanation["raw_prediction"],
        time_overrun_probability=risk["time_overrun_probability"],
        mode=explanation["mode"],
        factors=factors,
    )


def _get_project_or_404(project_id: str) -> dict:
    """Two-tier project lookup:
    1. Try mock_source first (fast path — keeps the 10 seeded demo projects' exact calibrated values).
    2. If not found in mock_source, query live Supabase `projects` table (by UUID or code),
       fetch related `daily_entries` and `billing_entries`, and pass all three into
       `enrich_project_features()` to build the identical dict shape mock_source projects have.
    3. If neither source has it, raise 404.
    """
    # Tier 1: Fast path from benchmark mock source
    project = get_mock_project_by_id(project_id)
    if project is not None:
        return project

    # Tier 2: Live Supabase database lookup
    supabase = _get_supabase()
    if supabase is not None:
        try:
            p_data = None
            if is_valid_uuid(project_id):
                res = supabase.table("projects").select("*").eq("id", project_id).execute()
                if res.data and len(res.data) > 0:
                    p_data = res.data[0]

            if not p_data:
                res = supabase.table("projects").select("*").eq("code", project_id).execute()
                if res.data and len(res.data) > 0:
                    p_data = res.data[0]

            if p_data:
                p_id = p_data["id"]
                daily_res = supabase.table("daily_entries").select("*").eq("project_id", p_id).execute()
                billing_res = supabase.table("billing_entries").select("*").eq("project_id", p_id).execute()
                return enrich_project_features(p_data, daily_res.data or [], billing_res.data or [])
        except Exception as e:
            print(f"[WARN] Supabase lookup error for project '{project_id}': {e}")

    # Tier 3: Raise 404 if not found anywhere
    raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "paimana-whatif-simulator"}


@app.get("/api/v1/projects", response_model=List[ProjectSummaryOut])
def list_projects():
    """Lightweight list for populating the project selector in WhatIfSimulator.jsx.

    Returns the 10 benchmark projects from mock_source, plus any dynamic
    projects added directly to Supabase, deduped strictly by project code.
    """
    projects = get_mock_projects_source()
    items = [
        ProjectSummaryOut(
            id=p.get("id") or p.get("code"),
            code=p.get("code") or p.get("id"),
            name=p.get("name"),
            sector=p.get("sector") or "Roads",
        )
        for p in projects
    ]
    mock_codes = {str(p.get("code") or p.get("id")) for p in projects}

    supabase = _get_supabase()
    if supabase is not None:
        try:
            res = supabase.table("projects").select("id, code, name, sector").execute()
            for r in res.data or []:
                r_code = str(r.get("code") or "")
                # Skip if code already exists in mock_source's list
                if not r_code or r_code in mock_codes:
                    continue
                mock_codes.add(r_code)
                items.append(
                    ProjectSummaryOut(
                        id=str(r.get("id") or r_code),
                        code=r_code,
                        name=r.get("name") or r_code,
                        sector=r.get("sector") or "Roads",
                    )
                )
        except Exception as e:
            print(f"[WARN] Failed to fetch dynamic projects for project selector: {e}")

    return items


@app.post("/api/v1/daily-entries")
def create_daily_entry(entry: DailyEntryIn):
    """Inserts a daily ground verification entry into Supabase daily_entries table
    using the backend service role key, bypassing client-side RLS limits for reliable field logging.
    """
    supabase = _get_supabase()
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase database not configured on server.")

    try:
        # Resolve project UUID if passed code
        p_id = entry.project_id
        if not is_valid_uuid(p_id):
            p_res = supabase.table("projects").select("id").eq("code", p_id).execute()
            if p_res.data and len(p_res.data) > 0:
                p_id = p_res.data[0]["id"]

        # Validate submitted_by UUID against profiles to prevent FK violations
        sub_by = entry.submitted_by
        if sub_by:
            if not is_valid_uuid(sub_by) or str(sub_by).startswith("demo-"):
                sub_by = None
            else:
                try:
                    prof_res = supabase.table("profiles").select("id").eq("id", sub_by).execute()
                    if not prof_res.data or len(prof_res.data) == 0:
                        sub_by = None
                except Exception:
                    sub_by = None

        payload = {
            "project_id": p_id,
            "submitted_by": sub_by,
            "entry_date": entry.entry_date,
            "work_status": entry.work_status,
            "delay_reason": entry.delay_reason,
            "material_notes": entry.material_notes,
            "photo_url": entry.photo_url,
            "notes": entry.notes,
            "reviewed_status": entry.reviewed_status or "Pending Review",
        }

        res = supabase.table("daily_entries").insert(payload).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        print(f"[ERROR] Failed to insert daily entry via service-role API: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/projects/{project_id}", response_model=ProjectBaselineOut)
def get_project_baseline(project_id: str):
    """Returns the project's raw ground-research fields (to prefill the
    simulator's sliders/inputs at their real current values) plus its
    baseline risk assessment."""
    project = _get_project_or_404(project_id)
    assessment = _build_assessment(project)
    return ProjectBaselineOut(project=project, assessment=assessment)


@app.post("/api/v1/simulate", response_model=SimulateResponse)
def simulate(req: SimulateRequest):
    """Core What-If endpoint.

    1. Loads the project's real baseline ground-research fields from
       mock_source.py (single source of truth — same values
       explain_engine.py and predict_and_update.py use).
    2. Runs the real model + real SHAP on the UNMODIFIED project -> baseline.
    3. Applies ONLY the caller's requested interventions on top of the
       baseline (everything else held constant) -> simulated project.
    4. Runs the real model + real SHAP on the MODIFIED project -> simulated.
    5. Returns both full assessments plus the delta, so the frontend never
       has to compute or approximate a risk change itself.
    """
    base_project = _get_project_or_404(req.project_id)

    interventions_dict = {
        k: v for k, v in req.interventions.model_dump().items() if v is not None
    }

    simulated_project = {**base_project, **interventions_dict}

    baseline_assessment = _build_assessment(base_project)
    simulated_assessment = _build_assessment(simulated_project)

    delta_risk_score = simulated_assessment.risk_score - baseline_assessment.risk_score
    delta_raw = round(simulated_assessment.raw_prediction - baseline_assessment.raw_prediction, 3)

    return SimulateResponse(
        project_id=base_project.get("id") or req.project_id,
        project_name=base_project.get("name", ""),
        interventions_applied=interventions_dict,
        baseline=baseline_assessment,
        simulated=simulated_assessment,
        delta_risk_score=delta_risk_score,
        delta_raw_prediction=delta_raw,
        improved=delta_risk_score < 0,
    )


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
