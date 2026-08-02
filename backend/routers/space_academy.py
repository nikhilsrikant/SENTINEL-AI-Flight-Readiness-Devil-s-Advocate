"""Space Academy REST API router.

Provides endpoints for training scenarios, interactive simulations,
and AI-generated quizzes for spaceflight safety education.
"""

from typing import Any

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.clients.granite_client import granite_client
from backend.models.shared import APIResponse
from backend.services.space_academy import SpaceAcademyService

router = APIRouter()

_service = SpaceAcademyService(granite_client)


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------


class StartSimulationRequest(BaseModel):
    """Request body for starting a simulation."""

    scenario_id: str = Field(..., description="Scenario identifier to start")


class DecisionRequest(BaseModel):
    """Request body for submitting a simulation decision."""

    session_id: str = Field(..., description="Active session identifier")
    choice: str = Field(..., pattern=r"^[A-D]$", description="Selected option (A, B, C, or D)")


class QuizRequest(BaseModel):
    """Request body for quiz generation."""

    difficulty: str = Field(default="medium", pattern=r"^(easy|medium|hard|mixed)$", description="Difficulty level")
    count: int = Field(default=5, ge=1, le=20, description="Number of questions")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/scenarios")
async def get_scenarios() -> dict:
    """Get all available training scenarios.

    Returns scenario summaries without full decision point details.
    """
    scenarios = _service.get_scenarios()
    return APIResponse(
        status="success",
        data=scenarios,
    ).model_dump()


@router.post("/simulation/start")
async def start_simulation(request: StartSimulationRequest) -> dict:
    """Start an interactive simulation session.

    Returns session info with the first decision point.
    """
    result = _service.start_simulation(request.scenario_id)
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["error"],
        )
    return APIResponse(
        status="success",
        data=result,
    ).model_dump()


@router.post("/simulation/decide")
async def submit_decision(request: DecisionRequest) -> dict:
    """Submit a decision for the current simulation point.

    Returns outcome, AI analysis, and historical comparison.
    """
    try:
        result = await _service.submit_decision(
            session_id=request.session_id,
            choice=request.choice,
        )
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result["error"],
            )
        return APIResponse(
            status="success",
            data=result,
        ).model_dump()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.post("/quiz/generate")
async def generate_quiz(request: QuizRequest) -> dict:
    """Generate a quiz from the spaceflight safety question bank.

    Returns quiz with randomized questions at the specified difficulty.
    """
    try:
        quiz = await _service.generate_quiz(
            difficulty=request.difficulty,
            count=request.count,
        )
        return APIResponse(
            status="success",
            data=quiz,
        ).model_dump()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
