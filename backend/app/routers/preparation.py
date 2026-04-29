"""Router for Step 3 — Data Preparation (split, impute, normalise, SMOTE)."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.models.preparation import PreparationConfig, PreparationResult
from app.services import session_service
from app.services.domain_service import get_domain_detail
from app.services.preparation_service import prepare_data

router = APIRouter(prefix="/api/data", tags=["Data Preparation"])


class PreparationStatusResponse(BaseModel):
    """Response for the /api/data/preparation-status endpoint."""

    session_id: str
    is_prepared: bool
    train_rows: Optional[int] = None
    test_rows: Optional[int] = None


@router.post(
    "/prepare",
    response_model=PreparationResult,
    summary="Prepare dataset for training",
    description=(
        "Runs the full preparation pipeline: missing-value handling, "
        "train/test split, normalisation, and optional SMOTE."
    ),
    responses={
        400: {"description": "Schema not validated or no data loaded"},
        404: {"description": "Session not found"},
    },
)
async def prepare(config: PreparationConfig) -> PreparationResult:
    """Handle prepare."""
    session = session_service.get_session(config.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    if session.df is None:
        raise HTTPException(
            status_code=400, detail="No dataset loaded in this session."
        )

    if not session.schema_ok:
        raise HTTPException(
            status_code=400,
            detail=(
                "Column mapping has not been validated. "
                "Please complete Step 2 column mapping first."
            ),
        )

    # Ensure target and feature columns are set
    if session.target_column is None:
        domain = get_domain_detail(session.domain_id)
        if domain is not None:
            session.target_column = domain.target_variable
    if session.target_column is None:
        raise HTTPException(
            status_code=400, detail="No target column set on this session."
        )

    if not session.feature_columns:
        session.feature_columns = [
            c for c in session.df.columns if c != session.target_column
        ]

    result = prepare_data(session=session, config=config)
    return result


@router.get(
    "/preparation-status",
    response_model=PreparationStatusResponse,
    summary="Check preparation status",
    description="Returns whether the dataset has been prepared and split sizes.",
    responses={404: {"description": "Session not found"}},
)
async def preparation_status(
    session_id: str = Query(..., description="Session ID"),
) -> PreparationStatusResponse:
    """Handle preparation status."""
    session = session_service.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    train_rows = len(session.X_train) if session.X_train is not None else None
    test_rows = len(session.X_test) if session.X_test is not None else None

    return PreparationStatusResponse(
        session_id=session_id,
        is_prepared=session.is_prepared,
        train_rows=train_rows,
        test_rows=test_rows,
    )
