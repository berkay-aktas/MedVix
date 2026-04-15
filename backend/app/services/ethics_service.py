"""Ethics, bias analysis, and PDF certificate generation for Step 7."""

import io
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sklearn.metrics import accuracy_score, recall_score

from app.models.ethics import (
    BiasAnalysisResponse,
    ChecklistItemDef,
    DataComparisonItem,
    SubgroupMetrics,
)
from app.models.session import SessionState
from app.services.domain_service import get_domain_detail

logger = logging.getLogger("medvix.ethics")

BIAS_THRESHOLD_PP = 10  # percentage points


def _compute_metrics_for_subset(
    model: Any, X: np.ndarray, y: np.ndarray
) -> Tuple[float, float, float]:
    """Compute accuracy, sensitivity (recall), specificity for a data subset."""
    if len(X) == 0 or len(y) == 0:
        return 0.0, 0.0, 0.0

    y_pred = model.predict(X)
    acc = accuracy_score(y, y_pred)

    # Handle multiclass: use macro average
    unique = np.unique(y)
    if len(unique) > 2:
        sens = recall_score(y, y_pred, average="macro", zero_division=0)
        spec = 0.0  # specificity not well-defined for multiclass
    else:
        sens = recall_score(y, y_pred, pos_label=unique[-1], zero_division=0)
        # Specificity = recall of the negative class
        spec = recall_score(y, y_pred, pos_label=unique[0], zero_division=0)

    return float(acc), float(sens), float(spec)


def compute_bias_analysis(session: SessionState, model_id: str) -> BiasAnalysisResponse:
    """Compute subgroup fairness metrics and bias detection."""
    if model_id not in session.trained_models:
        raise ValueError(f"Model '{model_id}' not found.")
    if not session.model_objects or model_id not in session.model_objects:
        raise ValueError("Fitted model not available. Please retrain.")

    model = session.model_objects[model_id]
    domain = get_domain_detail(session.domain_id)
    feature_cols = session.feature_columns or []
    X_test = session.X_test
    y_test = session.y_test

    # Overall metrics
    overall_acc, overall_sens, overall_spec = _compute_metrics_for_subset(model, X_test, y_test)

    subgroups: List[SubgroupMetrics] = []
    subgroup_config = domain.subgroup_columns or {}

    # Sex-based subgroups
    sex_col = subgroup_config.get("sex_column")
    if sex_col and sex_col in feature_cols:
        sex_idx = feature_cols.index(sex_col)
        male_val = subgroup_config.get("sex_male_value", 1)

        male_mask = X_test[:, sex_idx] == male_val
        female_mask = ~male_mask

        for mask, name in [(male_mask, "Male"), (female_mask, "Female")]:
            if mask.sum() > 0:
                acc, sens, spec = _compute_metrics_for_subset(
                    model, X_test[mask], y_test[mask]
                )
                disp = round((sens - overall_sens) * 100, 1)
                status = "OK" if abs(disp) <= 5 else ("Review" if abs(disp) <= BIAS_THRESHOLD_PP else "Warning")
                subgroups.append(SubgroupMetrics(
                    subgroup_name=name,
                    n=int(mask.sum()),
                    accuracy=round(acc, 3),
                    sensitivity=round(sens, 3),
                    specificity=round(spec, 3),
                    disparity_pp=disp,
                    fairness_status=status,
                ))

    # Age-based subgroups
    age_col = subgroup_config.get("age_column")
    age_threshold = subgroup_config.get("age_threshold", 60)
    if age_col and age_col in feature_cols:
        age_idx = feature_cols.index(age_col)
        young_mask = X_test[:, age_idx] < age_threshold
        old_mask = ~young_mask

        for mask, name in [(young_mask, f"Age < {age_threshold}"), (old_mask, f"Age >= {age_threshold}")]:
            if mask.sum() > 0:
                acc, sens, spec = _compute_metrics_for_subset(
                    model, X_test[mask], y_test[mask]
                )
                disp = round((sens - overall_sens) * 100, 1)
                status = "OK" if abs(disp) <= 5 else ("Review" if abs(disp) <= BIAS_THRESHOLD_PP else "Warning")
                subgroups.append(SubgroupMetrics(
                    subgroup_name=name,
                    n=int(mask.sum()),
                    accuracy=round(acc, 3),
                    sensitivity=round(sens, 3),
                    specificity=round(spec, 3),
                    disparity_pp=disp,
                    fairness_status=status,
                ))

    # If no subgroup_columns configured, create default splits
    if not subgroups and len(feature_cols) > 0:
        # Use first numeric feature and split at median
        median_val = np.median(X_test[:, 0])
        low_mask = X_test[:, 0] <= median_val
        high_mask = ~low_mask
        col_display = feature_cols[0].replace("_", " ").title()
        for mask, name in [(low_mask, f"{col_display} <= median"), (high_mask, f"{col_display} > median")]:
            if mask.sum() > 0:
                acc, sens, spec = _compute_metrics_for_subset(model, X_test[mask], y_test[mask])
                disp = round((sens - overall_sens) * 100, 1)
                status = "OK" if abs(disp) <= 5 else ("Review" if abs(disp) <= BIAS_THRESHOLD_PP else "Warning")
                subgroups.append(SubgroupMetrics(
                    subgroup_name=name, n=int(mask.sum()),
                    accuracy=round(acc, 3), sensitivity=round(sens, 3),
                    specificity=round(spec, 3), disparity_pp=disp, fairness_status=status,
                ))

    # Bias detection
    bias_detected = any(abs(s.disparity_pp) > BIAS_THRESHOLD_PP for s in subgroups)
    bias_message = None
    if bias_detected:
        worst = max(subgroups, key=lambda s: abs(s.disparity_pp))
        bias_message = (
            f"Sensitivity gap of {abs(worst.disparity_pp):.0f}pp detected for "
            f"{worst.subgroup_name} patients. The model may underperform for this subgroup."
        )

    # Training data comparison
    training_comparison = _compute_training_comparison(session, domain)

    return BiasAnalysisResponse(
        subgroups=subgroups,
        overall_sensitivity=round(overall_sens, 3),
        bias_detected=bias_detected,
        bias_message=bias_message,
        training_data_comparison=training_comparison,
    )


