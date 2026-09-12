"""
PAIMANA AI — Supabase ML Prediction & Explainability Write-Back Script
Fetches projects from Supabase, enriches feature vectors with live telemetry
from daily_entries and billing_entries, computes genuine ML risk scores and
SHAP risk factors, and updates all three tables:
1. `projects`: risk_score, reason, recommendation, days_flagged
2. `risk_factors`: replaced with top-4 SHAP factors (weights summing to 100)
3. `risk_trend`: new record for the current month
"""

import os
import sys
import datetime
import numpy as np
from dotenv import load_dotenv

# Ensure ml directory is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from explain_engine import (
    predict_project_risk,
    explain_project_with_reconciliation,
    load_explain_artifacts
)
from data.mock_source import get_mock_projects_source, get_mock_project_by_id
from feature_enrichment import enrich_project_features, get_supabase_client

# Load environment variables from ml/.env and project root .env
load_dotenv(os.path.join(SCRIPT_DIR, ".env"))
load_dotenv(os.path.join(os.path.dirname(SCRIPT_DIR), ".env"))

def generate_recommendation(top_factor_feature, risk_score, project_name):
    """Generate prescriptive, actionable policy recommendation for MoSPI dashboard."""
    if risk_score < 45:
        return (
            "Maintain standard fortnightly telemetry and joint measurement logging. "
            "Execution trajectory is stable within sanctioned schedule buffer."
        )

    rec_map = {
        "billing_progress_mismatch_pct": (
            "Freeze further Running Account (RA) bill disbursements; mandate joint physical cross-section "
            "re-measurement and order expenditure reconciliation under Clause 14.2."
        ),
        "land_clearance_status_Disputed": (
            "Convene emergency coordination meeting with District Revenue Authority / Collector to expedite "
            "Right-of-Way compensation and clear encumbered chainage."
        ),
        "payment_delay_days": (
            "Escalate pending contractor payment certificates to Project Director and Ministry Finance Division "
            "to release working capital and prevent site liquidity stalling."
        ),
        "subcontracting_depth": (
            "Order audit of petty contractor deployment; restrict unauthorized multi-tier sub-letting "
            "and ensure direct EPC management oversight on critical path packages."
        ),
        "design_scope_change_count": (
            "Issue design freeze order; require Central Technical Advisory Committee sanction for any further "
            "structural or alignment modifications."
        ),
        "actual_progress": (
            "Direct contractor to mobilize secondary paving/excavation train and introduce double-shift "
            "operations to recover critical path milestone slippage."
        ),
        "planned_progress": (
            "Conduct joint milestone recalibration with Concessionaire to re-align baseline targets with ground realities."
        ),
        "cost_revised": (
            "Submit formal cost overrun appraisal note to Public Investment Board (PIB) for revised administrative approval."
        ),
        "sector_Bridges": (
            "Deploy specialized geotechnical radar inspection on pier foundation well caissons to verify substructure stability."
        ),
        "sector_Railways": (
            "Coordinate with Zonal Railway Operations to secure designated traffic block possession windows for track works."
        ),
        "sector_Roads": (
            "Resolve localized aggregate quarrying clearance with state mining department to secure raw material supply."
        ),
        "sector_Power": (
            "Liaise with state transmission utility for grid interconnection synchronization and tower stub RoW."
        ),
    }
    return rec_map.get(
        top_factor_feature,
        f"Escalate critical risk factors for {project_name} to Divisional Engineer for immediate on-site intervention."
    )


