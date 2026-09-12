"""
PAIMANA AI — Real SHAP Explainability Engine
Loads fitted TreeExplainer and Model B artifacts to compute genuine SHAP
attributions for any project dictionary.

CRITICAL HARD CONSTRAINT:
Every factor returned traces directly to an actual `explainer.shap_values()`
computation. No disguised if/else approximations.

Reconciliation Guarantee:
base_value + sum(all_shap_values) == raw_prediction (exact to floating precision).

Dual-Mode Attribution:
1. High-Risk Projects (pred >= base_value): Top positive factors (Risk Escalation Drivers)
2. Low-Risk/Stable Projects (pred < base_value): Top negative factors (Protective/Stabilizing Factors)
"""

import os
import joblib
import numpy as np
import pandas as pd

# Mappings for Risk Drivers (when feature pushes risk score UP, SHAP > 0)
FEATURE_MAP_RISK = {
    "billing_progress_mismatch_pct": "Disproportionate expenditure burn outpacing verified physical progress",
    "land_clearance_status_Disputed": "Statutory right-of-way and land acquisition legal disputes",
    "land_clearance_status_Pending": "Pending statutory land and forest clearance along project alignment",
    "payment_delay_days": "Ministry / agency payment disbursement lag impacting contractor liquidity",
    "subcontracting_depth": "Excessive multi-tier subcontracting fragmentation & wage bottlenecks",
    "design_scope_change_count": "Frequent structural alignment and engineering scope revisions",
    "planned_progress": "High planned schedule targets outpacing current execution rate",
    "actual_progress": "Ground physical execution milestone deficit",
    "cost_revised": "Cumulative cost drift and sanctioned budget overrun",
    "cost_original": "High capital scale exposure and contract baseline variance",
    "duration_months": "Extended multi-year timeline increasing execution risk exposure",
    "elapsed_months": "Project lifecycle maturity approaching critical commissioning window",
    "sector_Bridges": "Hydrological and deep substructure geotechnical complexity (Bridges)",
    "sector_Railways": "Track possession block allotment and safety clearance backlog (Railways)",
    "sector_Roads": "Linear corridor utility relocation and quarry supply logistics (Roads)",
    "sector_Power": "Grid synchronization delay and tower stub right-of-way (Power)",
    "land_clearance_status_Clear": "Residual right-of-way demarcation encumbrance",
}

# Mappings for Protective Factors (when feature pulls risk score DOWN, SHAP < 0)
FEATURE_MAP_PROTECTIVE = {
    "payment_delay_days": "Prompt ministry payment disbursements sustaining contractor liquidity",
    "billing_progress_mismatch_pct": "Expenditure strictly disciplined and aligned with physical execution",
    "design_scope_change_count": "Stable engineering design with zero disruptive scope revisions",
    "land_clearance_status_Clear": "100% encumbrance-free right-of-way with cleared land acquisition",
    "subcontracting_depth": "Direct single-tier EPC structure ensuring direct operational control",
    "land_clearance_status_Disputed": "Absence of land acquisition or right-of-way litigation",
    "actual_progress": "High physical execution momentum and robust ground delivery",
    "planned_progress": "Realistic and well-calibrated milestone schedule baseline",
    "cost_original": "Manageable capital package scale reducing contractual exposure",
    "cost_revised": "Strict capital discipline within original sanctioned budget",
    "land_clearance_status_Pending": "Zero pending environmental clearances along corridor",
    "sector_Railways": "Dedicated freight corridor alignment free of mixed-traffic congestion",
    "sector_Roads": "Streamlined highway alignment with direct aggregate quarry access",
    "sector_Bridges": "Proven pier foundation geology with sound geotechnical baseline",
    "sector_Power": "Pre-cleared substation substation interconnects and right-of-way",
    "duration_months": "Optimized project schedule with sufficient buffer allowances",
    "elapsed_months": "Early-to-mid project stage execution with full mobilization buffer",
}

# Cache models in memory to avoid repeated disk reads
_ARTIFACTS = None

