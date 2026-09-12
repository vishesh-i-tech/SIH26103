"""
PAIMANA AI — Infrastructure Risk Model Training & Evaluation Engine
Trains:
1. Model A (Baseline): Official CUF-style administrative fields only
2. Model B (Enhanced): Baseline + Contractor-side Ground Research Signals

Evaluates Classification (is_time_overrun) and Regression (risk_score).
Generates models/model_comparison.json and saves Model B + real SHAP TreeExplainer.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, r2_score, mean_absolute_error, mean_squared_error
)
from xgboost import XGBClassifier, XGBRegressor
import shap

def train_and_evaluate():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, "data", "historical_projects.csv")
    models_dir = os.path.join(script_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Run generate_dataset.py first.")

    print(f"[1/5] Loading historical dataset from {data_path}...")
    df = pd.read_csv(data_path)

    # Define Feature Sets
    # Model A: Baseline official government fields only
    cat_cols_a = ["sector"]
    num_cols_a = [
        "cost_original", "cost_revised", "duration_months",
        "elapsed_months", "planned_progress", "actual_progress"
    ]
    features_a = cat_cols_a + num_cols_a

    # Model B: Baseline + Ground-Research Friction Signals (Key PAIMANA AI Differentiator)
    cat_cols_b = ["sector", "land_clearance_status"]
    num_cols_b = [
        "cost_original", "cost_revised", "duration_months",
        "elapsed_months", "planned_progress", "actual_progress",
        "payment_delay_days", "subcontracting_depth",
        "design_scope_change_count", "billing_progress_mismatch_pct"
    ]
    features_b = cat_cols_b + num_cols_b

    # Targets
    y_clf = df["is_time_overrun"].values
    y_reg = df["risk_score"].values

    # 80/20 Train-Test Split (stratified on binary overrun target)
    train_idx, test_idx = train_test_split(
        np.arange(len(df)), test_size=0.20, random_state=42, stratify=y_clf
    )

    y_clf_train, y_clf_test = y_clf[train_idx], y_clf[test_idx]
    y_reg_train, y_reg_test = y_reg[train_idx], y_reg[test_idx]

    # Preprocessors
    preprocessor_a = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols_a),
            ("num", "passthrough", num_cols_a)
        ]
    )

    preprocessor_b = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols_b),
            ("num", "passthrough", num_cols_b)
        ]
    )

    print("[2/5] Fitting preprocessors and transforming feature spaces...")
    X_a_train = preprocessor_a.fit_transform(df.iloc[train_idx][features_a])
    X_a_test = preprocessor_a.transform(df.iloc[test_idx][features_a])

    X_b_train = preprocessor_b.fit_transform(df.iloc[train_idx][features_b])
    X_b_test = preprocessor_b.transform(df.iloc[test_idx][features_b])

    # Extract human-readable feature names for Model B
    cat_names_b = list(preprocessor_b.named_transformers_["cat"].get_feature_names_out(cat_cols_b))
    feature_names_b = cat_names_b + num_cols_b

    # -------------------------------------------------------------
    # MODEL A: BASELINE TRAINING
    # -------------------------------------------------------------
    print("[3/5] Training Model A (Baseline: Official Fields Only)...")
    clf_a = XGBClassifier(
        n_estimators=100, max_depth=4, learning_rate=0.08,
        subsample=0.85, colsample_bytree=0.85, random_state=42, eval_metric="logloss"
    )
    clf_a.fit(X_a_train, y_clf_train)

    reg_a = XGBRegressor(
        n_estimators=100, max_depth=4, learning_rate=0.08,
        subsample=0.85, colsample_bytree=0.85, random_state=42
    )
    reg_a.fit(X_a_train, y_reg_train)

    # Evaluate Model A
    pred_clf_a = clf_a.predict(X_a_test)
    prob_clf_a = clf_a.predict_proba(X_a_test)[:, 1]
    pred_reg_a = reg_a.predict(X_a_test)

    metrics_a = {
        "classification": {
            "accuracy": round(float(accuracy_score(y_clf_test, pred_clf_a)), 4),
            "precision": round(float(precision_score(y_clf_test, pred_clf_a)), 4),
            "recall": round(float(recall_score(y_clf_test, pred_clf_a)), 4),
            "f1_score": round(float(f1_score(y_clf_test, pred_clf_a)), 4),
            "roc_auc": round(float(roc_auc_score(y_clf_test, prob_clf_a)), 4),
        },
        "regression": {
            "r2_score": round(float(r2_score(y_reg_test, pred_reg_a)), 4),
            "mae": round(float(mean_absolute_error(y_reg_test, pred_reg_a)), 3),
            "rmse": round(float(np.sqrt(mean_squared_error(y_reg_test, pred_reg_a))), 3),
        }
    }

    # -------------------------------------------------------------
    # MODEL B: ENHANCED TRAINING (Baseline + Ground Research)
    # -------------------------------------------------------------
    print("[4/5] Training Model B (Enhanced: Baseline + Ground Friction Signals)...")
    clf_b = XGBClassifier(
        n_estimators=130, max_depth=5, learning_rate=0.07,
        subsample=0.85, colsample_bytree=0.85, random_state=42, eval_metric="logloss"
    )
    clf_b.fit(X_b_train, y_clf_train)

    reg_b = XGBRegressor(
        n_estimators=130, max_depth=5, learning_rate=0.07,
        subsample=0.85, colsample_bytree=0.85, random_state=42
    )
    reg_b.fit(X_b_train, y_reg_train)

    # Evaluate Model B
    pred_clf_b = clf_b.predict(X_b_test)
    prob_clf_b = clf_b.predict_proba(X_b_test)[:, 1]
    pred_reg_b = reg_b.predict(X_b_test)

    metrics_b = {
        "classification": {
            "accuracy": round(float(accuracy_score(y_clf_test, pred_clf_b)), 4),
            "precision": round(float(precision_score(y_clf_test, pred_clf_b)), 4),
            "recall": round(float(recall_score(y_clf_test, pred_clf_b)), 4),
            "f1_score": round(float(f1_score(y_clf_test, pred_clf_b)), 4),
            "roc_auc": round(float(roc_auc_score(y_clf_test, prob_clf_b)), 4),
        },
        "regression": {
            "r2_score": round(float(r2_score(y_reg_test, pred_reg_b)), 4),
            "mae": round(float(mean_absolute_error(y_reg_test, pred_reg_b)), 3),
            "rmse": round(float(np.sqrt(mean_squared_error(y_reg_test, pred_reg_b))), 3),
        }
    }

    # Compute Comparative Lift
    comparison = {
        "model_a_baseline": metrics_a,
        "model_b_enhanced": metrics_b,
        "lift": {
            "roc_auc_gain": round(metrics_b["classification"]["roc_auc"] - metrics_a["classification"]["roc_auc"], 4),
            "accuracy_gain": round(metrics_b["classification"]["accuracy"] - metrics_a["classification"]["accuracy"], 4),
            "r2_score_gain": round(metrics_b["regression"]["r2_score"] - metrics_a["regression"]["r2_score"], 4),
            "mae_reduction_points": round(metrics_a["regression"]["mae"] - metrics_b["regression"]["mae"], 3),
        }
    }

    # Save Comparison Metrics JSON
    comparison_path = os.path.join(models_dir, "model_comparison.json")
    with open(comparison_path, "w") as f:
        json.dump(comparison, f, indent=2)
    print(f"[OK] Model comparison saved to {comparison_path}")

    # -------------------------------------------------------------
    # FIT GENUINE SHAP TREE EXPLAINER ON MODEL B
    # -------------------------------------------------------------
    print("[5/5] Fitting genuine shap.TreeExplainer on Model B XGBRegressor...")
    explainer = shap.TreeExplainer(reg_b)
    
    # Test-execute SHAP computation to verify zero errors
    test_sample = X_b_test[:1]
    test_shap = explainer.shap_values(test_sample)
    assert test_shap.shape[1] == len(feature_names_b), "SHAP dimension mismatch!"
    print(f"[OK] Verified shap_values computation: output shape {test_shap.shape}")

    # Save Artifacts
    joblib.dump(clf_b, os.path.join(models_dir, "model_b_classifier.joblib"))
    joblib.dump(reg_b, os.path.join(models_dir, "model_b_regressor.joblib"))
    joblib.dump(preprocessor_b, os.path.join(models_dir, "model_b_preprocessor.joblib"))
    joblib.dump(feature_names_b, os.path.join(models_dir, "feature_names.joblib"))
    joblib.dump(explainer, os.path.join(models_dir, "shap_explainer.joblib"))

    print("[SUCCESS] All Model B artifacts & shap_explainer.joblib saved successfully.")
    return comparison

if __name__ == "__main__":
    comp = train_and_evaluate()
    print("\n" + "="*70)
    print("PAIMANA AI — MODEL A (BASELINE) vs MODEL B (ENHANCED) EVALUATION")
    print("="*70)
    print(f"{'Metric':<25} | {'Model A (Official)':<18} | {'Model B (+Ground Research)':<20} | {'Impact':<10}")
    print("-" * 78)
    print(f"{'Classifier ROC-AUC':<25} | {comp['model_a_baseline']['classification']['roc_auc']:<18} | {comp['model_b_enhanced']['classification']['roc_auc']:<20} | +{comp['lift']['roc_auc_gain']:.4f}")
    print(f"{'Classifier Accuracy':<25} | {comp['model_a_baseline']['classification']['accuracy']:<18} | {comp['model_b_enhanced']['classification']['accuracy']:<20} | +{comp['lift']['accuracy_gain']:.4f}")
    print(f"{'Classifier F1 Score':<25} | {comp['model_a_baseline']['classification']['f1_score']:<18} | {comp['model_b_enhanced']['classification']['f1_score']:<20} | ")
    print(f"{'Risk Regressor R²':<25} | {comp['model_a_baseline']['regression']['r2_score']:<18} | {comp['model_b_enhanced']['regression']['r2_score']:<20} | +{comp['lift']['r2_score_gain']:.4f}")
    print(f"{'Risk Regressor MAE':<25} | {comp['model_a_baseline']['regression']['mae']:<18} | {comp['model_b_enhanced']['regression']['mae']:<20} | -{comp['lift']['mae_reduction_points']:.3f} pts")
    print(f"{'Risk Regressor RMSE':<25} | {comp['model_a_baseline']['regression']['rmse']:<18} | {comp['model_b_enhanced']['regression']['rmse']:<20} | ")
    print("="*78)