SEED_PROJECTS = [
    {
        "code": "NH-4471",
        "name": "Indore–Betul Highway Widening (Package 2)",
        "sector": "Roads",
        "location": "Madhya Pradesh",
        "contractor": "Shivalik Infraprojects Ltd.",
        "cost_original": 640,
        "cost_revised": 705,
        "start_date": "2024-02-01",
        "duration_months": 36,
        "target_date": "2027-02-01",
        "planned_progress": 68,
        "actual_progress": 47,
        "risk_score": 87,
        "reason": "Expenditure outpacing physical work & forest land diversion delays",
        "recommendation": "Escalate material-supply contract to Divisional Engineer; freeze further RA-bill approval pending site verification.",
        "days_flagged": 6,
    },
    {
        "code": "BR-2209",
        "name": "Narmada River Bridge, Hoshangabad",
        "sector": "Bridges",
        "location": "Madhya Pradesh",
        "contractor": "Ganga Construction Co.",
        "cost_original": 310,
        "cost_revised": 338,
        "start_date": "2024-06-01",
        "duration_months": 24,
        "target_date": "2026-06-01",
        "planned_progress": 55,
        "actual_progress": 49,
        "risk_score": 61,
        "reason": "Monsoon-linked high water work stoppage & pier foundation clearance",
        "recommendation": "Revise schedule buffer for monsoon months in next quarterly review; approve nighttime batching plant operations.",
        "days_flagged": 2,
    },
    {
        "code": "RW-8802",
        "name": "Bhopal–Itarsi Rail Doubling (Section B)",
        "sector": "Railways",
        "location": "Madhya Pradesh",
        "contractor": "Eastern Rail Infra Pvt. Ltd.",
        "cost_original": 920,
        "cost_revised": 918,
        "start_date": "2023-01-01",
        "duration_months": 48,
        "target_date": "2027-01-01",
        "planned_progress": 71,
        "actual_progress": 69,
        "risk_score": 22,
        "reason": "On track with minor legacy delay fully contained",
        "recommendation": "No intervention needed — maintain standard fortnightly telemetry and milestone logging.",
        "days_flagged": 0,
    },
    {
        "code": "PW-3341",
        "name": "Rewa Solar-Grid 400kV Transmission Line",
        "sector": "Power",
        "location": "Madhya Pradesh",
        "contractor": "Vindhya Powergrid Ltd.",
        "cost_original": 214,
        "cost_revised": 249,
        "start_date": "2025-03-01",
        "duration_months": 18,
        "target_date": "2026-09-01",
        "planned_progress": 40,
        "actual_progress": 26,
        "risk_score": 74,
        "reason": "Right-of-way disputes across 14 tower locations + transformer delivery lag",
        "recommendation": "Coordinate with District Collector office on ROW clearance; review contractor's OEM vendor letter of credit.",
        "days_flagged": 11,
    },
    {
        "code": "NH-5510",
        "name": "Jabalpur Outer Ring Road Phase II",
        "sector": "Roads",
        "location": "Madhya Pradesh",
        "contractor": "Omkar Roadways Ltd.",
        "cost_original": 455,
        "cost_revised": 461,
        "start_date": "2024-08-01",
        "duration_months": 30,
        "target_date": "2027-02-01",
        "planned_progress": 34,
        "actual_progress": 31,
        "risk_score": 29,
        "reason": "Marginal aggregate quarrying pause during localized rain",
        "recommendation": "Monitor next reporting cycle; contractor has mobilized second asphalt paving train.",
        "days_flagged": 0,
    },
    {
        "code": "RW-9104",
        "name": "Eastern Dedicated Freight Corridor Branch Connection",
        "sector": "Railways",
        "location": "Uttar Pradesh",
        "contractor": "Bharat Rail Consortium",
        "cost_original": 1120,
        "cost_revised": 1290,
        "start_date": "2023-11-01",
        "duration_months": 42,
        "target_date": "2027-05-01",
        "planned_progress": 62,
        "actual_progress": 39,
        "risk_score": 83,
        "reason": "Subgrade soil failure on 12km stretch + subcontractor wage disputes",
        "recommendation": "Issue notice under Clause 14.2 for subgrade soil stabilization; order third-party audit of Petty Contractor disbursement.",
        "days_flagged": 8,
    },
    {
        "code": "BR-1402",
        "name": "Chenab Rail Viaduct Approach Piers",
        "sector": "Bridges",
        "location": "Jammu & Kashmir",
        "contractor": "Himalayan Infra Engineering",
        "cost_original": 780,
        "cost_revised": 845,
        "start_date": "2023-10-01",
        "duration_months": 36,
        "target_date": "2026-10-01",
        "planned_progress": 58,
        "actual_progress": 51,
        "risk_score": 58,
        "reason": "Slope protection rock bolting required prior to pier erection",
        "recommendation": "Deploy geological radar survey and ensure winterized concrete curing equipment is certified.",
        "days_flagged": 4,
    },
    {
        "code": "PW-4902",
        "name": "Bikaner Ultra-Mega Solar Substation & Evacuation",
        "sector": "Power",
        "location": "Rajasthan",
        "contractor": "Desert Sun Powergrid JV",
        "cost_original": 520,
        "cost_revised": 525,
        "start_date": "2024-04-01",
        "duration_months": 24,
        "target_date": "2026-04-01",
        "planned_progress": 73,
        "actual_progress": 76,
        "risk_score": 31,
        "reason": "Progress ahead of target; nominal dust maintenance overhead",
        "recommendation": "Expedite grid interconnection synchronization protocol with state transmission utility.",
        "days_flagged": 0,
    },
    {
        "code": "NH-6218",
        "name": "Coastal National Highway Corridor Package 4",
        "sector": "Roads",
        "location": "Maharashtra",
        "contractor": "Konkan Infra Concessions",
        "cost_original": 890,
        "cost_revised": 935,
        "start_date": "2024-05-01",
        "duration_months": 36,
        "target_date": "2027-05-01",
        "planned_progress": 44,
        "actual_progress": 39,
        "risk_score": 49,
        "reason": "CRZ stage-II environmental clearance conditional stipulations",
        "recommendation": "Track compliance with Ministry of Environment, Forest and Climate Change monitoring committee.",
        "days_flagged": 1,
    },
    {
        "code": "RW-7319",
        "name": "Mumbai–Ahmedabad HSR Pier Substructure (Package C2)",
        "sector": "Railways",
        "location": "Gujarat",
        "contractor": "Apex Bullet Infra Ltd.",
        "cost_original": 1650,
        "cost_revised": 1840,
        "start_date": "2023-09-01",
        "duration_months": 40,
        "target_date": "2027-01-01",
        "planned_progress": 65,
        "actual_progress": 44,
        "risk_score": 78,
        "reason": "Precast girder casting rejection rate exceeding tolerance threshold",
        "recommendation": "Summon QA/QC inspection team; halt pier cap mounting until batch test certificates re-verified by IIT Roorkee.",
        "days_flagged": 9,
    },
]

