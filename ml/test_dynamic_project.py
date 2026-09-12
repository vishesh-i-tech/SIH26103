"""
End-to-End Test for Dynamic Project Lookup in server.py
1. Insert DY-9001 into Supabase projects, billing_entries, daily_entries
2. Query GET /api/v1/projects/DY-9001
3. Query POST /api/v1/simulate for DY-9001 with {"payment_delay_days": 10}
4. Query GET /api/v1/projects and verify dedupe by code
5. Clean up DY-9001 rows and verify 0 rows remain
"""

import json
import sys
from fastapi.testclient import TestClient
from server import app
from feature_enrichment import get_supabase_client

def run_test():
    client = TestClient(app)
    supabase = get_supabase_client()
    if not supabase:
        print("[ERROR] Could not connect to Supabase.")
        sys.exit(1)

    print("[1/5] Inserting throwaway test project DY-9001 into Supabase...")
    # Clean up any leftover row first just in case
    supabase.table("projects").delete().eq("code", "DY-9001").execute()

    proj_payload = {
        "code": "DY-9001",
        "name": "Dynamic Solar Evacuation Corridor (Package 1)",
        "sector": "Power",
        "location": "Rajasthan",
        "contractor": "Dynamic Infra Concessions Pvt Ltd",
        "cost_original": 420.0,
        "cost_revised": 465.0,
        "start_date": "2024-03-01",
        "duration_months": 24,
        "target_date": "2026-03-01",
        "planned_progress": 65,
        "actual_progress": 42,
        "risk_score": 70,
        "reason": "Temporary right-of-way easement litigation",
        "recommendation": "Coordinate with District Administration for RoW clearance.",
        "days_flagged": 3,
    }

    p_res = supabase.table("projects").insert(proj_payload).execute()
    p_row = p_res.data[0]
    p_id = p_row["id"]
    print(f"  Inserted project UUID: {p_id}, code: {p_row['code']}")

    # Insert 1 billing entry
    billing_payload = {
        "project_id": p_id,
        "bill_code": "RA-01",
        "claimed_amount": 55.0,
        "expected_amount": 40.0,
        "status": "flagged",
    }
    b_res = supabase.table("billing_entries").insert(billing_payload).execute()
    print(f"  Inserted billing entry: {b_res.data[0]['id']}")

    # Insert 1 daily entry
    daily_payload = {
        "project_id": p_id,
        "entry_date": "2026-09-11",
        "work_status": "Stalled",
        "delay_reason": "Right of way dispute along tower chainage 12-16",
        "material_notes": "Conductor coils stored at base depot",
        "notes": "Revenue department demarcation pending court order review.",
        "reviewed_status": "Reviewed",
    }
    d_res = supabase.table("daily_entries").insert(daily_payload).execute()
    print(f"  Inserted daily entry: {d_res.data[0]['id']}")

    print("\n[2/5] Testing GET /api/v1/projects/DY-9001...")
    get_res = client.get("/api/v1/projects/DY-9001")
    print(f"  Status Code: {get_res.status_code}")
    print("--- GET /api/v1/projects/DY-9001 JSON RESPONSE ---")
    print(json.dumps(get_res.json(), indent=2))
    print("--------------------------------------------------")

    print("\n[3/5] Testing POST /api/v1/simulate for DY-9001...")
    sim_payload = {
        "project_id": "DY-9001",
        "interventions": {
            "payment_delay_days": 10
        }
    }
    sim_res = client.post("/api/v1/simulate", json=sim_payload)
    print(f"  Status Code: {sim_res.status_code}")
    print("--- POST /api/v1/simulate JSON RESPONSE ---")
    print(json.dumps(sim_res.json(), indent=2))
    print("-------------------------------------------")

    print("\n[4/5] Testing GET /api/v1/projects (dedupe verification)...")
    list_res = client.get("/api/v1/projects")
    projects_list = list_res.json()
    codes = [p["code"] for p in projects_list]
    print(f"  Total projects returned: {len(projects_list)}")
    print(f"  All project codes: {codes}")
    
    dy_count = codes.count("DY-9001")
    print(f"  Occurrences of 'DY-9001': {dy_count} (expected: 1)")
    
    duplicates = [c for c in set(codes) if codes.count(c) > 1]
    print(f"  Duplicate codes: {duplicates} (expected: None)")

    print("\n[5/5] Cleaning up throwaway test rows from Supabase...")
    supabase.table("billing_entries").delete().eq("project_id", p_id).execute()
    supabase.table("daily_entries").delete().eq("project_id", p_id).execute()
    supabase.table("projects").delete().eq("id", p_id).execute()

    # Confirm deletion
    verify_res = supabase.table("projects").select("*").eq("code", "DY-9001").execute()
    print(f"  Remaining rows in projects with code DY-9001: {len(verify_res.data)} (expected: 0)")
    assert len(verify_res.data) == 0, "Failed to clean up DY-9001 from Supabase!"
    print("  [SUCCESS] Cleanup confirmed. Database is in original state.")

if __name__ == "__main__":
    run_test()
