"""Pydantic models for Step 2 — Data Exploration."""

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

from app.models.common import WarningItem


class ColumnInfo(BaseModel):
    """Statistical summary for a single DataFrame column."""

    name: str = Field(..., description="Column name")
    dtype: str = Field(
        ..., description="Simplified type: numeric, categorical, binary, identifier, datetime"
    )
    missing_count: int = Field(..., ge=0, description="Number of missing values")
    missing_pct: float = Field(..., ge=0.0, le=100.0, description="Missing percentage")
    unique_count: int = Field(..., ge=0, description="Number of unique values")
    action_tag: Literal["OK", "Some Missing", "High Missing"] = Field(
        ..., description="Colour-coded quality tag"
    )
    action_color: Literal["green", "amber", "red"] = Field(
        ..., description="Colour for the quality badge"
    )
    sample_values: List[Any] = Field(
        default_factory=list,
        description="Up to 5 sample values from this column",
    )
    min_val: Optional[Any] = Field(
        default=None, description="Minimum value (numeric columns only)"
    )
    max_val: Optional[Any] = Field(
        default=None, description="Maximum value (numeric columns only)"
    )


class ClassInfo(BaseModel):
    """Distribution entry for a single target class."""

    class_name: str = Field(..., description="Target class label")
    count: int = Field(..., ge=0, description="Number of samples in this class")
    percentage: float = Field(..., ge=0.0, le=100.0, description="Percentage of total")


class DataSummary(BaseModel):
    """Full data exploration summary returned after upload or dataset load."""

    session_id: str
    row_count: int = Field(..., ge=0)
    column_count: int = Field(..., ge=0)
    total_missing_pct: float = Field(..., ge=0.0, le=100.0)
    columns: List[ColumnInfo]
    class_distribution: List[ClassInfo]
    target_column: str
    is_imbalanced: bool
    imbalance_warning: Optional[str] = None
    data_quality_score: int = Field(
        ..., ge=0, le=100, description="Composite quality score (0-100)"
    )
    warnings: List[WarningItem] = Field(default_factory=list)


class UploadResponse(BaseModel):
    """Immediate acknowledgement after a CSV file upload."""

    session_id: str
    filename: str
    file_size_kb: float
    row_count: int
    column_count: int
    message: str


class ColumnMapping(BaseModel):
    """Mapping of a single CSV column to a pipeline role."""

    csv_column: str = Field(..., description="Name of the column in the CSV")
    role: Literal["feature", "target", "ignore"] = Field(
        ..., description="Pipeline role assigned to this column"
    )


class ColumnMapperRequest(BaseModel):
    """Request body for the column mapper endpoint."""

    session_id: str
    target_column: str
    mappings: List[ColumnMapping]


class ColumnMapperResponse(BaseModel):
    """Response after validating and applying column mappings."""

    session_id: str
    target_column: str
    feature_count: int
    ignored_count: int
    schema_ok: bool
    warnings: List[WarningItem] = Field(default_factory=list)


class DataPreviewResponse(BaseModel):
    """Paginated preview of the uploaded data."""

    session_id: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_rows: int
