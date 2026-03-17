"""Pydantic models for clinical domain metadata (Step 1)."""

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class DomainSummary(BaseModel):
    """Compact representation shown in the domain-picker grid."""

    id: str = Field(..., description="URL-safe slug, e.g. 'cardiology'")
    name: str = Field(..., description="Human-readable domain name")
    icon: str = Field(..., description="Emoji icon for the domain card")
    short_description: str = Field(
        ..., description="One-sentence summary of the clinical use-case"
    )
    dataset_name: str = Field(
        ..., description="Canonical dataset file name (without .csv)"
    )
    target_variable: str = Field(
        ..., description="Name of the target column in the dataset"
    )
    problem_type: Literal["binary", "multiclass"] = Field(
        ..., description="Classification type"
    )


class DomainDetail(DomainSummary):
    """Full metadata displayed when a domain is selected."""

    clinical_question: str = Field(
        ...,
        description="The medical question the ML model tries to answer",
    )
    why_it_matters: str = Field(
        ...,
        description="2-3 sentences on clinical significance",
    )
    patient_population: str = Field(
        ..., description="Target patient population"
    )
    ai_limitation_note: str = Field(
        ..., description="What AI cannot do in this clinical context"
    )
    feature_names: List[str] = Field(
        ..., description="List of feature column names in the dataset"
    )
    feature_descriptions: Dict[str, str] = Field(
        ...,
        description="Mapping of feature name to clinical description",
    )
    target_classes: List[str] = Field(
        ..., description="Possible values of the target variable"
    )
    data_source: str = Field(
        ..., description="URL to the original dataset (Kaggle / UCI)"
    )
    dataset_rows: int = Field(..., description="Number of rows in the dataset")
    dataset_features: int = Field(
        ..., description="Number of feature columns in the dataset"
    )
    positive_rate: Optional[str] = Field(
        default=None,
        description="Approximate prevalence of the positive class",
    )


class DomainListResponse(BaseModel):
    """Response wrapper for the domain list endpoint."""

    domains: List[DomainSummary]
    count: int = Field(..., description="Total number of available domains")
