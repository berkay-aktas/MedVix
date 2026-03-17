"""Pydantic models for Step 3 — Data Preparation."""

from typing import Dict, List, Literal

from pydantic import BaseModel, Field


class PreparationConfig(BaseModel):
    """User-selected preparation options sent from the frontend."""

    session_id: str
    test_size: float = Field(
        default=0.2,
        ge=0.1,
        le=0.4,
        description="Proportion of data reserved for testing",
    )
    missing_strategy: Literal["median", "mode", "remove"] = Field(
        default="median",
        description="Strategy for handling missing values",
    )
    normalisation: Literal["zscore", "minmax", "none"] = Field(
        default="zscore",
        description="Feature normalisation method",
    )
    apply_smote: bool = Field(
        default=False,
        description="Whether to apply SMOTE for class balancing",
    )
    outlier_strategy: Literal["none", "iqr", "zscore_clip"] = Field(
        default="none",
        description=(
            "Outlier handling strategy applied before train/test split. "
            "'iqr' clips to Q1-1.5*IQR / Q3+1.5*IQR. "
            "'zscore_clip' clips beyond 3 standard deviations."
        ),
    )


class ColumnStatsBefore(BaseModel):
    """Per-column statistics before preparation."""

    column: str
    min: float
    max: float
    mean: float
    std: float
    missing: int


class ColumnStatsAfter(BaseModel):
    """Per-column statistics after preparation."""

    column: str
    min: float
    max: float
    mean: float
    std: float
    missing: int


class BeforeAfterColumn(BaseModel):
    """Side-by-side before/after stats for a single column."""

    column: str
    before: ColumnStatsBefore
    after: ColumnStatsAfter


class SmoteResult(BaseModel):
    """Summary of SMOTE oversampling."""

    applied: bool
    before_distribution: Dict[str, int] = Field(default_factory=dict)
    after_distribution: Dict[str, int] = Field(default_factory=dict)
    synthetic_samples: int = Field(
        default=0, ge=0, description="Number of synthetic samples generated"
    )


class NormalisationResult(BaseModel):
    """Summary of the normalisation step."""

    method: str
    columns_normalised: List[str] = Field(default_factory=list)
    sample_before: Dict[str, float] = Field(
        default_factory=dict,
        description="First-row sample of feature values before normalisation",
    )
    sample_after: Dict[str, float] = Field(
        default_factory=dict,
        description="First-row sample of feature values after normalisation",
    )


class PreparationResult(BaseModel):
    """Complete result summary returned after data preparation."""

    session_id: str
    train_rows: int = Field(..., ge=0)
    test_rows: int = Field(..., ge=0)
    feature_count: int = Field(..., ge=0)
    rows_removed: int = Field(
        default=0, ge=0, description="Rows dropped due to missing-value removal"
    )
    missing_before: int = Field(..., ge=0)
    missing_after: int = Field(..., ge=0)
    normalisation: NormalisationResult
    smote: SmoteResult
    before_after_stats: List[BeforeAfterColumn] = Field(default_factory=list)
    data_ready: bool
    success_message: str