def load_explain_artifacts():
    global _ARTIFACTS
    if _ARTIFACTS is not None:
        return _ARTIFACTS

    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, "models")

    regressor_path = os.path.join(models_dir, "model_b_regressor.joblib")
    classifier_path = os.path.join(models_dir, "model_b_classifier.joblib")
    preprocessor_path = os.path.join(models_dir, "model_b_preprocessor.joblib")
    explainer_path = os.path.join(models_dir, "shap_explainer.joblib")
    features_path = os.path.join(models_dir, "feature_names.joblib")

    for p in [regressor_path, classifier_path, preprocessor_path, explainer_path, features_path]:
        if not os.path.exists(p):
            raise FileNotFoundError(f"Missing model artifact at {p}. Run train_engine.py first.")

    regressor = joblib.load(regressor_path)
    classifier = joblib.load(classifier_path)
    preprocessor = joblib.load(preprocessor_path)
    explainer = joblib.load(explainer_path)
    feature_names = joblib.load(features_path)

    _ARTIFACTS = {
        "regressor": regressor,
        "classifier": classifier,
        "preprocessor": preprocessor,
        "explainer": explainer,
        "feature_names": feature_names,
    }
    return _ARTIFACTS

def _project_dict_to_dataframe(project_dict):
    """Normalize and format a single project dictionary into the Model B input DataFrame."""
    cost_orig = float(project_dict.get("cost_original") or project_dict.get("costOriginal") or 500.0)
    cost_rev = float(project_dict.get("cost_revised") or project_dict.get("costRevised") or cost_orig)
    dur = int(project_dict.get("duration_months") or project_dict.get("duration") or 36)
    
    elapsed = project_dict.get("elapsed_months")
    if elapsed is None:
        planned = float(project_dict.get("planned_progress") or project_dict.get("planned") or 0.0)
        elapsed = int(max(3, round((planned / 100.0) * dur)))
    else:
        elapsed = int(elapsed)

    planned_prog = float(project_dict.get("planned_progress") or project_dict.get("planned") or 0.0)
    actual_prog = float(project_dict.get("actual_progress") or project_dict.get("actual") or 0.0)

    payment_delay = float(project_dict.get("payment_delay_days", 25.0))
    subcontract_depth = int(project_dict.get("subcontracting_depth", 1))
    land_status = str(project_dict.get("land_clearance_status", "Pending"))
    scope_changes = int(project_dict.get("design_scope_change_count", 1))
    mismatch_pct = float(project_dict.get("billing_progress_mismatch_pct", 3.0))

    row = {
        "sector": str(project_dict.get("sector") or "Roads"),
        "land_clearance_status": land_status if land_status in ["Clear", "Pending", "Disputed"] else "Pending",
        "cost_original": cost_orig,
        "cost_revised": cost_rev,
        "duration_months": dur,
        "elapsed_months": elapsed,
        "planned_progress": planned_prog,
        "actual_progress": actual_prog,
        "payment_delay_days": payment_delay,
        "subcontracting_depth": subcontract_depth,
        "design_scope_change_count": scope_changes,
        "billing_progress_mismatch_pct": mismatch_pct,
    }

    return pd.DataFrame([row])

def predict_project_risk(project_dict):
    """Predict continuous risk_score (0-100) and time overrun probability."""
    artifacts = load_explain_artifacts()
    df_single = _project_dict_to_dataframe(project_dict)
    
    X_proc = artifacts["preprocessor"].transform(df_single)
    pred_risk = float(artifacts["regressor"].predict(X_proc)[0])
    risk_score = int(np.clip(round(pred_risk), 5, 95))

    prob_overrun = float(artifacts["classifier"].predict_proba(X_proc)[0, 1])

    return {
        "risk_score": risk_score,
        "time_overrun_probability": round(prob_overrun, 3),
        "raw_prediction": round(pred_risk, 2),
    }

