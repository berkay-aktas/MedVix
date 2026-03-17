"""Common Pydantic models shared across the MedVix API."""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standard error response returned by all API endpoints."""

    detail: str = Field(..., description="Human-readable error message")
    error_code: Optional[str] = Field(
        default=None,
        description="Machine-readable error code (e.g. 'INVALID_FILE_TYPE')",
    )


class WarningItem(BaseModel):
    """A single warning/info/error diagnostic message about the data."""

    level: Literal["info", "warning", "error"] = Field(
        ..., description="Severity level"
    )
    message: str = Field(..., description="Human-readable diagnostic message")
    column: Optional[str] = Field(
        default=None,
        description="Column name this warning relates to, if applicable",
    )
