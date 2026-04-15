"""Pydantic models for Step 6 — Explainability (SHAP)."""

from typing import List, Optional
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
