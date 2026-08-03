"""Models for the Orbital Monitor module."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from backend.models.enums import SeverityLevel


class Position3D(BaseModel):
    """3D position coordinates in Earth-Centered Inertial (ECI) frame."""

    x: float = Field(..., description="X coordinate in kilometers")
    y: float = Field(..., description="Y coordinate in kilometers")
    z: float = Field(..., description="Z coordinate in kilometers")


class OrbitalObject(BaseModel):
    """A tracked orbital object (satellite, debris, etc.)."""

    id: str = Field(..., description="NORAD catalog number or unique identifier")
    name: str = Field(..., description="Object name")
    type: str = Field(
        ..., description="Object type (e.g., payload, debris, rocket_body)"
    )
    position: Position3D = Field(..., description="Current ECI position")
    velocity: Position3D | None = Field(
        default=None, description="Current ECI velocity vector (km/s)"
    )
    epoch: datetime = Field(..., description="Epoch of the orbital elements")
    inclination_deg: float = Field(
        default=0.0, description="Orbital inclination in degrees"
    )
    apogee_km: float = Field(default=0.0, description="Apogee altitude in km")
    perigee_km: float = Field(default=0.0, description="Perigee altitude in km")


class Conjunction(BaseModel):
    """A predicted close approach between two orbital objects."""

    id: str = Field(..., description="Unique conjunction event identifier")
    primary_object: str = Field(..., description="Primary object ID")
    secondary_object: str = Field(..., description="Secondary object ID")
    time_of_closest_approach: datetime = Field(
        ..., description="Predicted TCA"
    )
    miss_distance_km: float = Field(
        ..., ge=0.0, description="Predicted miss distance in km"
    )
    probability_of_collision: float = Field(
        ..., ge=0.0, le=1.0, description="Estimated collision probability"
    )
    severity: SeverityLevel = Field(..., description="Conjunction severity level")


class TLELoadResult(BaseModel):
    """Result of loading Two-Line Element sets."""

    source: str = Field(..., description="TLE data source (e.g., CelesTrak)")
    objects_loaded: int = Field(..., ge=0, description="Number of objects loaded")
    objects_failed: int = Field(
        default=0, ge=0, description="Number of objects that failed to parse"
    )
    epoch: datetime = Field(..., description="Data epoch timestamp")
    load_duration_ms: float = Field(
        ..., ge=0.0, description="Time taken to load in milliseconds"
    )


class CollisionAssessment(BaseModel):
    """AI-assisted collision risk assessment."""

    conjunction_id: str = Field(..., description="Related conjunction event ID")
    risk_level: SeverityLevel = Field(..., description="Assessed risk level")
    recommended_action: str = Field(
        ..., description="Recommended action (e.g., monitor, maneuver)"
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence in the assessment"
    )
    analysis_summary: str = Field(..., description="Summary of the risk analysis")
    assessed_at: datetime = Field(
        default_factory=datetime.utcnow, description="Assessment timestamp"
    )
