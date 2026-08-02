"""Devil's Advocate REST API router.

Provides endpoints for cumulative risk analysis, go-fever bias detection,
risk timelines, and the Starliner case study demonstration.
"""

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.clients.granite_client import granite_client
from backend.models.shared import APIResponse
from backend.services.devils_advocate import DevilsAdvocateService

router = APIRouter()

# Service instance using the singleton granite client
_service = DevilsAdvocateService(granite_client)


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------


class RiskAnalysisRequest(BaseModel):
    """Request body for full risk analysis."""

    program_id: str = Field(..., description="Program or mission identifier")
    risk_factors: list[dict[str, Any]] = Field(
        ...,
        description=(
            "List of risk factor objects with keys: "
            "id, category, description, severity, score, source"
        ),
    )


class GoFeverRequest(BaseModel):
    """Request body for go-fever bias detection."""

    document: str = Field(
        ...,
        max_length=50000,
        description="Document text to analyze for go-fever bias (max 50,000 chars)",
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/analyze")
async def analyze_risk(request: RiskAnalysisRequest) -> dict:
    """Generate a full devil's advocate risk analysis report.

    Computes cumulative risk, identifies bias patterns, references
    historical precedents, and generates AI-powered recommendations.
    """
    try:
        report = await _service.analyze_risk(
            program_id=request.program_id,
            risk_factors=request.risk_factors,
        )
        return APIResponse(
            status="success",
            data=report.model_dump(mode="json"),
        ).model_dump()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.post("/go_fever")
async def detect_go_fever(request: GoFeverRequest) -> dict:
    """Analyze document text for go-fever bias indicators.

    Detects schedule pressure, normalization of deviance, dissent suppression,
    and appeal to authority patterns in decision documents.
    """
    try:
        analysis = await _service.detect_go_fever(document=request.document)
        return APIResponse(
            status="success",
            data=analysis.model_dump(mode="json"),
        ).model_dump()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.get("/timeline/{program_id}")
async def get_timeline(program_id: str) -> dict:
    """Retrieve the cumulative risk timeline for a program.

    Returns an ordered list of risk events showing how cumulative
    risk compounds over time using the formula:
        post_score = min(1.0, pre_score + contribution * (1 - pre_score))
    """
    timeline = _service.get_timeline(program_id)
    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No timeline found for program: {program_id}",
        )
    return APIResponse(
        status="success",
        data=[point.model_dump(mode="json") for point in timeline],
    ).model_dump()


@router.get("/case_study/starliner")
async def starliner_case_study() -> dict:
    """Get the full Boeing Starliner CFT case study data.

    Returns the pre-loaded Starliner timeline demonstrating cumulative
    risk compounding from contract award through crew return.
    """
    timeline = _service.get_timeline("starliner_cft")
    if not timeline:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Starliner data not loaded",
        )

    final_score = timeline[-1].post_event_score
    return APIResponse(
        status="success",
        data={
            "program_id": "starliner_cft",
            "program_name": "Boeing Starliner Crew Flight Test",
            "total_events": len(timeline),
            "final_cumulative_risk": round(final_score, 4),
            "timeline": [point.model_dump(mode="json") for point in timeline],
            "summary": (
                f"The Starliner CFT program accumulated a cumulative risk score "
                f"of {final_score:.4f} across {len(timeline)} tracked events. "
                f"Key risk inflection points include the OFT-1 software failure, "
                f"the internal risk acceptance decision, and the CFT in-orbit "
                f"thruster failures. This case study demonstrates how organizational "
                f"normalization of deviance compounds risk over time."
            ),
        },
    ).model_dump()
