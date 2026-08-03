"""Pydantic data models for request/response schemas."""

from __future__ import annotations

from backend.models.enums import (
    ErrorCategory,
    Provider,
    SeverityLevel,
    severity_from_score,
)
from backend.models.granite import FallbackEvent, GraniteResponse
from backend.models.shared import (
    APIError,
    APIResponse,
    DataFreshnessInfo,
    GraniteAttribution,
    HistoricalPrecedent,
    ValidationFailure,
)

__all__ = [
    # Enums
    "ErrorCategory",
    "Provider",
    "SeverityLevel",
    "severity_from_score",
    # Granite
    "FallbackEvent",
    "GraniteResponse",
    # Shared
    "APIError",
    "APIResponse",
    "DataFreshnessInfo",
    "GraniteAttribution",
    "HistoricalPrecedent",
    "ValidationFailure",
]
