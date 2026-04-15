"""SHAP-based explainability service for Step 6."""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import shap

from app.models.explainability import (
    ExplainabilityResponse,
    FeatureImportanceItem,
    PatientOption,
    WaterfallBar,
    WaterfallResponse,
)
from app.models.session import SessionState
from app.services.domain_service import get_domain_detail

logger = logging.getLogger("medvix.explainability")

# Models that support TreeExplainer
_TREE_MODELS = {"decision_tree", "random_forest", "xgboost", "lightgbm"}
_LINEAR_MODELS = {"logistic_regression"}
# KNN, SVM, naive_bayes → KernelExplainer


def _get_explainer(model: Any, model_type: str, X_background: np.ndarray):
    """Select appropriate SHAP explainer based on model type."""
    if model_type in _TREE_MODELS:
        return shap.TreeExplainer(model)
    elif model_type in _LINEAR_MODELS:
        masker = shap.maskers.Independent(X_background[:100])
        return shap.LinearExplainer(model, masker)
    else:
        # KernelExplainer for KNN, SVM, Naive Bayes
        background = shap.sample(X_background, min(50, len(X_background)))
        predict_fn = model.predict_proba if hasattr(model, "predict_proba") else model.predict
        return shap.KernelExplainer(predict_fn, background)


def _get_display_name(col_name: str, feature_descriptions: Dict[str, str], column_mapping: Optional[Dict[str, str]]) -> str:
    """Resolve a column name to its clinical display name."""
    # Try direct match in feature_descriptions
    if col_name in feature_descriptions:
        return feature_descriptions[col_name]
    # Try via column_mapping (user may have mapped columns in Step 2)
    if column_mapping:
        for mapped, original in column_mapping.items():
            if mapped == col_name and original in feature_descriptions:
                return feature_descriptions[original]
    # Fallback: title-case the column name
    return col_name.replace("_", " ").title()


def compute_feature_importance(session: SessionState) -> Tuple[List[FeatureImportanceItem], List[PatientOption]]:
    """Compute global SHAP feature importance for the active model."""
    # Find the most recently trained model
    if not session.trained_models:
        raise ValueError("No trained models found. Complete Step 4 first.")
    if not session.model_objects:
        raise ValueError("Model objects not available. Please retrain the model.")

    model_id = list(session.trained_models.keys())[-1]
    model_data = session.trained_models[model_id]
    model_type = model_data["model_type"]
    model = session.model_objects.get(model_id)
    if model is None:
        raise ValueError(f"Fitted model object not found for {model_id}.")

    domain = get_domain_detail(session.domain_id)
    feature_cols = session.feature_columns or []

    X_train = session.X_train
    X_test = session.X_test

    # Compute SHAP values
    explainer = _get_explainer(model, model_type, X_train)

    # For slow explainers, limit test samples
    if model_type not in _TREE_MODELS and model_type not in _LINEAR_MODELS:
        X_explain = X_test[:min(50, len(X_test))]
    else:
        X_explain = X_test

    shap_values = explainer.shap_values(X_explain)

    # Handle multiclass (take mean across classes) or binary (take class 1)
    if isinstance(shap_values, list):
        # For binary classification, take class 1; multiclass, take mean abs
        if len(shap_values) == 2:
            sv = np.array(shap_values[1])
        else:
            sv = np.mean([np.abs(s) for s in shap_values], axis=0)
    else:
        sv = np.array(shap_values)
        if sv.ndim == 3:
            # (n_samples, n_features, n_classes) — take mean across classes
            sv = np.mean(np.abs(sv), axis=2)

    # Global importance = mean |SHAP value| per feature
    global_importance = np.mean(np.abs(sv), axis=0)

    # Normalise to [0, 1]
    max_imp = global_importance.max()
    if max_imp > 0:
        normalised = global_importance / max_imp
    else:
        normalised = global_importance

    # Build feature importance list
    items = []
    for i, col in enumerate(feature_cols):
        if i < len(normalised):
            display = _get_display_name(col, domain.feature_descriptions, session.column_mapping)
            items.append(FeatureImportanceItem(
                feature_name=col,
                display_name=display,
                importance=round(float(normalised[i]), 3),
            ))

    # Sort descending by importance
    items.sort(key=lambda x: x.importance, reverse=True)

    # Build patient options (3 patients from test set)
    patients = _build_patient_options(session, domain)

    return items, patients


