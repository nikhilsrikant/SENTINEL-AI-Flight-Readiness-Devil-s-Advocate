"""Shared Pydantic models including the generic API envelope."""

from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ValidationFailure(BaseModel):
    """Details of a single field validation failure."""

    field: str = Field(..., description="Dot-separated field path that failed validation")
    constraint: str = Field(..., description="The constraint type that was violated")
    rejected_value: Any = Field(default=None, description="The value that was rejected")


class APIError(BaseModel):
    """Standard error object within the API response envelope."""

    message: str = Field(..., description="Human-readable error message")
    id: str = Field(..., description="Unique error identifier for tracing")
    validation_errors: list[ValidationFailure] | None = Field(
        default=None,
        description="Detailed validation failures (present only on 422 responses)",
    )


class APIResponse(BaseModel, Generic[T]):
    """Generic API response envelope wrapping all endpoint responses.

    All responses follow this structure for consistent client-side handling.
    """

    status: str = Field(
        ...,
        description="Response status: 'success' or 'error'",
        pattern=r"^(success|error)$",
    )
    data: T | None = Field(default=None, description="Response payload on success")
    error: APIError | None = Field(default=None, description="Error details on failure")


class GraniteAttribution(BaseModel):
    """Attribution metadata for IBM Granite AI-generated content."""

    model_name: str = Field(..., description="Granite model identifier")
    model_version: str = Field(..., description="Model version string")
    provider: str = Field(..., description="Active provider that served the response")
    badge_text: str = Field(
        default="Powered by IBM Granite",
        description="Display text for the attribution badge",
    )


class HistoricalPrecedent(BaseModel):
    """A historical incident used as a precedent in risk analysis."""

    incident_name: str = Field(..., description="Name of the historical incident")
    date: str = Field(..., description="Date of the incident (ISO 8601 or descriptive)")
    description: str = Field(..., description="Brief description of what happened")
    parallel: str = Field(..., description="How this precedent relates to the current situation")


class DataFreshnessInfo(BaseModel):
    """Metadata about the freshness and staleness of external data."""

    last_successful_retrieval: datetime = Field(
        ..., description="Timestamp of the last successful data fetch"
    )
    source: str = Field(..., description="Name of the external data source")
    is_stale: bool = Field(..., description="Whether the data exceeds its freshness threshold")
    cache_age_hours: float = Field(..., description="Hours since last successful retrieval")
