"""Router for Steps 4-5 — Model Training & Results."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException, Query

from app.models.ml import (
    CompareRequest,
    ComparisonResponse,
    HyperparamsResponse,
    TrainedModelSummary,
    TrainRequest,
    TrainResponse,
)
from app.services import session_service
from app.services.ml_service import (
    compare_models,
    get_hyperparam_definitions,
    get_trained_models,
    train_model,
)

router = APIRouter(prefix="/api/ml", tags=["Model Training"])


@router.get(
    "/hyperparams/{model_type}",
    response_model=HyperparamsResponse,
    summary="Get hyperparameter definitions for a model type",
    description=(
        "Returns the tunable hyperparameters, their types, ranges, "
        "defaults, and descriptions for the requested model."
    ),
    responses={
        400: {"description": "Unknown model type"},
    },
)
async def get_hyperparams(model_type: str) -> HyperparamsResponse:
    """Return the hyperparams."""
    try:
        return get_hyperparam_definitions(model_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post(
    "/train",
    response_model=TrainResponse,
    summary="Train a model with given hyperparameters",
    description=(
        "Trains the specified model on the session's prepared data, "
        "computes all evaluation metrics, confusion matrix, ROC/PR "
        "curves, and cross-validation scores."
    ),
    responses={
        400: {"description": "Invalid model type or data not prepared"},
        404: {"description": "Session not found"},
    },
)
async def train(request: TrainRequest) -> TrainResponse:
    """Handle train."""
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        result = train_model(
            session=session,
            model_type=request.model_type,
            hyperparams=request.hyperparams,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return result


@router.get(
    "/models",
    response_model=List[TrainedModelSummary],
    summary="List all trained models in a session",
    description="Returns lightweight summaries of every model trained so far.",
    responses={
        404: {"description": "Session not found"},
    },
)
async def list_models(
    session_id: str = Query(..., description="Session ID"),
) -> List[TrainedModelSummary]:
    """Handle list models."""
    session = session_service.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    return get_trained_models(session)


@router.post(
    "/compare",
    response_model=ComparisonResponse,
    summary="Compare all trained models",
    description=(
        "Returns a side-by-side comparison of all trained models with "
        "the best model identified per metric."
    ),
    responses={
        400: {"description": "No models trained yet"},
        404: {"description": "Session not found"},
    },
)
async def compare(request: CompareRequest) -> ComparisonResponse:
    """Handle compare."""
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        return compare_models(session)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
