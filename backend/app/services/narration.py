"""Plain-English narration of session state for the Step 7 receipt.

All functions are pure templating — no LLM, no external calls. Each takes a
piece of session/bias state and returns a sentence (or empty string when the
piece is missing). `narrate_session()` composes them into a single paragraph.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from app.models.ethics import BiasAnalysisResponse
from app.models.session import SessionState
from app.services.domain_service import get_domain_detail


_MODEL_DISPLAY_NAMES = {
    "knn": "K-Nearest Neighbours",
    "svm": "Support Vector Machine",
    "decision_tree": "Decision Tree",
    "random_forest": "Random Forest",
    "logistic_regression": "Logistic Regression",
    "naive_bayes": "Naive Bayes",
    "xgboost": "XGBoost",
    "lightgbm": "LightGBM",
}

_MISSING_PHRASES = {
    "median": "filled using the median strategy",
    "mean": "filled using the mean strategy",
    "mode": "filled using the most-frequent value",
    "remove": "removed (rows with missing values dropped)",
}

_NORMALISATION_PHRASES = {
    "zscore": "z-score standardised",
    "minmax": "min-max normalised",
    "none": "kept on their original scale",
}


def _model_display_name(model_type: str, fallback: Optional[str] = None) -> str:
    if model_type in _MODEL_DISPLAY_NAMES:
        return _MODEL_DISPLAY_NAMES[model_type]
    if fallback:
        return fallback
    return model_type.replace("_", " ").title()


def _metric_value(metrics: List[Dict[str, Any]], name: str) -> Optional[float]:
    """Pull a named metric from a list of metric dicts (loose name matching)."""
    target = name.lower().replace("-", "_").replace(" ", "_")
    for m in metrics or []:
        m_name = (m.get("name") or m.get("label") or "").lower().replace("-", "_").replace(" ", "_")
        if m_name == target:
            v = m.get("value")
            if isinstance(v, (int, float)):
                return float(v)
    return None


def _format_date(today: datetime) -> str:
    """Format date as e.g. '4 May 2026', avoiding platform-dependent strftime tokens."""
    return f"{today.day} {today.strftime('%B %Y')}"


def narrate_dataset(domain, n_rows: int, n_features: int) -> str:
    name = getattr(domain, "name", None) or getattr(domain, "id", "the selected")
    return f"on the {name} dataset ({n_rows:,} patients, {n_features} features)"


def narrate_preparation(prep_config: Optional[Dict[str, Any]]) -> str:
    if not prep_config:
        return "Data was prepared with the default settings."
    parts: List[str] = []

    missing = prep_config.get("missing_strategy") or prep_config.get("missing_values_strategy")
    if missing and missing != "none":
        phrase = _MISSING_PHRASES.get(missing, f"handled with the {missing} strategy")
        parts.append(f"Missing values were {phrase}.")

    norm = prep_config.get("normalisation") or prep_config.get("scaling")
    if norm:
        phrase = _NORMALISATION_PHRASES.get(norm, f"scaled using {norm}")
        parts.append(f"Features were {phrase}.")

    if prep_config.get("apply_smote") or prep_config.get("smote"):
        parts.append("Class imbalance was addressed by applying SMOTE on the training split.")

    test_size = prep_config.get("test_size")
    if isinstance(test_size, (int, float)) and 0 < test_size < 1:
        train_pct = int(round((1 - test_size) * 100))
        test_pct = int(round(test_size * 100))
        parts.append(f"Data was split {train_pct}/{test_pct} train/test.")

    return " ".join(parts) if parts else "Data was prepared with the default settings."


def narrate_metrics(metrics: List[Dict[str, Any]]) -> str:
    sens = _metric_value(metrics, "sensitivity")
    spec = _metric_value(metrics, "specificity")
    acc = _metric_value(metrics, "accuracy")
    auc = _metric_value(metrics, "auc_roc") or _metric_value(metrics, "auc")

    headline = ""
    if sens is not None and spec is not None:
        headline = (
            f"It catches {round(sens * 100)} of every 100 patients with the condition "
            f"(sensitivity {sens:.2f}) and correctly clears {round(spec * 100)} of every 100 healthy patients "
            f"(specificity {spec:.2f})"
        )
    elif sens is not None:
        headline = f"It correctly identifies {round(sens * 100)}% of true positives (sensitivity {sens:.2f})"

    extras: List[str] = []
    if acc is not None:
        extras.append(f"overall accuracy {acc:.2f}")
    if auc is not None:
        extras.append(f"AUC-ROC {auc:.2f}")

    if headline and extras:
        return f"{headline}, with {' and '.join(extras)}."
    if headline:
        return f"{headline}."
    if extras:
        return f"The model achieves {' and '.join(extras)}."
    return "Performance metrics are unavailable for this model."


def narrate_fairness(bias: Optional[BiasAnalysisResponse]) -> str:
    if bias is None or not bias.subgroups:
        return ""
    if not bias.bias_detected:
        return "Subgroup fairness analysis shows no concerning disparities across demographic groups."

    worst = max(bias.subgroups, key=lambda s: abs(s.disparity_pp))
    direction = "worse" if worst.disparity_pp < 0 else "better"
    flag = "review" if direction == "worse" else "acknowledge"
    return (
        f"Subgroup analysis flagged a sensitivity gap: the model performs {abs(worst.disparity_pp):.0f} "
        f"percentage points {direction} on {worst.subgroup_name} patients than the overall baseline — "
        f"{flag} {worst.subgroup_name} predictions before deployment."
    )


def narrate_checklist(checklist_status: Optional[Dict[str, bool]]) -> str:
    if not checklist_status:
        return ""
    total = len(checklist_status)
    checked = sum(1 for v in checklist_status.values() if v)
    return f"{checked} of {total} EU AI Act compliance requirements are marked as met."


def narrate_session(
    session: SessionState,
    model_id: str,
    bias: Optional[BiasAnalysisResponse] = None,
    checklist_status: Optional[Dict[str, bool]] = None,
    today: Optional[datetime] = None,
) -> str:
    """Compose a single plain-English receipt paragraph from session state."""
    if today is None:
        today = datetime.now()
    date_str = _format_date(today)

    domain = get_domain_detail(session.domain_id)
    model_data = (session.trained_models or {}).get(model_id) or {}
    model_type = model_data.get("model_type") or "model"
    model_display = _model_display_name(model_type, fallback=model_data.get("model_name"))

    n_train = len(session.X_train) if session.X_train is not None else 0
    n_test = len(session.X_test) if session.X_test is not None else 0
    n_rows = n_train + n_test
    n_features = len(session.feature_columns or [])

    sentences: List[str] = []
    sentences.append(
        f"On {date_str}, MedVix trained a {model_display} classifier "
        f"{narrate_dataset(domain, n_rows, n_features)}."
    )

    prep_text = narrate_preparation(session.preparation_config)
    if prep_text:
        sentences.append(prep_text)

    metrics_text = narrate_metrics(model_data.get("metrics") or [])
    if metrics_text:
        sentences.append(metrics_text)

    fairness_text = narrate_fairness(bias)
    if fairness_text:
        sentences.append(fairness_text)

    checklist_text = narrate_checklist(checklist_status)
    if checklist_text:
        sentences.append(checklist_text)

    return " ".join(sentences)