def _build_patient_options(session: SessionState, domain) -> List[PatientOption]:
    """Pick 3 representative test patients for the dropdown."""
    X_test = session.X_test
    feature_cols = session.feature_columns or []
    n = len(X_test)
    if n == 0:
        return []

    # Pick 3 evenly spaced indices
    indices = [0, n // 3, min(2 * n // 3, n - 1)]
    if n < 3:
        indices = list(range(n))

    patients = []
    for idx in indices:
        row = X_test[idx]
        # Build descriptive label from available features
        parts = [f"Patient #{idx + 1}"]

        # Try to find age and sex features
        for j, col in enumerate(feature_cols):
            col_lower = col.lower()
            if j < len(row):
                if "age" in col_lower:
                    parts.append(f"Age {int(row[j])}")
                elif "sex" in col_lower or "gender" in col_lower:
                    val = int(row[j])
                    parts.append("Male" if val == 1 else "Female")

        label = " — ".join(parts[:3])  # Limit to 3 parts
        patients.append(PatientOption(index=idx, label=label))

    return patients


def compute_waterfall(session: SessionState, model_id: str, patient_index: int) -> WaterfallResponse:
    """Compute single-patient SHAP waterfall explanation."""
    if model_id not in session.trained_models:
        raise ValueError(f"Model '{model_id}' not found in session.")
    if model_id not in session.model_objects:
        raise ValueError("Fitted model object not available. Please retrain.")

    model_data = session.trained_models[model_id]
    model_type = model_data["model_type"]
    model = session.model_objects[model_id]
    domain = get_domain_detail(session.domain_id)
    feature_cols = session.feature_columns or []

    X_test = session.X_test
    if patient_index < 0 or patient_index >= len(X_test):
        raise ValueError(f"Patient index {patient_index} out of range (0-{len(X_test)-1}).")

    patient = X_test[patient_index:patient_index + 1]

    # Compute SHAP for single patient
    explainer = _get_explainer(model, model_type, session.X_train)
    shap_values = explainer.shap_values(patient)

    # Handle list output (binary/multiclass)
    if isinstance(shap_values, list):
        sv = np.array(shap_values[1] if len(shap_values) == 2 else shap_values[0])
    else:
        sv = np.array(shap_values)
        if sv.ndim == 3:
            sv = sv[:, :, 1] if sv.shape[2] == 2 else sv[:, :, 0]

    sv = sv.flatten()

    # Get base value
    if hasattr(explainer, "expected_value"):
        base = explainer.expected_value
        if isinstance(base, (list, np.ndarray)):
            base = float(base[1] if len(base) == 2 else base[0])
        else:
            base = float(base)
    else:
        base = 0.5

    # Get prediction probability
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(patient)[0]
        final_prob = float(proba[1] if len(proba) == 2 else max(proba))
    else:
        final_prob = float(base + sv.sum())

    # Build bars sorted by absolute SHAP value
    bars = []
    for i, col in enumerate(feature_cols):
        if i < len(sv):
            display = _get_display_name(col, domain.feature_descriptions, session.column_mapping)
            val = patient[0][i] if i < patient.shape[1] else 0
            # Format feature value nicely
            if isinstance(val, (float, np.floating)):
                if val == int(val):
                    val_str = str(int(val))
                else:
                    val_str = f"{val:.2f}"
            else:
                val_str = str(val)

            bars.append(WaterfallBar(
                feature_name=col,
                display_name=display,
                shap_value=round(float(sv[i]), 4),
                feature_value=val_str,
                direction="risk" if sv[i] > 0 else "protective",
            ))

    bars.sort(key=lambda x: abs(x.shap_value), reverse=True)
    bars = bars[:8]  # Top 8 features

    # Determine prediction label
    pred_label = "High Risk" if final_prob >= 0.5 else "Low Risk"
    pred_class = "positive" if final_prob >= 0.5 else "negative"

    # Build summary text
    top_risk = [b for b in bars[:3] if b.direction == "risk"]
    top_protective = [b for b in bars[:3] if b.direction == "protective"]

    summary_parts = []
    summary_parts.append(f"This patient has a {final_prob*100:.0f}% predicted risk.")
    if top_risk:
        risk_names = ", ".join(b.display_name.lower() for b in top_risk)
        summary_parts.append(f"Primary risk factors: {risk_names}.")
    if top_protective:
        safe_names = ", ".join(b.display_name.lower() for b in top_protective)
        summary_parts.append(f"Protective factors: {safe_names}.")

    return WaterfallResponse(
        bars=bars,
        base_probability=round(base, 4),
        final_probability=round(final_prob, 4),
        prediction_label=pred_label,
        prediction_class=pred_class,
        summary_text=" ".join(summary_parts),
    )
