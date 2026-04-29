"""Router for Step 2 — Data Exploration (upload, summary, mapping, preview)."""

from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from pydantic import BaseModel, Field

from app.models.data import (
    ColumnMapperRequest,
    ColumnMapperResponse,
    DataPreviewResponse,
    DataSummary,
    UploadResponse,
)
from app.services import session_service
from app.services.data_service import (
    compute_summary,
    get_preview,
    load_builtin_dataset,
    validate_and_load_csv,
    validate_column_mapping,
)
from app.services.domain_service import get_domain_detail

router = APIRouter(prefix="/api/data", tags=["Data Exploration"])


class BuiltinDatasetRequest(BaseModel):
    """Body for the /api/data/builtin endpoint."""

    domain_id: str = Field(..., description="Domain ID to load built-in dataset for")


@router.post(
    "/upload",
    response_model=UploadResponse,
    summary="Upload a CSV file",
    description="Upload a CSV dataset for analysis. Creates a new session.",
    responses={
        400: {"description": "Invalid file type or size"},
        413: {"description": "File too large"},
        422: {"description": "CSV parsing error"},
    },
)
async def upload_csv(
    file: UploadFile = File(..., description="CSV file to upload"),
    domain_id: str = Query(..., description="Domain ID this dataset belongs to"),
) -> UploadResponse:
    # Validate domain
    """Handle upload csv."""
    domain = get_domain_detail(domain_id)
    if domain is None:
        raise HTTPException(status_code=400, detail=f"Unknown domain: '{domain_id}'")

    # Validate and parse CSV (raises HTTPException on failure)
    df, metadata = await validate_and_load_csv(file)

    # Create session and store DataFrame
    session = session_service.create_session(domain_id=domain_id)
    session.df = df
    session.target_column = domain.target_variable

    return UploadResponse(
        session_id=session.session_id,
        filename=metadata["filename"],
        file_size_kb=metadata["file_size_kb"],
        row_count=len(df),
        column_count=len(df.columns),
        message=f"Successfully uploaded {metadata['filename']} ({len(df)} rows, {len(df.columns)} columns).",
    )


@router.post(
    "/builtin",
    response_model=UploadResponse,
    summary="Load a built-in dataset",
    description="Load one of the 20 built-in synthetic datasets by domain ID.",
    responses={
        400: {"description": "Unknown domain"},
        404: {"description": "Built-in dataset file not found"},
    },
)
async def load_builtin(body: BuiltinDatasetRequest) -> UploadResponse:
    """Handle load builtin."""
    domain = get_domain_detail(body.domain_id)
    if domain is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown domain: '{body.domain_id}'",
        )

    # Load built-in dataset (raises HTTPException on failure)
    df = load_builtin_dataset(body.domain_id)

    session = session_service.create_session(domain_id=body.domain_id)
    session.df = df
    session.target_column = domain.target_variable

    return UploadResponse(
        session_id=session.session_id,
        filename=f"{domain.dataset_name}.csv",
        file_size_kb=0.0,
        row_count=len(df),
        column_count=len(df.columns),
        message=f"Loaded built-in dataset for {domain.name} ({len(df)} rows, {len(df.columns)} columns).",
    )


@router.get(
    "/summary",
    response_model=DataSummary,
    summary="Get dataset summary",
    description="Returns per-column stats, class distribution, quality score, and warnings.",
    responses={404: {"description": "Session not found"}},
)
async def get_summary(
    session_id: str = Query(..., description="Session ID"),
) -> DataSummary:
    """Return the summary."""
    session = session_service.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.df is None:
        raise HTTPException(
            status_code=400, detail="No dataset loaded in this session."
        )

    # Determine target column: use session override, else domain default
    target_col = session.target_column
    if target_col is None:
        domain = get_domain_detail(session.domain_id)
        if domain is not None:
            target_col = domain.target_variable

    if target_col is None:
        target_col = ""

    summary_dict = compute_summary(session.df, target_col)
    return DataSummary(session_id=session_id, **summary_dict)


@router.post(
    "/column-mapping",
    response_model=ColumnMapperResponse,
    summary="Set column mapping",
    description="Validate and store the user's target/feature column selection.",
    responses={404: {"description": "Session not found"}},
)
async def set_column_mapping(body: ColumnMapperRequest) -> ColumnMapperResponse:
    """Handle set column mapping."""
    session = session_service.get_session(body.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.df is None:
        raise HTTPException(
            status_code=400, detail="No dataset loaded in this session."
        )

    result = validate_column_mapping(
        session.df, body.target_column, body.mappings
    )

    # Extract feature columns from mappings for session storage
    feature_columns = [
        m.csv_column for m in body.mappings if m.role == "feature"
    ]

    # Store mapping on the session
    session.target_column = body.target_column
    session.feature_columns = feature_columns
    session.schema_ok = result["schema_ok"]

    return ColumnMapperResponse(
        session_id=body.session_id,
        target_column=body.target_column,
        feature_count=result["feature_count"],
        ignored_count=result["ignored_count"],
        schema_ok=result["schema_ok"],
        warnings=result["warnings"],
    )


@router.get(
    "/preview",
    response_model=DataPreviewResponse,
    summary="Preview dataset rows",
    description="Returns the first N rows of the dataset.",
    responses={404: {"description": "Session not found"}},
)
async def preview_data(
    session_id: str = Query(..., description="Session ID"),
    rows: int = Query(
        default=5, ge=1, le=100, description="Number of rows to preview"
    ),
) -> DataPreviewResponse:
    """Handle preview data."""
    session = session_service.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.df is None:
        raise HTTPException(
            status_code=400, detail="No dataset loaded in this session."
        )

    preview = get_preview(session.df, rows=rows)

    return DataPreviewResponse(
        session_id=session_id,
        columns=preview["columns"],
        rows=preview["rows"],
        total_rows=preview["total_rows"],
    )
