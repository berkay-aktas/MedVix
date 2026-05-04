"""Pydantic models for Step 7 — Ethics & Bias Audit."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SubgroupMetrics(BaseModel):
    subgroup_name: str
    n: int
    accuracy: float
    sensitivity: float
    specificity: float
    disparity_pp: float = Field(..., description="Percentage points vs overall sensitivity")
    fairness_status: str = Field(..., description="'OK', 'Review', or 'Warning'")


class DataComparisonItem(BaseModel):
    group_name: str
    training_pct: float
    population_pct: float
    gap_pp: float
    has_warning: bool = Field(..., description="True if gap > 15pp")


class BiasAnalysisRequest(BaseModel):
    session_id: str
    model_id: str


class BiasAnalysisResponse(BaseModel):
    subgroups: List[SubgroupMetrics]
    overall_sensitivity: float
    bias_detected: bool
    bias_message: Optional[str] = None
    training_data_comparison: List[DataComparisonItem]


class ChecklistItemDef(BaseModel):
    id: str
    title: str
    description: str
    pre_checked: bool = False


class CertificateRequest(BaseModel):
    session_id: str
    model_id: str
    checklist_status: Dict[str, bool] = Field(..., description="8 checklist items with their toggle state")


class ReceiptResponse(BaseModel):
    receipt: str = Field(..., description="Plain-English narrative paragraph summarizing the session")
    generated_at: str = Field(..., description="ISO 8601 timestamp of when the receipt was generated")
    domain_id: str
    model_id: str
