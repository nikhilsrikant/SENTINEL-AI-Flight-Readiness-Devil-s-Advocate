"""Shared enumerations and scoring utilities for the SENTINEL platform."""

from __future__ import annotations

from enum import Enum


class SeverityLevel(str, Enum):
    """Risk severity classification levels."""

    NOMINAL = "nominal"
    ADVISORY = "advisory"
    CAUTION = "caution"
    WARNING = "warning"
    CRITICAL = "critical"


def severity_from_score(score: float) -> SeverityLevel:
    """Map a normalized risk score (0.0-1.0) to a SeverityLevel.

    Thresholds:
        0.0 - 0.2  -> NOMINAL
        0.2 - 0.4  -> ADVISORY
        0.4 - 0.6  -> CAUTION
        0.6 - 0.8  -> WARNING
        0.8 - 1.0  -> CRITICAL

    Args:
        score: A float between 0.0 and 1.0 inclusive.

    Returns:
        The corresponding SeverityLevel.

    Raises:
        ValueError: If score is outside [0.0, 1.0].
    """
    if score < 0.0 or score > 1.0:
        raise ValueError(f"Score must be between 0.0 and 1.0, got {score}")

    if score <= 0.2:
        return SeverityLevel.NOMINAL
    elif score <= 0.4:
        return SeverityLevel.ADVISORY
    elif score <= 0.6:
        return SeverityLevel.CAUTION
    elif score <= 0.8:
        return SeverityLevel.WARNING
    else:
        return SeverityLevel.CRITICAL


class ErrorCategory(str, Enum):
    """Categories for operational errors."""

    NETWORK = "network"
    DATA = "data"
    PROCESSING = "processing"
    UNKNOWN = "unknown"


class Provider(str, Enum):
    """AI inference provider identifiers."""

    WATSONX = "watsonx"
    OLLAMA = "ollama"
    HUGGINGFACE = "huggingface"
    MOCK = "mock"