def explain_project_with_reconciliation(project_dict, top_n=4):
    """
    Computes genuine SHAP values and returns full mathematical reconciliation:
    base_value + sum(all_shap_values) == raw_prediction
    
    Returns:
      {
        "raw_prediction": float,
        "risk_score": int,
        "base_value": float,
        "sum_all_shap": float,
        "reconciled_prediction": float,
        "is_reconciled": bool,
        "mode": "risk_escalation" | "protective_stabilizing",
        "factors": [{"factor_text": str, "weight": int, "_shap_value": float, "_feature": str}, ...]
      }
    """
    artifacts = load_explain_artifacts()
    df_single = _project_dict_to_dataframe(project_dict)

    # 1. Transform features
    X_proc = artifacts["preprocessor"].transform(df_single)
    feature_names = artifacts["feature_names"]

    # 2. Compute true model prediction
    raw_pred = float(artifacts["regressor"].predict(X_proc)[0])
    risk_score = int(np.clip(round(raw_pred), 5, 95))

    # 3. Compute ACTUAL SHAP values via TreeExplainer
    shap_vals = artifacts["explainer"].shap_values(X_proc)
    
    if isinstance(shap_vals, list):
        vals = np.array(shap_vals[0]).flatten()
    elif hasattr(shap_vals, "values"):
        vals = np.array(shap_vals.values).flatten()
    else:
        vals = np.array(shap_vals).flatten()

    base_val = float(
        artifacts["explainer"].expected_value
        if not isinstance(artifacts["explainer"].expected_value, (list, np.ndarray))
        else artifacts["explainer"].expected_value[0]
    )

    sum_all_shap = float(np.sum(vals))
    reconciled_pred = float(base_val + sum_all_shap)
    is_reconciled = bool(abs(reconciled_pred - raw_pred) < 1e-4)

    # Determine whether project is pushed above or pulled below the base value
    is_high_risk = raw_pred >= base_val

    feature_shap = []
    if is_high_risk:
        # High Risk Mode: Show top positive drivers (pushing risk UP)
        mode = "risk_escalation"
        for name, val in zip(feature_names, vals):
            readable = FEATURE_MAP_RISK.get(name, name.replace("_", " ").title())
            feature_shap.append({
                "feature": name,
                "factor_text": readable,
                "shap_value": float(val),
            })
        # Sort descending by positive impact
        candidates = [f for f in feature_shap if f["shap_value"] > 0]
        candidates.sort(key=lambda x: x["shap_value"], reverse=True)
    else:
        # Low Risk / Stable Mode: Show top negative drivers (pulling risk DOWN / protective)
        mode = "protective_stabilizing"
        for name, val in zip(feature_names, vals):
            readable = FEATURE_MAP_PROTECTIVE.get(name, f"Favorable {name.replace('_', ' ')}")
            feature_shap.append({
                "feature": name,
                "factor_text": readable,
                "shap_value": float(val),
            })
        # Sort ascending by most negative impact (largest protective reduction)
        candidates = [f for f in feature_shap if f["shap_value"] < 0]
        candidates.sort(key=lambda x: x["shap_value"])

    # Fallback if fewer than top_n candidates in preferred direction
    if len(candidates) >= top_n:
        selected = candidates[:top_n]
    else:
        all_sorted = sorted(feature_shap, key=lambda x: abs(x["shap_value"]), reverse=True)
        selected = all_sorted[:top_n]

    # Normalize SHAP magnitudes to sum to exactly 100%
    total_val = sum(max(0.001, abs(s["shap_value"])) for s in selected)
    raw_weights = [round((max(0.001, abs(s["shap_value"])) / total_val) * 100) for s in selected]

    # Reconcile integer rounding to sum exactly to 100
    diff = 100 - sum(raw_weights)
    if raw_weights:
        raw_weights[0] += diff

    factors = []
    for s, w in zip(selected, raw_weights):
        factors.append({
            "factor_text": s["factor_text"],
            "weight": int(w),
            "_shap_value": round(s["shap_value"], 3),
            "_feature": s["feature"],
        })

    return {
        "raw_prediction": round(raw_pred, 3),
        "risk_score": risk_score,
        "base_value": round(base_val, 3),
        "sum_all_shap": round(sum_all_shap, 3),
        "reconciled_prediction": round(reconciled_pred, 3),
        "is_reconciled": is_reconciled,
        "diff": float(abs(reconciled_pred - raw_pred)),
        "mode": mode,
        "factors": factors,
    }