def seed_benchmark_projects(supabase):
    """Seed the 10 benchmark infrastructure projects and their telemetry when DB is clean."""
    print("  -> Inserting 10 benchmark projects into public.projects...")
    for proj in SEED_PROJECTS:
        supabase.table("projects").upsert(proj, on_conflict="code").execute()

    # Query back inserted projects to map codes to UUIDs
    p_map = {row["code"]: row["id"] for row in supabase.table("projects").select("id, code").execute().data or []}

    # Seed Billing Entries
    billing_rows = []
    billing_data = {
        "NH-4471": [("RA-14", 42.0, 31.5, "flagged"), ("RA-13", 28.0, 27.2, "approved"), ("RA-12", 33.5, 32.8, "approved")],
        "BR-2209": [("RA-09", 19.4, 18.9, "approved"), ("RA-08", 22.0, 21.6, "approved")],
        "RW-8802": [("RA-22", 55.0, 54.6, "approved"), ("RA-21", 48.2, 47.9, "approved")],
        "PW-3341": [("RA-06", 21.2, 15.8, "flagged"), ("RA-05", 16.4, 16.1, "approved")],
        "NH-5510": [("RA-04", 12.0, 11.7, "approved"), ("RA-03", 14.8, 14.5, "approved")],
        "RW-9104": [("RA-19", 64.5, 48.2, "flagged"), ("RA-18", 51.0, 49.5, "approved")],
        "BR-1402": [("RA-11", 34.0, 33.1, "approved"), ("RA-10", 29.5, 28.9, "approved")],
        "PW-4902": [("RA-08", 44.5, 44.1, "approved"), ("RA-07", 39.0, 38.6, "approved")],
        "NH-6218": [("RA-05", 31.0, 30.2, "approved"), ("RA-04", 26.5, 26.0, "approved")],
        "RW-7319": [("RA-15", 88.0, 69.4, "flagged"), ("RA-14", 72.0, 70.8, "approved")],
    }
    for code, bills in billing_data.items():
        pid = p_map.get(code)
        if not pid:
            continue
        for b_code, claimed, expected, status in bills:
            billing_rows.append({
                "project_id": pid,
                "bill_code": b_code,
                "claimed_amount": claimed,
                "expected_amount": expected,
                "status": status,
            })
    if billing_rows:
        supabase.table("billing_entries").insert(billing_rows).execute()

    # Seed Historical Risk Trends (Apr - Aug)
    trend_rows = []
    trend_data = {
        "NH-4471": [("Apr", 38, "2026-04-01"), ("May", 44, "2026-05-01"), ("Jun", 51, "2026-06-01"), ("Jul", 63, "2026-07-01"), ("Aug", 78, "2026-08-01")],
        "BR-2209": [("Apr", 30, "2026-04-01"), ("May", 34, "2026-05-01"), ("Jun", 41, "2026-06-01"), ("Jul", 48, "2026-07-01"), ("Aug", 55, "2026-08-01")],
        "RW-8802": [("Apr", 24, "2026-04-01"), ("May", 22, "2026-05-01"), ("Jun", 20, "2026-06-01"), ("Jul", 21, "2026-07-01"), ("Aug", 23, "2026-08-01")],
        "PW-3341": [("Apr", 33, "2026-04-01"), ("May", 41, "2026-05-01"), ("Jun", 48, "2026-06-01"), ("Jul", 58, "2026-07-01"), ("Aug", 68, "2026-08-01")],
        "NH-5510": [("Apr", 18, "2026-04-01"), ("May", 20, "2026-05-01"), ("Jun", 24, "2026-06-01"), ("Jul", 26, "2026-07-01"), ("Aug", 28, "2026-08-01")],
        "RW-9104": [("Apr", 54, "2026-04-01"), ("May", 61, "2026-05-01"), ("Jun", 67, "2026-06-01"), ("Jul", 74, "2026-07-01"), ("Aug", 79, "2026-08-01")],
        "BR-1402": [("Apr", 42, "2026-04-01"), ("May", 46, "2026-05-01"), ("Jun", 49, "2026-06-01"), ("Jul", 52, "2026-07-01"), ("Aug", 55, "2026-08-01")],
        "PW-4902": [("Apr", 29, "2026-04-01"), ("May", 31, "2026-05-01"), ("Jun", 30, "2026-06-01"), ("Jul", 32, "2026-07-01"), ("Aug", 30, "2026-08-01")],
        "NH-6218": [("Apr", 35, "2026-04-01"), ("May", 38, "2026-05-01"), ("Jun", 42, "2026-06-01"), ("Jul", 45, "2026-07-01"), ("Aug", 47, "2026-08-01")],
        "RW-7319": [("Apr", 48, "2026-04-01"), ("May", 54, "2026-05-01"), ("Jun", 62, "2026-06-01"), ("Jul", 69, "2026-07-01"), ("Aug", 73, "2026-08-01")],
    }
    for code, trends in trend_data.items():
        pid = p_map.get(code)
        if not pid:
            continue
        for m_label, r_val, rec_at in trends:
            trend_rows.append({
                "project_id": pid,
                "month_label": m_label,
                "risk_value": r_val,
                "recorded_at": rec_at,
            })
    if trend_rows:
        supabase.table("risk_trend").insert(trend_rows).execute()

    # Seed initial Daily Entries
    daily_rows = [
        {
            "project_id": p_map.get("NH-4471"),
            "entry_date": "2026-09-11",
            "work_status": "Running",
            "delay_reason": None,
            "material_notes": "Cement: 120 bags · Steel: 42 MT",
            "photo_url": "geo_chainage_42_pier12.jpg",
            "notes": "Girder casting for Pier 12 completed. Slump test: 110mm.",
            "reviewed_status": "Pending Review",
        },
        {
            "project_id": p_map.get("BR-2209"),
            "entry_date": "2026-09-10",
            "work_status": "Running",
            "delay_reason": None,
            "material_notes": "Cement: 90 bags · Sand: 28 cum",
            "photo_url": "narmada_abutment_a2.jpg",
            "notes": "Abutment A2 shuttering work inspected and cleared for concrete pour.",
            "reviewed_status": "Reviewed",
        },
        {
            "project_id": p_map.get("NH-4471"),
            "entry_date": "2026-09-09",
            "work_status": "Stalled",
            "delay_reason": "Land/legal dispute",
            "material_notes": "None logged",
            "photo_url": "row_dispute_km44.jpg",
            "notes": "Right-of-way dispute at km 44. Local revenue authority team visited.",
            "reviewed_status": "Reviewed",
        },
        {
            "project_id": p_map.get("BR-2209"),
            "entry_date": "2026-09-08",
            "work_status": "Off",
            "delay_reason": "Weather",
            "material_notes": "None logged",
            "photo_url": None,
            "notes": "River water level exceeded safety limit (Gauge 3.4m). Operations halted.",
            "reviewed_status": "Reviewed",
        },
    ]
    daily_rows = [r for r in daily_rows if r.get("project_id")]
    if daily_rows:
        supabase.table("daily_entries").insert(daily_rows).execute()

    print(f"  [OK] Seeded 10 projects, {len(billing_rows)} billing entries, {len(trend_rows)} historical trends, {len(daily_rows)} daily logs.")

