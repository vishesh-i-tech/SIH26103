"""
PAIMANA AI — Shared Feature Enrichment & Telemetry Module
==========================================================
Single source of truth for ground-research feature enrichment across
predict_and_update.py and server.py.

Extracts and infers friction signals from project metadata, daily_entries,
and billing_entries:
1. billing_progress_mismatch_pct
2. land_clearance_status
3. payment_delay_days
4. subcontracting_depth
5. design_scope_change_count
6. elapsed_months
"""

import os
import uuid
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(SCRIPT_DIR, ".env"))
load_dotenv(os.path.join(os.path.dirname(SCRIPT_DIR), ".env"))


def get_supabase_client():
    """Initializes a Supabase client using environment variables."""
    url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or
        os.environ.get("SUPABASE_KEY") or
        os.environ.get("VITE_SUPABASE_ANON_KEY")
    )
    if not url or not key or "your-project" in url:
        return None
    try:
        from supabase import create_client
        return create_client(url, key)
    except Exception as e:
        print(f"[WARN] Could not initialize Supabase client: {e}")
        return None


def is_valid_uuid(val: Any) -> bool:
    """Checks if a string represents a valid UUID."""
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


def enrich_project_features(
    proj: Dict[str, Any],
    daily_entries: Optional[List[Dict[str, Any]]] = None,
    billing_entries: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Enrich baseline project dictionary with live ground telemetry signals.

    Produces a dictionary matching the exact schema expected by explain_engine.py
    and server.py for genuine Model B and SHAP inference.
    """
    daily_entries = daily_entries or []
    billing_entries = billing_entries or []

    cost_orig = float(proj.get("cost_original") or proj.get("costOriginal") or 500.0)
    cost_rev = float(proj.get("cost_revised") or proj.get("costRevised") or cost_orig)
    dur = int(proj.get("duration_months") or proj.get("duration") or 36)
    planned = float(proj.get("planned_progress") or proj.get("planned") or 0.0)
    actual = float(proj.get("actual_progress") or proj.get("actual") or 0.0)
    sector = proj.get("sector") or "Roads"

    # 1. Billing progress mismatch from billing_entries (or explicit field)
    if proj.get("billing_progress_mismatch_pct") is not None:
        billing_mismatch = float(proj["billing_progress_mismatch_pct"])
    elif billing_entries and len(billing_entries) > 0:
        total_claimed = sum(float(b.get("claimed_amount") or b.get("claimed") or 0) for b in billing_entries)
        total_expected = sum(float(b.get("expected_amount") or b.get("expected") or 0) for b in billing_entries)
        if total_expected > 0:
            billing_mismatch = round(((total_claimed - total_expected) / total_expected) * 100.0, 1)
        else:
            billing_mismatch = 3.0
    else:
        billing_mismatch = 3.0

    # Text corpus for telemetry inference fallback
    daily_reasons = " ".join([
        str(d.get("delay_reason") or d.get("reason") or "") + " " + str(d.get("notes") or "")
        for d in daily_entries
    ]).lower()
    proj_reason = str(proj.get("reason") or "").lower()
    all_text = daily_reasons + " " + proj_reason
    days_flagged = int(proj.get("days_flagged") or proj.get("daysFlagged") or 0)

    # 2. Land clearance status
    if proj.get("land_clearance_status") is not None:
        land_status = str(proj["land_clearance_status"])
    elif "dispute" in all_text or "court" in all_text or "litigation" in all_text:
        land_status = "Disputed"
    elif "clear" in all_text or "resolved" in all_text or planned == actual:
        land_status = "Clear"
    else:
        land_status = "Pending"

    # 3. Payment delay days
    if proj.get("payment_delay_days") is not None:
        payment_delay = float(proj["payment_delay_days"])
    else:
        flagged_bills = [b for b in billing_entries if str(b.get("status")).lower() == "flagged"]
        if len(flagged_bills) > 0:
            payment_delay = 45.0 + (len(flagged_bills) * 18.0)
        elif days_flagged > 0:
            payment_delay = 30.0 + (days_flagged * 5.0)
        else:
            payment_delay = 18.0

    # 4. Subcontracting depth
    if proj.get("subcontracting_depth") is not None:
        subcontract_depth = int(proj["subcontracting_depth"])
    elif "petty" in all_text or "subcontract" in all_text or days_flagged >= 6:
        subcontract_depth = 2
    elif actual >= planned and days_flagged == 0:
        subcontract_depth = 0
    else:
        subcontract_depth = 1

    # 5. Scope changes
    if proj.get("design_scope_change_count") is not None:
        scope_changes = int(proj["design_scope_change_count"])
    else:
        scope_changes = 1
        if "scope" in all_text or "revision" in all_text or "design" in all_text:
            scope_changes = 2
        if cost_rev > cost_orig * 1.10:
            scope_changes += 1

    # 6. Elapsed months
    elapsed = proj.get("elapsed_months")
    if elapsed is None:
        elapsed = int(max(3, round((planned / 100.0) * dur)))
    else:
        elapsed = int(elapsed)

    # Return full project dict combining original metadata with all friction features
    result = dict(proj)
    result.update({
        "id": proj.get("id"),
        "code": proj.get("code") or proj.get("id"),
        "name": proj.get("name"),
        "sector": sector,
        "cost_original": cost_orig,
        "cost_revised": cost_rev,
        "duration_months": dur,
        "elapsed_months": elapsed,
        "planned_progress": planned,
        "actual_progress": actual,
        "payment_delay_days": payment_delay,
        "subcontracting_depth": subcontract_depth,
        "land_clearance_status": land_status,
        "design_scope_change_count": scope_changes,
        "billing_progress_mismatch_pct": billing_mismatch,
        "days_flagged": days_flagged,
    })
    return result
