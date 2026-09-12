"""
PAIMANA AI — Synthetic Historical Project Dataset Generator
MoSPI Central Sector Infrastructure Monitoring (₹150 Cr+)

Generates realistic dataset encoded with contractor-side ground friction variables:
1. Baseline/CUF Official fields: sector, cost, duration, elapsed, planned vs actual progress
2. Ground-research fields: payment_delay_days, subcontracting_depth, land_clearance_status,
   design_scope_change_count, billing_progress_mismatch_pct
3. Ground-truth targets: is_cost_overrun, is_time_overrun, risk_score (0-100)
"""

import os
import numpy as np
import pandas as pd

def generate_historical_dataset(n_samples=1200, random_state=42):
    np.random.seed(random_state)

    sectors = ["Roads", "Bridges", "Railways", "Power"]
    sector_weights = [0.40, 0.20, 0.25, 0.15]
    
    land_statuses = ["Clear", "Pending", "Disputed"]
    land_weights = [0.45, 0.35, 0.20]

    contractor_pool = [
        "Larsen & Toubro Infra", "Tata Projects Ltd.", "Afcons Infrastructure",
        "Shivalik Infraprojects Ltd.", "Ganga Construction Co.", "Dilip Buildcon Ltd.",
        "Eastern Rail Infra Pvt. Ltd.", "Vindhya Powergrid Ltd.", "Omkar Roadways Ltd.",
        "Bharat Rail Consortium", "Himalayan Infra Engineering", "Desert Sun Powergrid JV",
        "Apex Bullet Infra Ltd.", "Patel Engineering", "NCC Infrastructure"
    ]

    records = []

    for i in range(n_samples):
        proj_idx = i + 1
        sector = np.random.choice(sectors, p=sector_weights)
        prefix = {"Roads": "NH", "Bridges": "BR", "Railways": "RW", "Power": "PW"}[sector]
        code = f"{prefix}-{1000 + proj_idx}"
        contractor = np.random.choice(contractor_pool)

        # Baseline timeline and cost (Central sector projects ₹150 Cr - ₹3,500 Cr)
        cost_original = float(np.round(np.random.gamma(shape=3.5, scale=180.0) + 150.0, 1))
        duration_months = int(np.random.choice([18, 24, 30, 36, 42, 48, 60], p=[0.1, 0.2, 0.2, 0.25, 0.1, 0.1, 0.05]))
        
        # Project execution progress timeline
        elapsed_fraction = np.random.uniform(0.15, 0.95)
        elapsed_months = int(np.clip(np.round(elapsed_fraction * duration_months), 3, duration_months))
        planned_progress = float(np.round(np.clip(elapsed_fraction * 100.0 + np.random.normal(0, 3), 5, 95), 1))

        # Ground-Research Fields (Hidden Contractor-Side Friction Signals)
        # Payment disbursement delay from nodal ministry/agency (days)
        # Bimodal distribution: 60% on-time/minor delay (10-35 days), 40% severe contractor liquidity delay (45-160 days)
        if np.random.rand() < 0.60:
            payment_delay_days = float(np.round(np.random.uniform(10.0, 35.0), 1))
        else:
            payment_delay_days = float(np.round(np.random.uniform(45.0, 150.0), 1))
        
        # Subcontracting tiers (0: Direct EPC, 1: First tier sub, 2: Petty multi-tier fragmentation)
        subcontracting_depth = int(np.random.choice([0, 1, 2], p=[0.35, 0.45, 0.20]))
        
        # Land acquisition & statutory clearance
        land_clearance_status = np.random.choice(land_statuses, p=land_weights)
        
        # Design & alignment scope changes during execution
        design_scope_change_count = int(np.random.choice([0, 1, 2, 3, 4, 5], p=[0.40, 0.25, 0.15, 0.10, 0.06, 0.04]))
        
        # Billing progress mismatch: (Claimed billing % - Actual physical execution %)
        billing_progress_mismatch_pct = float(np.round(
            np.random.normal(loc=2.0 + (subcontracting_depth * 3.0), scale=4.5), 1
        ))

        # --- Encoded Realistic Physics / Correlation Logic ---
        # Ground friction index that aggregates real operational impediments
        land_friction = 28.0 if land_clearance_status == "Disputed" else (10.0 if land_clearance_status == "Pending" else 0.0)
        payment_friction = max(0.0, (payment_delay_days - 25.0) / 40.0) * 12.0
        subcontract_friction = subcontracting_depth * 6.5
        scope_friction = design_scope_change_count * 3.5
        mismatch_friction = max(0.0, billing_progress_mismatch_pct) * 0.7

        total_friction = land_friction + payment_friction + subcontract_friction + scope_friction + mismatch_friction
        
        # Actual progress: well-run projects track planned progress closely; friction introduces schedule lag
        progress_lag_nominal = total_friction * 0.40 + np.random.normal(0, 2.5)
        actual_progress = float(np.round(np.clip(planned_progress - max(0.0, progress_lag_nominal), 0.0, 100.0), 1))
        realized_progress_lag = float(np.round(planned_progress - actual_progress, 1))

        # Cost revisions (Escalations driven by scope changes, time delays, and billing mismatches)
        cost_escalation_pct = max(0.0, (
            (realized_progress_lag * 0.28) + 
            (design_scope_change_count * 2.2) + 
            (max(0.0, billing_progress_mismatch_pct) * 0.3) + 
            np.random.normal(0, 2.0)
        ))
        cost_revised = float(np.round(cost_original * (1.0 + cost_escalation_pct / 100.0), 1))
        cost_burn_ratio = float(np.round(cost_revised / cost_original, 3))

        # Targets:
        is_cost_overrun = int(cost_burn_ratio >= 1.08)
        
        # Time overrun indicator: whether project schedule slippage exceeds critical tolerance (>= 12% lag)
        is_time_overrun = int(realized_progress_lag >= 12.0 or (realized_progress_lag >= 8.0 and elapsed_months >= duration_months * 0.75))

        # Composite Ground-Truth Risk Score (0-100)
        # Base healthy execution sits at ~20-25
        risk_components = (
            np.clip(realized_progress_lag * 1.5, 0, 40) +
            np.clip((cost_burn_ratio - 1.0) * 140.0, 0, 25) +
            np.clip((total_friction / 50.0) * 25.0, 0, 25) +
            np.clip(max(0.0, billing_progress_mismatch_pct) * 0.8, 0, 10)
        )
        risk_raw = 16.0 + risk_components + np.random.normal(0, 2.5)
        risk_score = int(np.clip(np.round(risk_raw), 10, 95))

        records.append({
            "project_code": code,
            "sector": sector,
            "contractor": contractor,
            "cost_original": cost_original,
            "cost_revised": cost_revised,
            "duration_months": duration_months,
            "elapsed_months": elapsed_months,
            "planned_progress": planned_progress,
            "actual_progress": actual_progress,
            "payment_delay_days": payment_delay_days,
            "subcontracting_depth": subcontracting_depth,
            "land_clearance_status": land_clearance_status,
            "design_scope_change_count": design_scope_change_count,
            "billing_progress_mismatch_pct": billing_progress_mismatch_pct,
            "is_cost_overrun": is_cost_overrun,
            "is_time_overrun": is_time_overrun,
            "risk_score": risk_score
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "historical_projects.csv")

    print(f"Generating 1,200 synthetic historical infrastructure projects...")
    df = generate_historical_dataset(n_samples=1200, random_state=42)
    df.to_csv(out_path, index=False)
    
    print(f"[OK] Saved {len(df)} records to {out_path}")
    print("\nDataset Summary Statistics:")
    print(f"- Sectors: {dict(df['sector'].value_counts())}")
    print(f"- Cost Original (₹ Cr): Mean={df['cost_original'].mean():.1f}, Min={df['cost_original'].min():.1f}, Max={df['cost_original'].max():.1f}")
    print(f"- Time Overrun %: {df['is_time_overrun'].mean()*100:.1f}%")
    print(f"- Cost Overrun %: {df['is_cost_overrun'].mean()*100:.1f}%")
    print(f"- Mean Risk Score: {df['risk_score'].mean():.1f} (Std={df['risk_score'].std():.1f})")
    print("\nFirst 5 Records Sample:")
    print(df.head(5)[["project_code", "sector", "planned_progress", "actual_progress", "payment_delay_days", "land_clearance_status", "risk_score", "is_time_overrun"]].to_string())
