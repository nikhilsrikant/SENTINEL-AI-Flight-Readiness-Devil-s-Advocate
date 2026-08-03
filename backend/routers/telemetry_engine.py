"""Telemetry Engine REST API router.

Provides endpoints for telemetry translation, trend classification,
recommendations, and a WebSocket stream for real-time data.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any

from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel, Field

from backend.clients.granite_client import granite_client
from backend.models.shared import APIResponse
from backend.services.telemetry_engine import TelemetryEngineService

router = APIRouter()

_service = TelemetryEngineService(granite_client)


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------


class TranslateRequest(BaseModel):
    """Request body for telemetry translation."""

    parameter: str = Field(..., description="Telemetry parameter name")
    value: float = Field(..., description="Measured value")
    timestamp: str | None = Field(default=None, description="Optional ISO timestamp")


class RecommendationRequest(BaseModel):
    """Request body for recommendation generation."""

    parameter: str = Field(..., description="Parameter name")
    condition: str = Field(..., description="Condition or anomaly description")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/translate")
async def translate_telemetry(request: TranslateRequest) -> dict:
    """Convert raw telemetry to plain-English summary.

    Provides human-readable interpretation of spacecraft sensor data.
    """
    data = request.model_dump()
    result = _service.translate(data)
    return APIResponse(
        status="success",
        data=result,
    ).model_dump()


@router.get("/trends/{parameter}")
async def get_trend(parameter: str) -> dict:
    """Classify a parameter's trend as improving/stable/degrading.

    Uses linear regression on rolling history for classification.
    """
    result = _service.classify_trend(parameter)
    return APIResponse(
        status="success",
        data=result,
    ).model_dump()


@router.post("/recommend")
async def get_recommendation(request: RecommendationRequest) -> dict:
    """Generate actionable recommendation for a telemetry condition."""
    try:
        result = await _service.generate_recommendation(
            parameter=request.parameter,
            condition=request.condition,
        )
        return APIResponse(
            status="success",
            data=result,
        ).model_dump()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.get("/current")
async def get_current_telemetry() -> dict:
    """Get current state of all telemetry parameters."""
    data = _service.get_current_telemetry()
    return APIResponse(
        status="success",
        data=data,
    ).model_dump()


@router.websocket("/stream")
async def telemetry_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time telemetry streaming.

    Sends simulated telemetry data every 2 seconds.
    """
    await websocket.accept()
    try:
        while True:
            tick_data = _service.simulate_telemetry_tick()
            await websocket.send_json({
                "type": "telemetry_update",
                "channel": "all_subsystems",
                "payload": tick_data,
                "sequence": int(asyncio.get_event_loop().time() * 1000),
            })
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        pass
    except Exception:
        await websocket.close()
