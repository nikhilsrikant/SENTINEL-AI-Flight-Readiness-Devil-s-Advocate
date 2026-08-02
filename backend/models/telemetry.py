"""Models for the Telemetry Engine module."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from backend.models.enums import SeverityLevel
from backend.models.shared import GraniteAttribution


class TelemetryDataPoint(BaseModel):
    """A single telemetry measurement."""

    timestamp: datetime = Field(..., description="Measurement timestamp")
    parameter: str = Field(..., description="Parameter name (e.g., cabin_pressure_psi)")
    value: float = Field(..., description="Measured value")
    unit: str = Field(..., description="Unit of measurement")
    status: SeverityLevel = Field(
        default=SeverityLevel.NOMINAL, description="Parameter status classification"
    )


class TrendClassification(BaseModel):
    """Classification of a telemetry parameter's trend direction."""

    direction: Literal["improving", "stable", "degrading"] = Field(
        ..., description="Trend direction"
    )
    rate_of_change: float = Field(
        ..., description="Rate of change per unit time"
    )
    data_points_analyzed: int = Field(
        ..., ge=1, description="Number of data points used in trend analysis"
    )


class Recommendation(BaseModel):
    """An actionable recommendation based on telemetry analysis."""

    condition: str = Field(
        ..., description="The condition or anomaly triggering this recommendation"
    )
    possible_causes: list[str] = Field(
        default_factory=list, description="Possible root causes"
    )
    suggested_actions: list[str] = Field(
        default_factory=list, description="Suggested corrective actions"
    )


class TelemetryInsight(BaseModel):
    """AI-generated insight from telemetry analysis."""

    parameter: str = Field(..., description="Telemetry parameter analyzed")
    summary: str = Field(..., description="Human-readable insight summary")
    trend: TrendClassification = Field(..., description="Trend classification")
    recommendations: list[Recommendation] = Field(
        default_factory=list, description="Actionable recommendations"
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence in the analysis"
    )
    attribution: GraniteAttribution = Field(..., description="AI attribution metadata")


class WebSocketMessage(BaseModel):
    """Message schema for telemetry WebSocket communication."""

    type: str = Field(
        ..., description="Message type (e.g., telemetry_update, insight, error)"
    )
    channel: str = Field(..., description="Channel/topic for the message")
    payload: dict = Field(default_factory=dict, description="Message payload data")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Message timestamp"
    )
    sequence: int = Field(default=0, description="Message sequence number for ordering")
