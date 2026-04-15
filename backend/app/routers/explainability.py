"""API endpoints for Step 6 — Explainability."""

import logging

from fastapi import APIRouter, HTTPException

from app.models.explainability import (
    ExplainabilityRequest,
    ExplainabilityResponse,
    WaterfallRequest,
    WaterfallResponse,
)
from app.services import session_service
from app.services.domain_service import get_domain_detail
from app.services.explainability_service import (
    compute_feature_importance,
    compute_waterfall,
)

logger = logging.getLogger("medvix.explainability")

router = APIRouter(prefix="/api/explainability", tags=["Explainability"])


@router.post(
    "/feature-importance",
    response_model=ExplainabilityResponse,
    summary="Compute global SHAP feature importance",
    description="Returns ranked feature importance using SHAP values, clinical display names, and 3 patient options for waterfall.",
    responses={
        400: {"description": "Model not trained or SHAP computation failed"},
        404: {"description": "Session not found"},
    },
)
async def feature_importance(request: ExplainabilityRequest) -> ExplainabilityResponse:
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        items, patients = compute_feature_importance(session)
        domain = get_domain_detail(session.domain_id)
        return ExplainabilityResponse(
            feature_importance=items,
            sense_check_text=domain.sense_check_text or "",
            patients=patients,
            domain_id=session.domain_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("SHAP computation failed")
        raise HTTPException(status_code=500, detail=f"SHAP computation error: {str(exc)}")


@router.post(
    "/waterfall",
    response_model=WaterfallResponse,
    summary="Compute single-patient SHAP waterfall",
    description="Returns SHAP waterfall bars for a specific test patient, showing risk and protective factors.",
    responses={
        400: {"description": "Invalid patient index or model not trained"},
        404: {"description": "Session not found"},
    },
)
async def waterfall(request: WaterfallRequest) -> WaterfallResponse:
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        return compute_waterfall(session, request.model_id, request.patient_index)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Waterfall computation failed")
        raise HTTPException(status_code=500, detail=f"Waterfall computation error: {str(exc)}")
