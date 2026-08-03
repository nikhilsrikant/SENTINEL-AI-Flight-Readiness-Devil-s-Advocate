"""Models for the Devil's Advocate risk analysis module."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from backend.models.enums import SeverityLevel
from backend.models.shared import GraniteAttribution, HistoricalPrecedent


class RiskFactor(BaseModel):
    """A single identified risk factor for mission assessment."""

    id: str = Field(..., description="Unique identifier for this risk factor")
    category: str = Field(..., description="Risk category (e.g., thermal, structural, human)")
    description: str = Field(..., description="Description of the risk")
    severity: SeverityLevel = Field(..., description="Severity classification")
    score: float = Field(..., ge=0.0, le=1.0, description="Normalized risk score")
    source: str = Field(..., description="Source of the risk identification")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="When the risk was identified"
    )


class CumulativeRiskPoint(BaseModel):
    """A point on the cumulative risk timeline showing risk compounding."""

    event_id: str = Field(..., description="Identifier for the triggering event")
    individual_contribution: float = Field(
        ..., ge=0.0, le=1.0, description="This event's individual risk contribution"
    )
    pre_event_score: float = Field(
        ..., ge=0.0, le=1.0, description="Cumulative risk score before this event"
    )
    post_event_score: float = Field(
        ..., ge=0.0, le=1.0, description="Cumulative risk score after this event"
    )
    timestamp: datetime = Field(..., description="Timestamp of the event")


class RiskAnalysisReport(BaseModel):
    """Complete devil's advocate risk analysis report."""

    mission_id: str = Field(..., description="Mission being analyzed")
    overall_risk_score: float = Field(
        ..., ge=0.0, le=1.0, description="Aggregated mission risk score"
    )
    severity: SeverityLevel = Field(..., description="Overall severity classification")
    risk_factors: list[RiskFactor] = Field(
        default_factory=list, description="Identified risk factors"
    )
    cumulative_timeline: list[CumulativeRiskPoint] = Field(
        default_factory=list, description="Risk accumulation over time"
    )
    historical_precedents: list[HistoricalPrecedent] = Field(
        default_factory=list, description="Relevant historical incidents"
    )
    recommendation: str = Field(..., description="AI-generated recommendation")
    attribution: GraniteAttribution = Field(..., description="AI attribution metadata")
    generated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Report generation timestamp"
    )


class GoFeverIndicator(BaseModel):
    """A detected go-fever bias indicator in decision text."""

    indicator_type: str = Field(
        ..., description="Type of bias indicator (e.g., schedule_pressure, groupthink)"
    )
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Confidence score for this detection"
    )
    source_text: str = Field(
        ..., description="Excerpt from the document that triggered detection"
    )
    char_offset_start: int = Field(
        ..., ge=0, description="Starting character offset in the source document"
    )
    char_offset_end: int = Field(
        ..., ge=0, description="Ending character offset in the source document"
    )
    mitigation: str = Field(
        ..., description="Suggested mitigation for this bias indicator"
    )


class GoFeverAnalysis(BaseModel):
    """Complete go-fever bias detection analysis."""

    document_id: str = Field(..., description="Identifier for the analyzed document")
    overall_bias_score: float = Field(
        ..., ge=0.0, le=1.0, description="Aggregate bias score"
    )
    indicators: list[GoFeverIndicator] = Field(
        default_factory=list, description="Detected bias indicators"
    )
    summary: str = Field(..., description="AI-generated summary of findings")
    attribution: GraniteAttribution = Field(..., description="AI attribution metadata")
    analyzed_at: datetime = Field(
        default_factory=datetime.utcnow, description="Analysis timestamp"
    )
