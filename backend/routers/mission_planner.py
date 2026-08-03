"""Mission Planner REST API router.

Provides endpoints for mission plan generation, retrieval,
and pre-flight checklist creation.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.clients.granite_client import granite_client
from backend.models.shared import APIResponse
from backend.services.mission_planner import MissionPlannerService

router = APIRouter()

_service = MissionPlannerService(granite_client)


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------


class MissionPlanRequest(BaseModel):
    """Request body for mission plan generation."""

    mission_name: str = Field(..., description="Name of the mission")
    vehicle: str = Field(default="CST-100 Starliner", description="Vehicle/spacecraft")
    crew_size: int = Field(default=2, ge=0, description="Number of crew members")
    destination: str = Field(default="ISS (LEO)", description="Mission destination")
    objectives: list[str] = Field(default_factory=list, description="Mission objectives")
    constraints: list[str] = Field(default_factory=list, description="Mission constraints")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/generate")
async def generate_plan(request: MissionPlanRequest) -> dict:
    """Generate an AI-powered mission plan with phases, milestones, and resources.

    Includes safety margin enforcement and resource conflict detection.
    """
    try:
        plan = await _service.generate_plan(request.model_dump())
        return APIResponse(
            status="success",
            data=plan,
        ).model_dump()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.get("/plan/{plan_id}")
async def get_plan(plan_id: str) -> dict:
    """Retrieve a previously generated mission plan."""
    plan = _service.get_plan(plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan '{plan_id}' not found",
        )
    return APIResponse(
        status="success",
        data=plan,
    ).model_dump()


@router.get("/plan/{plan_id}/checklist")
async def get_checklist(plan_id: str) -> dict:
    """Generate a pre-flight readiness checklist for a mission plan.

    Returns comprehensive checklist with GO/NO-GO status for each item.
    """
    try:
        checklist = await _service.generate_checklist(plan_id)
        if "error" in checklist and not checklist.get("items"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=checklist["error"],
            )
        return APIResponse(
            status="success",
            data=checklist,
        ).model_dump()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
