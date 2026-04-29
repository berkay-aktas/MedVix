"""Router for Step 1 — Clinical Context (domain selection)."""

from typing import List

from fastapi import APIRouter, HTTPException

from app.models.domain import DomainDetail, DomainListResponse, DomainSummary
from app.services.domain_service import get_all_domains, get_domain_detail

router = APIRouter(prefix="/api/domains", tags=["Clinical Context"])


@router.get(
    "",
    response_model=DomainListResponse,
    summary="List all clinical domains",
    description="Returns summary information for all 20 clinical domains.",
)
async def list_domains() -> DomainListResponse:
    """Handle list domains."""
    summaries: List[DomainSummary] = get_all_domains()
    return DomainListResponse(domains=summaries, count=len(summaries))


@router.get(
    "/{domain_id}",
    response_model=DomainDetail,
    summary="Get domain details",
    description="Returns full metadata for a single clinical domain.",
    responses={404: {"description": "Domain not found"}},
)
async def get_domain(domain_id: str) -> DomainDetail:
    """Return the domain."""
    detail = get_domain_detail(domain_id)
    if detail is None:
        raise HTTPException(
            status_code=404,
            detail=f"Domain '{domain_id}' not found.",
        )
    return detail
