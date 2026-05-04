"""Pydantic models for Step 6 — Explainability (SHAP)."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class FeatureImportanceItem(BaseModel):
    feature_name: str = Field(..., description="Raw column name")
    display_name: str = Field(..., description="Clinical display name")
    importance: float = Field(..., description="Normalised SHAP importance 0.0-1.0")


class PatientOption(BaseModel):
    index: int = Field(..., description="Index in the test set")
    label: str = Field(..., description="Human-readable label, e.g. 'Patient #12 — Male, 63 years'")


class ExplainabilityRequest(BaseModel):
    session_id: str
    model_id: str


class ExplainabilityResponse(BaseModel):
    feature_importance: List[FeatureImportanceItem]
    sense_check_text: str
    patients: List[PatientOption]
    domain_id: str


class WaterfallRequest(BaseModel):
    session_id: str
    model_id: str
    patient_index: int


class WaterfallBar(BaseModel):
    feature_name: str
    display_name: str
    shap_value: float
    feature_value: str = Field(..., description="Actual value for this patient as string")
    direction: str = Field(..., description="'risk' or 'protective'")


class WaterfallResponse(BaseModel):
    bars: List[WaterfallBar] = Field(..., description="Sorted by abs(shap_value) descending")
    base_probability: float
    final_probability: float
    prediction_label: str
    prediction_class: str = Field(..., description="'positive' or 'negative'")
    summary_text: str = Field(..., description="Plain-language patient explanation")


class PatientMapPoint(BaseModel):
    """Coordinates and metadata for a single patient on the risk-map scatter."""
    index: int = Field(..., description="Position in X_test (used for waterfall fetch)")
    x: float = Field(..., description="PCA component 1 coordinate")
    y: float = Field(..., description="PCA component 2 coordinate")
    probability: float = Field(..., description="Predicted probability of positive class (0..1) for binary; max class probability for multiclass")
    predicted_class: str = Field(..., description="'positive' or 'negative' for binary; predicted class label for multiclass")
    actual_class: Optional[str] = Field(None, description="Ground truth label if available")
    label: str = Field(..., description="Short human-readable label, mirrors PatientOption.label")
    subgroup_sex: Optional[str] = Field(None, description="'Male' / 'Female' if domain has sex_column")
    subgroup_age: Optional[str] = Field(None, description="Age band label, e.g. '<60' / '>=60' if domain has age_column")
    is_misclassified: bool = Field(False, description="True if predicted_class != actual_class")
    is_multiclass: bool = Field(False, description="True for multiclass domains (changes tooltip framing)")


class PatientMapResponse(BaseModel):
    points: List[PatientMapPoint]
    pca_explained_variance: List[float] = Field(..., description="Variance ratio for the 2 PCA components")
    has_sex_subgroup: bool = Field(..., description="True if subgroup_sex is populated for the domain")
    has_age_subgroup: bool = Field(..., description="True if subgroup_age is populated for the domain")
    domain_id: str
    is_multiclass: bool = Field(False, description="True for multiclass problems")


class FeatureRange(BaseModel):
    """Slider/toggle bounds and current value for a single feature in original (un-scaled) units."""
    feature_name: str = Field(..., description="Raw column name")
    display_name: str = Field(..., description="Clinical display name")
    feature_type: str = Field(..., description="'binary' (toggle) or 'continuous' (slider)")
    min_value: float = Field(..., description="Lower bound: p1 of training data for continuous, lower binary value")
    max_value: float = Field(..., description="Upper bound: p99 of training data for continuous, upper binary value")
    current_value: float = Field(..., description="Patient's current original-scale value")


class CounterfactualRequest(BaseModel):
    session_id: str
    model_id: str
    patient_index: int
    feature_overrides: Optional[Dict[str, float]] = Field(
        default=None,
        description="Map of feature_name -> new original-scale value. None or empty returns baseline.",
    )


class CounterfactualResponse(BaseModel):
    probability: float = Field(..., description="Predicted probability for positive class (binary) or max class (multiclass)")
    predicted_class: str = Field(..., description="'positive'/'negative' for binary; class label for multiclass")
    predicted_label: str = Field(..., description="Human-readable label, e.g. 'High risk' / 'Low risk'")
    baseline_probability: float = Field(..., description="Probability with no overrides applied")
    baseline_class: str = Field(..., description="Predicted class with no overrides applied")
    prediction_changed: bool = Field(..., description="True if predicted_class != baseline_class")
    is_multiclass: bool = Field(False)
    feature_ranges: List[FeatureRange] = Field(..., description="Per-feature slider/toggle metadata in original scale")


class AutoFindResponse(BaseModel):
    """Result of single-feature grid search for the smallest change that flips the prediction."""
    success: bool = Field(..., description="True if a single-feature flip was found within typical range (p1..p99)")
    feature_name: Optional[str] = Field(None, description="Raw column name of the suggested feature")
    display_name: Optional[str] = Field(None, description="Clinical display name of the suggested feature")
    original_value: Optional[float] = Field(None, description="Patient's current original-scale value")
    suggested_value: Optional[float] = Field(None, description="Original-scale value that flips the prediction")
    delta: Optional[float] = Field(None, description="suggested_value - original_value")
    baseline_probability: float = Field(..., description="Baseline probability before any change")
    new_probability: Optional[float] = Field(None, description="Probability after applying the suggested change")
    baseline_class: str = Field(..., description="Baseline predicted class")
    new_class: Optional[str] = Field(None, description="Predicted class after the suggested change")
    explanation: str = Field(..., description="Plain-English description of the suggested change or why none was found")
