"""API endpoints for Step 7 — Ethics & Bias Audit."""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io

from app.models.ethics import (
    BiasAnalysisRequest,
    BiasAnalysisResponse,
    ChecklistItemDef,
    CertificateRequest,
)
from app.services import session_service
from app.services.ethics_service import (
    compute_bias_analysis,
    generate_certificate_pdf,
    get_checklist_items,
)
from typing import List

logger = logging.getLogger("medvix.ethics")

router = APIRouter(prefix="/api/ethics", tags=["Ethics & Bias"])


@router.post(
    "/bias-analysis",
    response_model=BiasAnalysisResponse,
    summary="Compute subgroup fairness metrics",
    description="Analyses model performance across demographic subgroups and detects bias.",
    responses={
        400: {"description": "Model not trained or analysis failed"},
        404: {"description": "Session not found"},
    },
)
async def bias_analysis(request: BiasAnalysisRequest) -> BiasAnalysisResponse:
    """Handle bias analysis."""
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        return compute_bias_analysis(session, request.model_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Bias analysis failed")
        raise HTTPException(status_code=500, detail=f"Bias analysis error: {str(exc)}")


@router.get(
    "/checklist-items",
    response_model=List[ChecklistItemDef],
    summary="Get EU AI Act checklist items",
    description="Returns the 8 EU AI Act compliance checklist items with pre-checked defaults.",
)
async def checklist_items() -> List[ChecklistItemDef]:
    """Handle checklist items."""
    return get_checklist_items()


@router.post(
    "/generate-certificate",
    summary="Generate PDF assessment certificate",
    description="Creates a downloadable PDF certificate with domain, model metrics, bias findings, and checklist status.",
    responses={
        400: {"description": "Invalid request or generation failed"},
        404: {"description": "Session not found"},
    },
)
async def generate_certificate(request: CertificateRequest):
    """Handle generate certificate."""
    session = session_service.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    try:
        pdf_bytes = generate_certificate_pdf(
            session, request.model_id, request.checklist_status
        )
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=MedVix_Certificate_{session.domain_id}_{request.model_id}.pdf"
            },
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("Certificate generation failed")
        raise HTTPException(status_code=500, detail=f"Certificate generation error: {str(exc)}")


# Alias at /api/generate-certificate (matches submission spec)
alias_router = APIRouter(tags=["Ethics & Bias"])


@alias_router.post(
    "/api/generate-certificate",
    summary="Generate PDF assessment certificate (alias)",
    description="Alias for /api/ethics/generate-certificate.",
    responses={
        400: {"description": "Invalid request or generation failed"},
        404: {"description": "Session not found"},
    },
)
async def generate_certificate_alias(request: CertificateRequest):
    """Handle generate certificate alias."""
    return await generate_certificate(request)
