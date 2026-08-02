"""Models related to Granite AI client responses and fallback events."""

from datetime import datetime

from pydantic import BaseModel, Field


class GraniteResponse(BaseModel):
    """Response from the Granite AI client, regardless of active provider."""

    content: str = Field(..., description="Generated text content")
    model_name: str = Field(..., description="Model identifier used for generation")
    model_version: str = Field(..., description="Model version string")
    provider: str = Field(..., description="Provider that served this response")
    is_mock: bool = Field(..., description="Whether the response came from mock mode")
    metadata: dict = Field(
        default_factory=dict,
        description="Additional metadata (latency, token count, etc.)",
    )


class FallbackEvent(BaseModel):
    """Record of a provider failure and fallback transition."""

    failed_provider: str = Field(..., description="Provider that failed")
    error_type: str = Field(..., description="Category of the error encountered")
    http_status: int | None = Field(
        default=None, description="HTTP status code if applicable"
    )
    elapsed_ms: float = Field(..., description="Time spent before failure in milliseconds")
    next_provider: str = Field(..., description="Provider to try next in the chain")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the fallback event occurred",
    )
