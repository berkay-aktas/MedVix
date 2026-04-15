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

    # Get or rebuild model object
    model = None
    if session.model_objects:
        model = session.model_objects.get(model_id)
    if model is None:
        from app.services.explainability_service import _rebuild_model
        model = _rebuild_model(session, model_id, session.trained_models[model_id])
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

# Color constants (R, G, B)
_C_PRIMARY = (5, 150, 105)
_C_PRIMARY_LT = (16, 185, 129)
_C_DARK = (30, 41, 59)
_C_TEXT = (51, 65, 85)
_C_MUTED = (100, 116, 139)
_C_LIGHT_MUTED = (148, 163, 184)
_C_BG = (248, 250, 252)
_C_BORDER = (226, 232, 240)
_C_SUCCESS = (22, 163, 74)
_C_WARNING = (217, 119, 6)
_C_DANGER = (220, 38, 38)
_C_WHITE = (255, 255, 255)
_C_SUCCESS_BG = (240, 253, 244)
_C_DANGER_BG = (254, 242, 242)
_C_WARNING_BG = (255, 251, 235)


def generate_certificate_pdf(
    session: SessionState,
    model_id: str,
    checklist_status: Dict[str, bool],
) -> bytes:
    """Generate a professionally styled PDF assessment certificate."""
    from fpdf import FPDF

    if model_id not in session.trained_models:
        raise ValueError(f"Model '{model_id}' not found in session.")

    model_data = session.trained_models[model_id]
    domain = get_domain_detail(session.domain_id)
    metrics = model_data.get("metrics", [])
    model_name = model_data.get("model_name", model_data.get("model_type", "Unknown"))
    checked_count = sum(1 for v in checklist_status.values() if v)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pw = pdf.w - 20  # page width minus margins

    # ── Header banner ──
    pdf.set_fill_color(*_C_PRIMARY)
    pdf.rect(0, 0, 210, 38, "F")
    # Accent stripe
    pdf.set_fill_color(*_C_PRIMARY_LT)
    pdf.rect(0, 38, 210, 2, "F")

    pdf.set_y(8)
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(*_C_WHITE)
    pdf.cell(0, 10, "MedVix", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(236, 253, 245)
    pdf.cell(0, 6, "ML Visualization Tool for Healthcare", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    pdf.cell(0, 6, "Assessment Certificate", align="C", new_x="LMARGIN", new_y="NEXT")

    pdf.set_y(46)

    # ── Domain info card ──
    pdf.set_fill_color(*_C_BG)
    pdf.set_draw_color(*_C_BORDER)
    card_y = pdf.get_y()
    pdf.rect(10, card_y, pw, 28, "DF")

    pdf.set_xy(14, card_y + 3)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*_C_MUTED)
    pdf.cell(60, 5, "CLINICAL DOMAIN", new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(14)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(*_C_DARK)
    pdf.cell(60, 7, domain.name)

    pdf.set_xy(85, card_y + 3)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*_C_MUTED)
    pdf.cell(50, 5, "MODEL", new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(85, card_y + 8)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(*_C_DARK)
    pdf.cell(50, 7, model_name)

    pdf.set_xy(150, card_y + 3)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*_C_MUTED)
    pdf.cell(50, 5, "DATE", new_x="LMARGIN", new_y="NEXT")
    pdf.set_xy(150, card_y + 8)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(*_C_DARK)
    pdf.cell(50, 7, datetime.now(timezone.utc).strftime("%d %b %Y"))

    pdf.set_y(card_y + 32)

    # ── Section: Performance Metrics ──
    _section_header(pdf, "Performance Metrics", pw)

    # Table header
    col_widths = [pw * 0.38, pw * 0.22, pw * 0.22, pw * 0.18]
    pdf.set_fill_color(*_C_PRIMARY)
    pdf.set_text_color(*_C_WHITE)
    pdf.set_font("Helvetica", "B", 9)
    headers = ["Metric", "Value", "Percentage", "Rating"]
    for i, h in enumerate(headers):
        pdf.cell(col_widths[i], 8, f"  {h}", fill=True)
    pdf.ln()

    # Table rows
    priority_metrics = ["accuracy", "sensitivity", "specificity", "precision", "f1", "auc_roc"]
    row_alt = False
    for m in metrics:
        m_name = m.get("name", "")
        if m_name not in priority_metrics:
            continue
        val = m.get("value", 0)
        label = m.get("label", m_name.replace("_", " ").title())
        pct = f"{val * 100:.1f}%"

        if val >= 0.8:
            rating, r_color, r_bg = "Good", _C_SUCCESS, _C_SUCCESS_BG
        elif val >= 0.6:
            rating, r_color, r_bg = "Fair", _C_WARNING, _C_WARNING_BG
        else:
            rating, r_color, r_bg = "Poor", _C_DANGER, _C_DANGER_BG

        bg = (241, 245, 249) if row_alt else _C_WHITE
        pdf.set_fill_color(*bg)
        pdf.set_text_color(*_C_TEXT)
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(col_widths[0], 7, f"  {label}", fill=True)
        pdf.set_font("Courier", "", 10)
        pdf.cell(col_widths[1], 7, f"  {val:.4f}", fill=True)
        pdf.cell(col_widths[2], 7, f"  {pct}", fill=True)
        # Rating cell with color
        pdf.set_fill_color(*r_bg)
        pdf.set_text_color(*r_color)
        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(col_widths[3], 7, f"  {rating}", fill=True)
        pdf.ln()
        row_alt = not row_alt

    pdf.ln(4)

    # ── Section: Bias & Fairness ──
    _section_header(pdf, "Bias & Fairness Findings", pw)

    try:
        bias_result = compute_bias_analysis(session, model_id)
        if bias_result.bias_detected:
            # Red alert box
            pdf.set_fill_color(*_C_DANGER_BG)
            pdf.set_draw_color(*_C_DANGER)
            box_y = pdf.get_y()
            pdf.rect(10, box_y, pw, 10, "DF")
            pdf.set_xy(14, box_y + 2)
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*_C_DANGER)
            pdf.cell(0, 6, f"BIAS DETECTED: {bias_result.bias_message}")
            pdf.set_y(box_y + 12)
        else:
            pdf.set_fill_color(*_C_SUCCESS_BG)
            pdf.set_draw_color(*_C_SUCCESS)
            box_y = pdf.get_y()
            pdf.rect(10, box_y, pw, 10, "DF")
            pdf.set_xy(14, box_y + 2)
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(*_C_SUCCESS)
            pdf.cell(0, 6, "No significant bias detected across patient subgroups.")
            pdf.set_y(box_y + 12)

        pdf.ln(1)

        # Subgroup mini-table
        if bias_result.subgroups:
            sg_cols = [pw * 0.30, pw * 0.12, pw * 0.20, pw * 0.20, pw * 0.18]
            pdf.set_fill_color(*_C_BG)
            pdf.set_text_color(*_C_MUTED)
            pdf.set_font("Helvetica", "B", 8)
            for i, h in enumerate(["Subgroup", "N", "Sensitivity", "Disparity", "Status"]):
                pdf.cell(sg_cols[i], 6, f"  {h}", fill=True)
            pdf.ln()

            pdf.set_font("Helvetica", "", 9)
            for sg in bias_result.subgroups:
                pdf.set_text_color(*_C_TEXT)
                pdf.cell(sg_cols[0], 6, f"  {sg.subgroup_name}")
                pdf.set_font("Courier", "", 9)
                pdf.cell(sg_cols[1], 6, f"  {sg.n}")
                pdf.cell(sg_cols[2], 6, f"  {sg.sensitivity:.1%}")
                pdf.cell(sg_cols[3], 6, f"  {sg.disparity_pp:+.1f}pp")
                # Status badge
                if sg.fairness_status == "OK":
                    pdf.set_text_color(*_C_SUCCESS)
                elif sg.fairness_status == "Review":
                    pdf.set_text_color(*_C_WARNING)
                else:
                    pdf.set_text_color(*_C_DANGER)
                pdf.set_font("Helvetica", "B", 9)
                pdf.cell(sg_cols[4], 6, f"  {sg.fairness_status}")
                pdf.ln()
                pdf.set_font("Helvetica", "", 9)
    except Exception:
        pdf.set_font("Helvetica", "I", 10)
        pdf.set_text_color(*_C_MUTED)
        pdf.cell(0, 7, "Bias analysis not available.", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)

    # ── Section: EU AI Act Compliance ──
    _section_header(pdf, "EU AI Act Compliance", pw)

    # Score badge
    if checked_count >= 6:
        badge_color, badge_bg = _C_SUCCESS, _C_SUCCESS_BG
    elif checked_count >= 4:
        badge_color, badge_bg = _C_WARNING, _C_WARNING_BG
    else:
        badge_color, badge_bg = _C_DANGER, _C_DANGER_BG

    pdf.set_fill_color(*badge_bg)
    pdf.set_draw_color(*badge_color)
    badge_y = pdf.get_y()
    pdf.rect(10, badge_y, 40, 9, "DF")
    pdf.set_xy(12, badge_y + 1.5)
    pdf.set_font("Courier", "B", 12)
    pdf.set_text_color(*badge_color)
    pdf.cell(36, 6, f"{checked_count} / 8", align="C")
    pdf.set_xy(54, badge_y + 2)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*_C_MUTED)
    pdf.cell(50, 6, "requirements met")
    pdf.set_y(badge_y + 12)

    # Checklist grid (2 columns)
    col_w_half = pw / 2 - 1
    items_list = list(EU_AI_ACT_ITEMS)
    for row_idx in range(0, len(items_list), 2):
        for col_idx in range(2):
            if row_idx + col_idx >= len(items_list):
                break
            item = items_list[row_idx + col_idx]
            is_pass = checklist_status.get(item.id, item.pre_checked)
            x_start = 10 + col_idx * (col_w_half + 2)

            if is_pass:
                pdf.set_fill_color(*_C_SUCCESS_BG)
                pdf.set_draw_color(167, 243, 208)
            else:
                pdf.set_fill_color(*_C_DANGER_BG)
                pdf.set_draw_color(254, 202, 202)

            item_y = pdf.get_y()
            pdf.rect(x_start, item_y, col_w_half, 12, "DF")

            # Icon circle
            cx = x_start + 7
            cy = item_y + 6
            if is_pass:
                pdf.set_fill_color(*_C_SUCCESS)
            else:
                pdf.set_fill_color(*_C_DANGER)
            pdf.ellipse(cx - 3.5, cy - 3.5, 7, 7, "F")

            # Icon symbol
            pdf.set_text_color(*_C_WHITE)
            pdf.set_font("Courier", "B", 8)
            pdf.set_xy(cx - 2, cy - 2.5)
            pdf.cell(4, 5, "+" if is_pass else "x", align="C")

            # Title
            pdf.set_xy(x_start + 14, item_y + 1)
            pdf.set_font("Helvetica", "B", 8.5)
            pdf.set_text_color(*_C_DARK)
            pdf.cell(col_w_half - 16, 4, item.title)
            pdf.set_xy(x_start + 14, item_y + 5.5)
            pdf.set_font("Helvetica", "", 7)
            pdf.set_text_color(*_C_MUTED)
            pdf.cell(col_w_half - 16, 4, item.description[:55])

        pdf.set_y(pdf.get_y() + 14)

    pdf.ln(2)

    # ── Footer ──
    pdf.set_draw_color(*_C_BORDER)
    pdf.set_line_width(0.3)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(3)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(*_C_LIGHT_MUTED)
    pdf.cell(0, 5, "This certificate summarises model evaluation findings and does not constitute clinical validation or regulatory approval.", align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 7)
    pdf.cell(0, 5, f"Generated by MedVix | {datetime.now(timezone.utc).strftime('%d %B %Y, %H:%M UTC')}", align="C", new_x="LMARGIN", new_y="NEXT")

    return pdf.output()


def _section_header(pdf, title: str, pw: float) -> None:
    """Draw a styled section header with left accent bar."""
    pdf.set_fill_color(*_C_PRIMARY)
    y = pdf.get_y()
    pdf.rect(10, y, 3, 8, "F")
    pdf.set_xy(16, y)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(*_C_DARK)
    pdf.cell(0, 8, title)
    pdf.set_y(y + 10)
