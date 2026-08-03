"""Orbital Monitor REST API router.

Provides endpoints for tracked object catalog, conjunction events,
and collision risk assessment.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.clients.granite_client import granite_client
from backend.models.shared import APIResponse
from backend.services.orbital_monitor import OrbitalMonitorService

router = APIRouter()

_service = OrbitalMonitorService(granite_client)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/objects")
async def get_tracked_objects() -> dict:
    """Get all tracked orbital objects.

    Returns catalog of satellites, debris, and rocket bodies with
    current position and orbital parameters.
    """
    objects = _service.get_tracked_objects()
    return APIResponse(
        status="success",
        data={
            "objects": objects,
            "total_count": len(objects),
            "type_breakdown": {
                "payload": sum(1 for o in objects if o["type"] == "payload"),
                "debris": sum(1 for o in objects if o["type"] == "debris"),
                "rocket_body": sum(1 for o in objects if o["type"] == "rocket_body"),
            },
        },
    ).model_dump()


@router.get("/conjunctions")
async def get_conjunctions() -> dict:
    """Get all predicted conjunction events.

    Returns close approaches sorted by time of closest approach.
    """
    conjunctions = _service.compute_conjunctions()
    return APIResponse(
        status="success",
        data={
            "conjunctions": conjunctions,
            "total_count": len(conjunctions),
        },
    ).model_dump()


@router.get("/conjunction/{conjunction_id}")
async def get_conjunction_assessment(conjunction_id: str) -> dict:
    """AI-assisted collision risk assessment for a conjunction event.

    Returns risk level, recommended action, and detailed analysis.
    """
    try:
        assessment = await _service.assess_collision_risk(conjunction_id)
        if "error" in assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=assessment["error"],
            )
        return APIResponse(
            status="success",
            data=assessment,
        ).model_dump()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