def _compute_training_comparison(
    session: SessionState, domain
) -> List[DataComparisonItem]:
    """Compare training data demographics against real-world population stats."""
    pop_stats = domain.population_stats or {}
    if not pop_stats:
        return []

    feature_cols = session.feature_columns or []
    X_train = session.X_train
    subgroup_config = domain.subgroup_columns or {}
    items: List[DataComparisonItem] = []

    sex_col = subgroup_config.get("sex_column")
    if sex_col and sex_col in feature_cols:
        sex_idx = feature_cols.index(sex_col)
        male_val = subgroup_config.get("sex_male_value", 1)
        male_pct = float(np.mean(X_train[:, sex_idx] == male_val)) * 100
        female_pct = 100 - male_pct

        pop_male = pop_stats.get("male", 50) * 100 if pop_stats.get("male", 0) <= 1 else pop_stats.get("male", 50)
        pop_female = 100 - pop_male

        for name, train_pct, pop_pct in [("Male", male_pct, pop_male), ("Female", female_pct, pop_female)]:
            gap = abs(train_pct - pop_pct)
            items.append(DataComparisonItem(
                group_name=name, training_pct=round(train_pct, 1),
                population_pct=round(pop_pct, 1), gap_pp=round(gap, 1),
                has_warning=gap > 15,
            ))

    age_col = subgroup_config.get("age_column")
    age_threshold = subgroup_config.get("age_threshold", 60)
    if age_col and age_col in feature_cols:
        age_idx = feature_cols.index(age_col)
        young_pct = float(np.mean(X_train[:, age_idx] < age_threshold)) * 100
        old_pct = 100 - young_pct

        pop_young = pop_stats.get("age_under_threshold", 0.55) * 100 if pop_stats.get("age_under_threshold", 0) <= 1 else pop_stats.get("age_under_threshold", 55)
        pop_old = 100 - pop_young

        for name, train_pct, pop_pct in [(f"Age < {age_threshold}", young_pct, pop_young), (f"Age >= {age_threshold}", old_pct, pop_old)]:
            gap = abs(train_pct - pop_pct)
            items.append(DataComparisonItem(
                group_name=name, training_pct=round(train_pct, 1),
                population_pct=round(pop_pct, 1), gap_pp=round(gap, 1),
                has_warning=gap > 15,
            ))

    return items


# --- EU AI Act Checklist ---