def run_prediction_and_update():
    print("=" * 78)
    print("PAIMANA AI — ML RISK PREDICTION & DATABASE WRITE-BACK PIPELINE")
    print("=" * 78)

    # 1. Verify ML models can be loaded
    print("[1/4] Loading trained XGBoost models and genuine SHAP TreeExplainer...")
    artifacts = load_explain_artifacts()
    base_val = artifacts["explainer"].expected_value
    if isinstance(base_val, (list, np.ndarray)):
        base_val = base_val[0]
    print(f"[OK] Models loaded. Population Base Expected Risk Value: {base_val:.2f} pts")

    # 2. Check Supabase connection
    supabase = get_supabase_client()
    now = datetime.datetime.now()
    month_label = now.strftime("%b")

    if supabase:
        print(f"[2/4] Connected to Supabase PostgreSQL at {os.environ.get('SUPABASE_URL')[:30]}...")
        # Fetch all projects
        p_res = supabase.table("projects").select("*").execute()
        projects = p_res.data or []

        # Auto-seed if database is empty (e.g. brand new Supabase project where only schema.sql was run)
        if len(projects) == 0:
            print("[INFO] Database contains 0 projects. Auto-seeding 10 benchmark infrastructure projects...")
            seed_benchmark_projects(supabase)
            p_res = supabase.table("projects").select("*").execute()
            projects = p_res.data or []

        print(f"[OK] Fetched {len(projects)} infrastructure projects from database.")

        updated_count = 0
        print("\n[3/4] Running inference & writing back to projects, risk_factors, risk_trend...")

        for p in projects:
            p_id = p["id"]
            p_code = p.get("code") or p_id

            # Fetch related entries for signal enrichment
            daily_res = supabase.table("daily_entries").select("*").eq("project_id", p_id).execute()
            billing_res = supabase.table("billing_entries").select("*").eq("project_id", p_id).execute()

            # Merge known ground-research benchmark signals if this matches a benchmark project
            benchmark_meta = get_mock_project_by_id(p_code) or get_mock_project_by_id(p_id)
            merged_p = {**benchmark_meta, **p} if benchmark_meta else p

            feat_dict = enrich_project_features(merged_p, daily_res.data, billing_res.data)

            # Predict risk & compute real SHAP factors
            pred = predict_project_risk(feat_dict)
            shap_res = explain_project_with_reconciliation(feat_dict, top_n=4)

            new_risk = pred["risk_score"]
            top_factors = shap_res["factors"]
            top_feature = top_factors[0]["_feature"]
            reason = top_factors[0]["factor_text"]
            recommendation = generate_recommendation(top_feature, new_risk, p["name"])
            
            old_days = p.get("days_flagged") or 0
            new_days = (old_days + 1) if new_risk >= 60 else max(0, old_days - 1)

            # A. Update `projects` table
            supabase.table("projects").update({
                "risk_score": new_risk,
                "reason": reason,
                "recommendation": recommendation,
                "days_flagged": new_days,
            }).eq("id", p_id).execute()

            # B. Replace `risk_factors` table records with genuine SHAP factors
            supabase.table("risk_factors").delete().eq("project_id", p_id).execute()
            factor_rows = [
                {
                    "project_id": p_id,
                    "factor_text": f["factor_text"],
                    "weight": f["weight"],
                }
                for f in top_factors
            ]
            supabase.table("risk_factors").insert(factor_rows).execute()

            # C. Insert new record into `risk_trend`
            supabase.table("risk_trend").insert({
                "project_id": p_id,
                "month_label": month_label,
                "risk_value": new_risk,
            }).execute()

            updated_count += 1
            print(
                f"  [{updated_count:02d}/{len(projects):02d}] {p_code:<10} | "
                f"Old: {p.get('risk_score', 25):2d} -> ML Risk: {new_risk:2d} | "
                f"Top SHAP: {reason[:45]}... ({top_factors[0]['weight']}%)"
            )

        print(f"\n[4/4] [SUCCESS] All {updated_count} projects updated in Supabase PostgreSQL!")

    else:
        print("[2/4] [NOTICE] SUPABASE_URL / Key not found or unconfigured in environment.")
        print("      Operating in High-Fidelity Local Simulation Mode:")
        print("      Computing ML predictions for all default projects and generating sync payloads.")

        # Load from mock data
        from data.mock_source import get_mock_projects_source
        projects = get_mock_projects_source()
        print(f"[OK] Loaded {len(projects)} benchmark infrastructure projects.")

        updated_records = []
        print("\n[3/4] Executing real Model B inference + SHAP attribution for all projects...")

        for idx, p in enumerate(projects, 1):
            feat_dict = enrich_project_features(p, p.get("dailyEntries", []), p.get("billing", []))
            pred = predict_project_risk(feat_dict)
            shap_res = explain_project_with_reconciliation(feat_dict, top_n=4)

            new_risk = pred["risk_score"]
            top_factors = shap_res["factors"]
            top_feature = top_factors[0]["_feature"]
            reason = top_factors[0]["factor_text"]
            recommendation = generate_recommendation(top_feature, new_risk, p["name"])

            p_updated = dict(p)
            p_updated["risk"] = new_risk
            p_updated["risk_score"] = new_risk
            p_updated["reason"] = reason
            p_updated["recommendation"] = recommendation
            p_updated["factors"] = [{"f": f["factor_text"], "w": f["weight"]} for f in top_factors]
            p_updated["ml_prediction"] = pred
            p_updated["shap_reconciliation"] = {
                "base_value": shap_res["base_value"],
                "sum_shap": shap_res["sum_all_shap"],
                "mode": shap_res["mode"],
                "reconciled": shap_res["is_reconciled"],
            }
            if p_updated.get("trend") and len(p_updated["trend"]) > 0:
                p_updated["trend"][-1]["v"] = new_risk
            updated_records.append(p_updated)

            print(
                f"  [{idx:02d}/{len(projects):02d}] {p['id']:<10} | "
                f"Baseline: {p.get('risk', 25):2d} -> ML Risk: {new_risk:2d} ({shap_res['mode']}) | "
                f"Top: {reason[:42]}... ({top_factors[0]['weight']}%)"
            )

        # Save to data/ml_predicted_projects.json
        out_json = os.path.join(SCRIPT_DIR, "data", "ml_predicted_projects.json")
        import json
        with open(out_json, "w", encoding="utf-8") as f:
            json.dump(updated_records, f, indent=2)

        # Also synchronize src/data/mockProjects.js for seamless UI display
        src_mock_path = os.path.join(os.path.dirname(SCRIPT_DIR), "src", "data", "mockProjects.js")
        if os.path.exists(src_mock_path):
            with open(src_mock_path, "w", encoding="utf-8") as f:
                f.write("/**\n * PAIMANA AI — Synthetic MoSPI Infrastructure Projects Dataset (ML & SHAP Synchronized)\n")
                f.write(" * Central Sector Projects (₹150 Cr+) across Roads, Bridges, Railways, and Power\n */\n\n")
                f.write("export const mockProjects = ")
                f.write(json.dumps(updated_records, indent=2))
                f.write(";\n\nexport const sectors = [\"All\", ...new Set(mockProjects.map((p) => p.sector))];\n\nexport default mockProjects;\n")
            print(f"[SYNC] Updated frontend mock data at src/data/mockProjects.js")

        print(f"\n[4/4] [SUCCESS] Saved ML outputs to {out_json}.")
        print("      To sync directly into Supabase live, add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        print("      to ml/.env and re-run: python ml/predict_and_update.py")

if __name__ == "__main__":
    run_prediction_and_update()
