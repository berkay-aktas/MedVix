"""API endpoints for Step 6 — Explainability."""

import logging

from fastapi import APIRouter, HTTPException

from app.models.explainability import (
    AutoFindResponse,
    CounterfactualRequest,
    CounterfactualResponse,
    ExplainabilityRequest,
    ExplainabilityResponse,
    PatientMapResponse,
    WaterfallRequest,
    WaterfallResponse,
)
from app.services import session_service
from app.services.domain_service import get_domain_detail
from app.services.explainability_service import (
    auto_find_counterfactual,
    compute_counterfactual,
    compute_feature_importance,
    compute_patient_map,
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
    """Handle feature importance."""
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        items, patients = compute_feature_importance(session, request.model_id)
        domain = get_domain_detail(session.domain_id)
        return ExplainabilityResponse(
            feature_importance=items,
            sense_check_text=domain.sense_check_text or "",
            patients=patients,
            domain_id=session.domain_id,
        )
    except ValueError as exc:
        logger.error("Feature importance ValueError: %s", exc, exc_info=True)
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
    """Handle waterfall."""
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


@router.post(
    "/patient-map",
    response_model=PatientMapResponse,
    summary="Compute 2D patient risk map (PCA + per-patient probabilities)",
    description=(
        "Projects the test set into 2D via PCA and attaches per-patient predicted "
        "probability, predicted/actual class, and optional sex/age subgroup labels. "
        "Used by the Step 6 Patient Risk Map scatter plot."
    ),
    responses={
        400: {"description": "Model not trained or computation failed"},
        404: {"description": "Session not found"},
    },
)
async def patient_map(request: ExplainabilityRequest) -> PatientMapResponse:
    """Handle patient-map computation."""
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        return compute_patient_map(session, request.model_id)
    except ValueError as exc:
        logger.error("Patient map ValueError: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Patient map computation failed")
        raise HTTPException(status_code=500, detail=f"Patient map computation error: {str(exc)}")


@router.post(
    "/counterfactual",
    response_model=CounterfactualResponse,
    summary="Predict on a patient with optional feature overrides",
    description=(
        "Returns the model's predicted probability and class for the patient with "
        "any feature_overrides applied (in original/un-scaled units). Always returns "
        "feature_ranges so the frontend can render sliders and toggles. Pass an empty "
        "feature_overrides dict (or None) to get the baseline prediction."
    ),
    responses={
        400: {"description": "Invalid patient index, model not trained, or override application failed"},
        404: {"description": "Session not found"},
    },
)
async def counterfactual(request: CounterfactualRequest) -> CounterfactualResponse:
    """Compute counterfactual prediction for a patient."""
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        return compute_counterfactual(
            session,
            request.model_id,
            request.patient_index,
            request.feature_overrides,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Counterfactual computation failed")
        raise HTTPException(status_code=500, detail=f"Counterfactual error: {str(exc)}")


@router.post(
    "/counterfactual/auto-find",
    response_model=AutoFindResponse,
    summary="Find smallest single-feature change that flips the prediction",
    description=(
        "Runs a per-feature grid search (1st–99th percentile of training data) and returns "
        "the smallest delta that flips the predicted class. If no single-feature change "
        "within the typical range can flip the prediction, returns success=false with an explanation."
    ),
    responses={
        400: {"description": "Invalid patient index or model not trained"},
        404: {"description": "Session not found"},
    },
)
async def counterfactual_auto_find(request: WaterfallRequest) -> AutoFindResponse:
    """Auto-find a counterfactual flip via grid search."""
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        return auto_find_counterfactual(session, request.model_id, request.patient_index)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Counterfactual auto-find failed")
        raise HTTPException(status_code=500, detail=f"Auto-find error: {str(exc)}")
