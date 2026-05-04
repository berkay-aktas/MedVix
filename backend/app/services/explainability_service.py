"""SHAP-based explainability service for Step 6."""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import shap
from sklearn.decomposition import PCA

from app.models.explainability import (
    AutoFindResponse,
    CounterfactualResponse,
    ExplainabilityResponse,
    FeatureImportanceItem,
    FeatureRange,
    PatientMapPoint,
    PatientMapResponse,
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
        try:
            return shap.TreeExplainer(model)
        except (ValueError, TypeError, Exception) as exc:
            # shap 0.46 + xgboost 2.x incompatibility — fall back
            logger.warning("TreeExplainer failed for %s (%s), falling back to KernelExplainer", model_type, exc)
            background = shap.sample(X_background, min(50, len(X_background)))
            predict_fn = model.predict_proba if hasattr(model, "predict_proba") else model.predict
            return shap.KernelExplainer(predict_fn, background)
    elif model_type in _LINEAR_MODELS:
        try:
            masker = shap.maskers.Independent(X_background[:100])
            return shap.LinearExplainer(model, masker)
        except Exception:
            background = shap.sample(X_background, min(50, len(X_background)))
            predict_fn = model.predict_proba if hasattr(model, "predict_proba") else model.predict
            return shap.KernelExplainer(predict_fn, background)
    else:
        # KernelExplainer for KNN, SVM, Naive Bayes
        background = shap.sample(X_background, min(50, len(X_background)))
        predict_fn = model.predict_proba if hasattr(model, "predict_proba") else model.predict
        return shap.KernelExplainer(predict_fn, background)


def _get_display_name(col_name: str, feature_descriptions: Dict[str, str], column_mapping: Optional[Dict[str, str]]) -> str:
    """Resolve a column name to its clinical display name."""
    name = None
    # Try direct match in feature_descriptions
    if col_name in feature_descriptions:
        name = feature_descriptions[col_name]
    # Try via column_mapping (user may have mapped columns in Step 2)
    if name is None and column_mapping:
        for mapped, original in column_mapping.items():
            if mapped == col_name and original in feature_descriptions:
                name = feature_descriptions[original]
    # Fallback: title-case the column name
    if name is None:
        name = col_name.replace("_", " ").title()
    return name


def _get_short_name(col_name: str, feature_descriptions: Dict[str, str], column_mapping: Optional[Dict[str, str]]) -> str:
    """Get a short clinical label suitable for chart axes (max ~30 chars)."""
    import re
    full = _get_display_name(col_name, feature_descriptions, column_mapping)
    # Strip parenthetical content like "(0 = normal, 1 = ...)"
    short = re.sub(r'\s*\(.*?\)', '', full).strip()
    # Truncate at 30 chars on word boundary
    if len(short) > 30:
        short = short[:28].rsplit(' ', 1)[0] + '...'
    return short


def _rebuild_model(session: SessionState, model_id: str, model_data: dict) -> Any:
    """Retrain a model from session data when model_objects is missing."""
    from app.services.ml_service import train_model

    model_type = model_data["model_type"]
    logger.info("Rebuilding model %s (%s) via train_model", model_id, model_type)

    # Use the existing train_model function which handles all edge cases
    # Pass empty hyperparams to use defaults (avoids serialization issues)
    train_model(session, model_type, {})

    # train_model stores the model object on session.model_objects
    # Find the model we just trained (it'll be the latest one)
    if session.model_objects:
        # Return the most recently added model object
        latest_id = list(session.model_objects.keys())[-1]
        model = session.model_objects[latest_id]
        # Also store under the original model_id for consistency
        if latest_id != model_id:
            session.model_objects[model_id] = model
        return model

    raise ValueError(f"Failed to rebuild model {model_type}.")


def compute_feature_importance(session: SessionState, requested_model_id: Optional[str] = None) -> Tuple[List[FeatureImportanceItem], List[PatientOption]]:
    """Compute global SHAP feature importance for the active model."""
    if not session.trained_models:
        raise ValueError("No trained models found. Complete Step 4 first.")

    # Use requested model or fall back to the most recent
    if requested_model_id and requested_model_id in session.trained_models:
        model_id = requested_model_id
    else:
        model_id = list(session.trained_models.keys())[-1]
    model_data = session.trained_models[model_id]
    model_type = model_data["model_type"]

    # Get or rebuild model object
    model = None
    obj_keys = list(session.model_objects.keys()) if session.model_objects else []
    logger.info("SHAP for model_id=%s, available model_objects=%s", model_id, obj_keys)
    if session.model_objects:
        model = session.model_objects.get(model_id)
    if model is None:
        logger.warning("Model object missing, rebuilding via train_model...")
        model = _rebuild_model(session, model_id, model_data)

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

    # Inverse-transform to get original-scale values for labels
    if hasattr(session, "scaler") and session.scaler is not None:
        X_test_raw = session.scaler.inverse_transform(X_test)
    else:
        X_test_raw = X_test

    # Pick 3 evenly spaced indices
    indices = [0, n // 3, min(2 * n // 3, n - 1)]
    if n < 3:
        indices = list(range(n))

    # Get sex_male_value from domain config
    subgroup_config = domain.subgroup_columns or {}
    male_val = subgroup_config.get("sex_male_value", 1)

    patients = []
    for idx in indices:
        row = X_test_raw[idx]
        # Build descriptive label from available features
        parts = [f"Patient #{idx + 1}"]

        # Try to find age and sex features
        for j, col in enumerate(feature_cols):
            col_lower = col.lower()
            if j < len(row):
                if "age" in col_lower:
                    parts.append(f"Age {int(round(row[j]))}")
                elif "sex" in col_lower or "gender" in col_lower:
                    val = int(round(row[j]))
                    parts.append("Male" if val == male_val else "Female")

        label = " — ".join(parts[:3])  # Limit to 3 parts
        patients.append(PatientOption(index=idx, label=label))

    return patients


def compute_waterfall(session: SessionState, model_id: str, patient_index: int) -> WaterfallResponse:
    """Compute single-patient SHAP waterfall explanation."""
    if model_id not in session.trained_models:
        raise ValueError(f"Model '{model_id}' not found in session.")

    model_data = session.trained_models[model_id]
    model_type = model_data["model_type"]

    # Get or rebuild model object
    model = None
    if session.model_objects:
        model = session.model_objects.get(model_id)
    if model is None:
        model = _rebuild_model(session, model_id, model_data)
    domain = get_domain_detail(session.domain_id)
    feature_cols = session.feature_columns or []

    X_test = session.X_test
    if patient_index < 0 or patient_index >= len(X_test):
        raise ValueError(f"Patient index {patient_index} out of range (0-{len(X_test)-1}).")

    patient = X_test[patient_index:patient_index + 1]

    # Get original-scale values for display labels
    if hasattr(session, "scaler") and session.scaler is not None:
        patient_raw = session.scaler.inverse_transform(patient)
    else:
        patient_raw = patient

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
            display = _get_short_name(col, domain.feature_descriptions, session.column_mapping)
            val = patient_raw[0][i] if i < patient_raw.shape[1] else 0
            # Format feature value nicely
            if isinstance(val, (float, np.floating)):
                if abs(val) >= 100:
                    val_str = str(int(round(val)))
                elif val == int(val):
                    val_str = str(int(val))
                else:
                    val_str = f"{val:.1f}"
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
    bars = bars[:6]  # Top 6 features for readability

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


def _find_feature_index(feature_cols: List[str], target: Optional[str]) -> int:
    """Locate a feature column by exact, then case-insensitive, name match."""
    if not target or not feature_cols:
        return -1
    if target in feature_cols:
        return feature_cols.index(target)
    target_lower = target.lower()
    for i, col in enumerate(feature_cols):
        if col.lower() == target_lower:
            return i
    return -1


def _short_patient_label(idx: int, row_raw: np.ndarray, feature_cols: List[str], male_val: int) -> str:
    """Build a short human-readable label, e.g. 'Patient #12 — Male, 63'."""
    parts = [f"Patient #{idx + 1}"]
    age_val = None
    sex_str = None
    for j, col in enumerate(feature_cols):
        if j >= len(row_raw):
            continue
        col_lower = col.lower()
        if age_val is None and "age" in col_lower:
            try:
                age_val = int(round(float(row_raw[j])))
            except (ValueError, TypeError):
                age_val = None
        elif sex_str is None and ("sex" in col_lower or "gender" in col_lower):
            try:
                sex_str = "Male" if int(round(float(row_raw[j]))) == male_val else "Female"
            except (ValueError, TypeError):
                sex_str = None
    extras = []
    if sex_str is not None:
        extras.append(sex_str)
    if age_val is not None:
        extras.append(f"{age_val} y")
    if extras:
        parts.append(", ".join(extras))
    return " — ".join(parts)


def compute_patient_map(session: SessionState, model_id: str) -> PatientMapResponse:
    """Project the test set into 2D via PCA, predict per-patient probabilities,
    and attach subgroup labels for the Step 6 risk-map scatter."""
    if not session.trained_models:
        raise ValueError("No trained models found. Complete Step 4 first.")
    if model_id not in session.trained_models:
        raise ValueError(f"Model '{model_id}' not found in session.")

    model_data = session.trained_models[model_id]
    model_type = model_data["model_type"]

    # Reuse model object retrieval / rebuild path from compute_waterfall
    model = None
    if session.model_objects:
        model = session.model_objects.get(model_id)
    if model is None:
        logger.warning("Model object missing for patient-map; rebuilding via train_model...")
        model = _rebuild_model(session, model_id, model_data)

    domain = get_domain_detail(session.domain_id)
    feature_cols = session.feature_columns or []

    X_train = session.X_train
    X_test = session.X_test
    y_test = getattr(session, "y_test", None)

    if X_test is None or len(X_test) == 0:
        raise ValueError("Test set is empty; cannot compute patient map.")

    # ------------- PCA: fit on training data, transform the test set -------------
    n_samples_train = X_train.shape[0] if X_train is not None else 0
    n_features = X_test.shape[1]
    n_components = min(2, n_features, n_samples_train if n_samples_train else n_features)
    if n_components < 2:
        # Degenerate: pad with zeros so the frontend always gets 2 axes
        coords = np.zeros((len(X_test), 2), dtype=float)
        explained_variance = [0.0, 0.0]
    else:
        pca = PCA(n_components=2, random_state=42)
        pca.fit(X_train)
        coords = pca.transform(X_test)
        explained_variance = [float(v) for v in pca.explained_variance_ratio_]

    # ------------- Probabilities & predicted classes -------------
    is_multiclass = False
    proba_matrix = None
    if hasattr(model, "predict_proba"):
        proba_matrix = model.predict_proba(X_test)
        if proba_matrix.ndim == 2 and proba_matrix.shape[1] > 2:
            is_multiclass = True
        elif proba_matrix.ndim != 2:
            proba_matrix = None

    if proba_matrix is None:
        # Fallback: use predict() and synthesise a confidence stand-in (0.5 default)
        preds = model.predict(X_test)
        positive_proba = np.full(len(X_test), 0.5, dtype=float)
        predicted_int = np.asarray(preds, dtype=int).ravel()
    else:
        if is_multiclass:
            positive_proba = np.max(proba_matrix, axis=1)
            predicted_int = np.argmax(proba_matrix, axis=1)
        else:
            # Binary: class-1 probability
            positive_proba = proba_matrix[:, 1] if proba_matrix.shape[1] >= 2 else proba_matrix.ravel()
            predicted_int = (positive_proba >= 0.5).astype(int)

    # Actual labels — if available on session
    if y_test is not None:
        actual_int = np.asarray(y_test, dtype=int).ravel()
    else:
        actual_int = None

    # ------------- Inverse-transform X_test for subgroup label resolution -------------
    if hasattr(session, "scaler") and session.scaler is not None:
        try:
            X_test_raw = session.scaler.inverse_transform(X_test)
        except Exception:
            X_test_raw = X_test
    else:
        X_test_raw = X_test

    # Resolve subgroup column indices from the domain config
    subgroup_config = domain.subgroup_columns or {}
    sex_col_name = subgroup_config.get("sex_column")
    sex_male_value = int(subgroup_config.get("sex_male_value", 1))
    age_col_name = subgroup_config.get("age_column")
    age_threshold = subgroup_config.get("age_threshold")

    sex_idx = _find_feature_index(feature_cols, sex_col_name) if sex_col_name else -1
    age_idx = _find_feature_index(feature_cols, age_col_name) if age_col_name else -1

    has_sex_subgroup = sex_idx >= 0
    has_age_subgroup = age_idx >= 0 and age_threshold is not None

    # ------------- Build per-patient points -------------
    points: List[PatientMapPoint] = []
    n_misclassified = 0
    for i in range(len(X_test)):
        row_raw = X_test_raw[i]

        # Subgroup labels
        sex_label: Optional[str] = None
        if has_sex_subgroup and sex_idx < len(row_raw):
            try:
                sex_label = "Male" if int(round(float(row_raw[sex_idx]))) == sex_male_value else "Female"
            except (ValueError, TypeError):
                sex_label = None

        age_label: Optional[str] = None
        if has_age_subgroup and age_idx < len(row_raw):
            try:
                age_val = float(row_raw[age_idx])
                age_label = f">={int(age_threshold)}" if age_val >= age_threshold else f"<{int(age_threshold)}"
            except (ValueError, TypeError):
                age_label = None

        # Class strings (consistent with WaterfallResponse for binary; raw label index for multiclass)
        if is_multiclass:
            predicted_class = str(int(predicted_int[i]))
            actual_class = str(int(actual_int[i])) if actual_int is not None else None
        else:
            predicted_class = "positive" if int(predicted_int[i]) == 1 else "negative"
            if actual_int is not None:
                actual_class = "positive" if int(actual_int[i]) == 1 else "negative"
            else:
                actual_class = None

        is_misc = bool(actual_class is not None and predicted_class != actual_class)
        if is_misc:
            n_misclassified += 1

        label = _short_patient_label(i, row_raw, feature_cols, sex_male_value)

        points.append(PatientMapPoint(
            index=i,
            x=round(float(coords[i, 0]), 4),
            y=round(float(coords[i, 1]), 4),
            probability=round(float(positive_proba[i]), 4),
            predicted_class=predicted_class,
            actual_class=actual_class,
            label=label,
            subgroup_sex=sex_label,
            subgroup_age=age_label,
            is_misclassified=is_misc,
            is_multiclass=is_multiclass,
        ))

    logger.info(
        "Patient map computed: %d points, %d misclassified (%.1f%%), explained_variance=%.3f / %.3f, multiclass=%s",
        len(points),
        n_misclassified,
        100.0 * n_misclassified / max(len(points), 1),
        explained_variance[0],
        explained_variance[1] if len(explained_variance) > 1 else 0.0,
        is_multiclass,
    )

    return PatientMapResponse(
        points=points,
        pca_explained_variance=explained_variance,
        has_sex_subgroup=has_sex_subgroup,
        has_age_subgroup=has_age_subgroup,
        domain_id=session.domain_id,
        is_multiclass=is_multiclass,
    )


# --- Counterfactual Explorer (Step 6 drill-down) ---------------------------


def _resolve_model_and_data(session: SessionState, model_id: str):
    """Common setup: validate model, get/rebuild model object, return (model, model_type, domain, feature_cols, has_scaler)."""
    if model_id not in session.trained_models:
        raise ValueError(f"Model '{model_id}' not found in session.")

    model_data = session.trained_models[model_id]
    model_type = model_data["model_type"]

    model = None
    if session.model_objects:
        model = session.model_objects.get(model_id)
    if model is None:
        model = _rebuild_model(session, model_id, model_data)

    domain = get_domain_detail(session.domain_id)
    feature_cols = session.feature_columns or []
    has_scaler = hasattr(session, "scaler") and session.scaler is not None
    return model, model_type, domain, feature_cols, has_scaler


def _predict_class_proba(model: Any, X_row: np.ndarray) -> Tuple[float, str, bool]:
    """Run predict_proba on a single-row matrix; return (probability, class_label, is_multiclass)."""
    if not hasattr(model, "predict_proba"):
        pred = model.predict(X_row)[0]
        return 0.5, ("positive" if int(pred) == 1 else "negative"), False

    proba = model.predict_proba(X_row)[0]
    is_multi = len(proba) > 2
    if is_multi:
        return float(np.max(proba)), str(int(np.argmax(proba))), True
    return float(proba[1]), ("positive" if proba[1] >= 0.5 else "negative"), False


def _build_feature_ranges(
    feature_cols: List[str],
    X_train_raw: np.ndarray,
    patient_raw: np.ndarray,
    domain,
    column_mapping,
) -> List[FeatureRange]:
    """Compute per-feature slider/toggle metadata from training-data percentiles."""
    ranges: List[FeatureRange] = []
    for i, col in enumerate(feature_cols):
        if i >= X_train_raw.shape[1]:
            continue
        col_values = X_train_raw[:, i]
        unique_vals = np.unique(col_values)
        is_binary = len(unique_vals) == 2
        display = _get_short_name(col, domain.feature_descriptions, column_mapping)

        if is_binary:
            min_v = float(np.min(unique_vals))
            max_v = float(np.max(unique_vals))
            feat_type = "binary"
        else:
            min_v = float(np.percentile(col_values, 1))
            max_v = float(np.percentile(col_values, 99))
            feat_type = "continuous"
            if max_v - min_v < 1e-6:
                min_v = float(np.min(col_values))
                max_v = float(np.max(col_values))
                if max_v - min_v < 1e-6:
                    max_v = min_v + 1.0

        current_value = float(patient_raw[0][i])
        # Clamp current value into [min_v, max_v] so sliders don't render with thumb out of bounds
        if not is_binary:
            current_value = max(min_v, min(max_v, current_value))

        ranges.append(FeatureRange(
            feature_name=col,
            display_name=display,
            feature_type=feat_type,
            min_value=round(min_v, 4),
            max_value=round(max_v, 4),
            current_value=round(current_value, 4),
        ))
    return ranges


def compute_counterfactual(
    session: SessionState,
    model_id: str,
    patient_index: int,
    feature_overrides: Optional[Dict[str, float]] = None,
) -> CounterfactualResponse:
    """Predict on a patient with optional feature overrides; always returns feature_ranges."""
    model, _, domain, feature_cols, has_scaler = _resolve_model_and_data(session, model_id)

    X_test = session.X_test
    if patient_index < 0 or patient_index >= len(X_test):
        raise ValueError(f"Patient index {patient_index} out of range (0-{len(X_test)-1}).")

    patient_scaled = X_test[patient_index:patient_index + 1]
    if has_scaler:
        patient_raw = session.scaler.inverse_transform(patient_scaled)
        X_train_raw = session.scaler.inverse_transform(session.X_train)
    else:
        patient_raw = patient_scaled.copy()
        X_train_raw = session.X_train

    feature_ranges = _build_feature_ranges(feature_cols, X_train_raw, patient_raw, domain, session.column_mapping)

    # Baseline (no overrides)
    baseline_prob, baseline_class, is_multiclass = _predict_class_proba(model, patient_scaled)

    # Apply overrides on a fresh copy of the original-scale row
    modified_raw = patient_raw.copy()
    if feature_overrides:
        for fname, new_val in feature_overrides.items():
            if fname in feature_cols:
                idx = feature_cols.index(fname)
                if idx < modified_raw.shape[1]:
                    try:
                        modified_raw[0][idx] = float(new_val)
                    except (TypeError, ValueError):
                        continue

    if has_scaler:
        modified_scaled = session.scaler.transform(modified_raw)
    else:
        modified_scaled = modified_raw

    new_prob, new_class, _ = _predict_class_proba(model, modified_scaled)

    if is_multiclass:
        pred_label = f"Class {new_class}"
    else:
        pred_label = "High risk" if new_class == "positive" else "Low risk"

    return CounterfactualResponse(
        probability=round(new_prob, 4),
        predicted_class=new_class,
        predicted_label=pred_label,
        baseline_probability=round(baseline_prob, 4),
        baseline_class=baseline_class,
        prediction_changed=(new_class != baseline_class),
        is_multiclass=is_multiclass,
        feature_ranges=feature_ranges,
    )


def _format_value(v: float) -> str:
    """Format a numeric feature value for human-readable explanation."""
    if abs(v) >= 100:
        return str(int(round(v)))
    if abs(v - round(v)) < 1e-6:
        return str(int(round(v)))
    return f"{v:.1f}"


def auto_find_counterfactual(
    session: SessionState,
    model_id: str,
    patient_index: int,
) -> AutoFindResponse:
    """Grid-search single-feature changes to find the smallest delta that flips the prediction class."""
    model, _, domain, feature_cols, has_scaler = _resolve_model_and_data(session, model_id)

    X_test = session.X_test
    if patient_index < 0 or patient_index >= len(X_test):
        raise ValueError(f"Patient index {patient_index} out of range (0-{len(X_test)-1}).")

    if not hasattr(model, "predict_proba"):
        return AutoFindResponse(
            success=False,
            baseline_probability=0.5,
            baseline_class="unknown",
            explanation="This model does not provide probability outputs; counterfactual auto-find is unavailable.",
        )

    patient_scaled = X_test[patient_index:patient_index + 1]
    if has_scaler:
        patient_raw = session.scaler.inverse_transform(patient_scaled)
        X_train_raw = session.scaler.inverse_transform(session.X_train)
    else:
        patient_raw = patient_scaled.copy()
        X_train_raw = session.X_train

    baseline_prob, baseline_class, is_multiclass = _predict_class_proba(model, patient_scaled)

    best: Optional[Dict[str, Any]] = None

    for i, col in enumerate(feature_cols):
        if i >= X_train_raw.shape[1]:
            continue
        col_values = X_train_raw[:, i]
        unique_vals = np.unique(col_values)
        is_binary = len(unique_vals) == 2
        original_val = float(patient_raw[0][i])

        if is_binary:
            other_val = float(unique_vals[0]) if abs(original_val - unique_vals[1]) < abs(original_val - unique_vals[0]) else float(unique_vals[1])
            candidates = [other_val]
        else:
            p1 = float(np.percentile(col_values, 1))
            p99 = float(np.percentile(col_values, 99))
            if p99 - p1 < 1e-6:
                continue
            candidates = list(np.linspace(p1, p99, 21))

        col_range = float(col_values.max() - col_values.min()) or 1.0

        for cand in candidates:
            if abs(cand - original_val) < 1e-9:
                continue
            modified = patient_raw.copy()
            modified[0][i] = float(cand)
            if has_scaler:
                modified_scaled = session.scaler.transform(modified)
            else:
                modified_scaled = modified
            new_prob, new_class, _ = _predict_class_proba(model, modified_scaled)

            if new_class != baseline_class:
                delta_abs = abs(cand - original_val)
                normalized_delta = delta_abs / col_range
                if best is None or normalized_delta < best["normalized_delta"]:
                    best = {
                        "feature_name": col,
                        "original_value": original_val,
                        "suggested_value": float(cand),
                        "delta": float(cand) - original_val,
                        "normalized_delta": normalized_delta,
                        "new_prob": new_prob,
                        "new_class": new_class,
                    }

    if best is None:
        return AutoFindResponse(
            success=False,
            baseline_probability=round(baseline_prob, 4),
            baseline_class=baseline_class,
            explanation="No single-feature change within the typical training range (1st–99th percentile) flips this prediction. The model is confident; try editing multiple features manually.",
        )

    display = _get_short_name(best["feature_name"], domain.feature_descriptions, session.column_mapping)
    direction = "raise" if best["delta"] > 0 else "lower"
    if is_multiclass:
        outcome = f"class {best['new_class']}"
    else:
        outcome = "high risk" if best["new_class"] == "positive" else "low risk"

    explanation = (
        f"{direction.capitalize()} {display} from {_format_value(best['original_value'])} "
        f"to {_format_value(best['suggested_value'])} "
        f"(change of {_format_value(abs(best['delta']))}) — prediction flips to {outcome}."
    )

    return AutoFindResponse(
        success=True,
        feature_name=best["feature_name"],
        display_name=display,
        original_value=round(best["original_value"], 4),
        suggested_value=round(best["suggested_value"], 4),
        delta=round(best["delta"], 4),
        baseline_probability=round(baseline_prob, 4),
        new_probability=round(best["new_prob"], 4),
        baseline_class=baseline_class,
        new_class=best["new_class"],
        explanation=explanation,
    )