EU_AI_ACT_ITEMS: List[ChecklistItemDef] = [
    ChecklistItemDef(id="data_quality", title="Data quality documentation", description="Training data sources and preprocessing steps are documented", pre_checked=True),
    ChecklistItemDef(id="transparency", title="Transparency", description="Model decisions are explainable via SHAP analysis", pre_checked=True),
    ChecklistItemDef(id="human_oversight", title="Human oversight", description="System designed for clinician-in-the-loop use", pre_checked=False),
    ChecklistItemDef(id="accuracy_reporting", title="Accuracy reporting", description="Performance metrics reported per patient subgroup", pre_checked=False),
    ChecklistItemDef(id="bias_mitigation", title="Bias mitigation", description="Active steps taken to identify and reduce bias", pre_checked=False),
    ChecklistItemDef(id="technical_docs", title="Technical documentation", description="Architecture, limitations, and intended use documented", pre_checked=False),
    ChecklistItemDef(id="risk_classification", title="Risk classification", description="System classified as high-risk medical AI per EU AI Act", pre_checked=False),
    ChecklistItemDef(id="post_market", title="Post-market monitoring", description="Monitoring plan established for deployment performance", pre_checked=False),
]


def get_checklist_items() -> List[ChecklistItemDef]:
    return EU_AI_ACT_ITEMS


# --- PDF Certificate Generation ---

def generate_certificate_pdf(
    session: SessionState,
    model_id: str,
    checklist_status: Dict[str, bool],
) -> bytes:
    """Generate a PDF assessment certificate."""
    from fpdf import FPDF

    if model_id not in session.trained_models:
        raise ValueError(f"Model '{model_id}' not found in session.")

    model_data = session.trained_models[model_id]
    domain = get_domain_detail(session.domain_id)
    metrics = model_data.get("metrics", [])

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(5, 150, 105)
    pdf.cell(0, 12, "MedVix", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 6, "ML Visualization Tool for Healthcare", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 10, "Assessment Certificate", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(5, 150, 105)
    pdf.set_line_width(0.5)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(6)

    # Domain & Model info
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(0, 7, f"Clinical Domain: {domain.name}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Model: {model_data.get('model_name', model_data.get('model_type', 'Unknown'))}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Date: {datetime.now(timezone.utc).strftime('%d %B %Y, %H:%M UTC')}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    # Metrics table
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, "Performance Metrics", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(248, 250, 252)
    pdf.set_text_color(100, 116, 139)
    col_w = 63
    pdf.cell(col_w, 8, "Metric", border=1, fill=True)
    pdf.cell(col_w, 8, "Value", border=1, fill=True)
    pdf.cell(col_w, 8, "Rating", border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(51, 65, 85)
    priority_metrics = ["accuracy", "sensitivity", "specificity", "precision", "f1", "auc_roc"]
    for m in metrics:
        m_name = m.get("name", "")
        if m_name in priority_metrics:
            val = m.get("value", 0)
            label = m.get("label", m_name.replace("_", " ").title())
            rating = "Good" if val >= 0.8 else ("Fair" if val >= 0.6 else "Poor")
            pdf.cell(col_w, 7, label, border=1)
            pdf.cell(col_w, 7, f"{val:.4f}", border=1)
            pdf.cell(col_w, 7, rating, border=1, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)

    # Bias findings
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, "Bias & Fairness Findings", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    # Run bias analysis to get findings
    try:
        bias_result = compute_bias_analysis(session, model_id)
        pdf.set_font("Helvetica", "", 10)
        if bias_result.bias_detected:
            pdf.set_text_color(220, 38, 38)
            pdf.cell(0, 7, f"BIAS DETECTED: {bias_result.bias_message}", new_x="LMARGIN", new_y="NEXT")
        else:
            pdf.set_text_color(5, 150, 105)
            pdf.cell(0, 7, "No significant bias detected across patient subgroups.", new_x="LMARGIN", new_y="NEXT")

        pdf.set_text_color(51, 65, 85)
        for sg in bias_result.subgroups:
            pdf.cell(0, 6, f"  {sg.subgroup_name}: Sensitivity={sg.sensitivity:.1%}, Disparity={sg.disparity_pp:+.1f}pp [{sg.fairness_status}]", new_x="LMARGIN", new_y="NEXT")
    except Exception:
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 7, "Bias analysis not available.", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)

    # EU AI Act Checklist
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, "EU AI Act Compliance", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    checked_count = sum(1 for v in checklist_status.values() if v)
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(5, 150, 105) if checked_count >= 6 else pdf.set_text_color(217, 119, 6)
    pdf.cell(0, 7, f"{checked_count}/8 requirements met", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(51, 65, 85)
    for item in EU_AI_ACT_ITEMS:
        status = "PASS" if checklist_status.get(item.id, item.pre_checked) else "FAIL"
        marker = "[x]" if status == "PASS" else "[ ]"
        pdf.cell(0, 6, f"  {marker} {item.title}", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(6)

    # Footer
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(148, 163, 184)
    pdf.cell(0, 6, "This certificate is generated for educational purposes only.", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, "It does not constitute clinical validation or regulatory approval.", new_x="LMARGIN", new_y="NEXT")

    return pdf.output()
