"""Anomaly Tracker REST API router.

Provides endpoints for telemetry ingestion, pattern analysis,
and escalation alerts for cross-mission anomaly tracking.
"""

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.clients.granite_client import granite_client
from backend.models.shared import APIResponse
from backend.services.anomaly_tracker import AnomalyTrackerService

router = APIRouter()

_service = AnomalyTrackerService(granite_client)


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------


class TelemetryIngestRequest(BaseModel):
    """Request body for telemetry ingestion."""

    program_id: str = Field(..., description="Program identifier")
    parameter: str = Field(..., description="Telemetry parameter name")
    value: float = Field(..., description="Measured value")
    timestamp: str | None = Field(default=None, description="Optional ISO timestamp")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/ingest")
async def ingest_telemetry(request: TelemetryIngestRequest) -> dict:
    """Ingest telemetry data and detect anomalies.

    Applies threshold-based detection and records any anomalies found.
    """
    data = request.model_dump()
    result = _service.ingest_telemetry(data)
    return APIResponse(
        status="success",
        data=result,
    ).model_dump()


@router.get("/patterns/{program_id}")
async def get_patterns(program_id: str) -> dict:
    """Get cross-mission anomaly patterns for a program.

    Returns category breakdown, severity distribution, and trend analysis.
    """
    patterns = _service.get_patterns(program_id)
    return APIResponse(
        status="success",
        data=patterns,
    ).model_dump()


@router.get("/alerts/{program_id}")
async def get_alerts(program_id: str) -> dict:
    """Check for escalation alerts across anomaly categories.

    Detects 2x frequency increases that indicate systematic failure progression.
    """
    patterns = _service.get_patterns(program_id)
    categories = patterns.get("category_breakdown", {})

    alerts = []
    for category in categories:
        escalation = _service.detect_escalation(category, program_id)
        if escalation:
            alerts.append(escalation)

    return APIResponse(
        status="success",
        data={
            "program_id": program_id,
            "alerts": alerts,
            "total_alerts": len(alerts),
        },
    ).model_dump()