def compute_real_shap_factors(project_dict, top_n=4):
    """
    Returns exactly [{"factor_text": str, "weight": int}, ...] matching `risk_factors` table schema.
    Traced directly to genuine SHAP attribution.
    """
    res = explain_project_with_reconciliation(project_dict, top_n=top_n)
    return res["factors"]

if __name__ == "__main__":
    print("="*78)
    print("PAIMANA AI — MATHEMATICAL SHAP RECONCILIATION & FACTOR ATTRIBUTION")
    print("="*78)

    import sys
    _script_dir = os.path.dirname(os.path.abspath(__file__))
    if _script_dir not in sys.path:
        sys.path.insert(0, _script_dir)
    from data.mock_source import get_mock_project_by_id

    # 1. HIGH-RISK SAMPLE PROJECT: NH-4471 (Indore-Betul Highway Widening)
    p_high = get_mock_project_by_id("NH-4471")
    res_high = explain_project_with_reconciliation(p_high)

    print(f"\n[CASE 1: HIGH-RISK PROJECT] {p_high['name']} ({p_high['code']})")
    print(f"Status: Planned={p_high['planned_progress']}%, Actual={p_high['actual_progress']}%, Land={p_high['land_clearance_status']}, Payment Lag={p_high['payment_delay_days']}d")
    print(f"Mathematical Reconciliation:")
    print(f"  Base Value (E[X])          : {res_high['base_value']:+.3f}")
    print(f"  Sum of ALL 17 SHAP Values  : {res_high['sum_all_shap']:+.3f}")
    print(f"  Reconciled Sum             : {res_high['base_value'] + res_high['sum_all_shap']:.3f}")
    print(f"  Actual Model Output f(x)   : {res_high['raw_prediction']:.3f}")
    print(f"  Exact Math Reconciled?     : {res_high['is_reconciled']} (Diff = {res_high['diff']:.6f})")
    print(f"  Final Risk Score (0-100)   : {res_high['risk_score']} (Mode: {res_high['mode']})")
    print("Top Risk Escalation Drivers (risk_factors table):")
    for idx, f in enumerate(res_high["factors"], 1):
        print(f"  {idx}. [{f['weight']}%] {f['factor_text']}")
        print(f"      Feature: {f['_feature']} -> SHAP: +{f['_shap_value']} pts")

    print("\n" + "-"*78)

    # 2. LOW-RISK / STABLE SAMPLE PROJECT: RW-8802 (Bhopal-Itarsi Rail Doubling)
    p_low = get_mock_project_by_id("RW-8802")
    res_low = explain_project_with_reconciliation(p_low)

    print(f"\n[CASE 2: LOW-RISK PROJECT] {p_low['name']} ({p_low['code']})")
    print(f"Status: Planned={p_low['planned_progress']}%, Actual={p_low['actual_progress']}%, Land={p_low['land_clearance_status']}, Payment Lag={p_low['payment_delay_days']}d")
    print(f"Mathematical Reconciliation:")
    print(f"  Base Value (E[X])          : {res_low['base_value']:+.3f}")
    print(f"  Sum of ALL 17 SHAP Values  : {res_low['sum_all_shap']:+.3f} (Net risk reduction)")
    print(f"  Reconciled Sum             : {res_low['base_value'] + res_low['sum_all_shap']:.3f}")
    print(f"  Actual Model Output f(x)   : {res_low['raw_prediction']:.3f}")
    print(f"  Exact Math Reconciled?     : {res_low['is_reconciled']} (Diff = {res_low['diff']:.6f})")
    print(f"  Final Risk Score (0-100)   : {res_low['risk_score']} (Mode: {res_low['mode']})")
    print("Top Protective / Stabilizing Factors (Why project is on track):")
    for idx, f in enumerate(res_low["factors"], 1):
        print(f"  {idx}. [{f['weight']}%] {f['factor_text']}")
        print(f"      Feature: {f['_feature']} -> SHAP: {f['_shap_value']} pts")

    print("="*78)
