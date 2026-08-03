"""Models for the Space Academy educational module."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from backend.models.shared import GraniteAttribution


class QuizQuestion(BaseModel):
    """A single quiz question with options."""

    id: str = Field(..., description="Unique question identifier")
    question: str = Field(..., description="Question text")
    options: list[str] = Field(..., min_length=2, description="Answer options")
    correct_index: int = Field(..., ge=0, description="Index of the correct answer")
    explanation: str = Field(
        ..., description="Explanation of why the correct answer is correct"
    )
    difficulty: str = Field(
        default="medium", description="Difficulty level (easy, medium, hard)"
    )


class Quiz(BaseModel):
    """A complete quiz with questions and metadata."""

    id: str = Field(..., description="Unique quiz identifier")
    title: str = Field(..., description="Quiz title")
    topic: str = Field(..., description="Topic area")
    questions: list[QuizQuestion] = Field(
        default_factory=list, description="Quiz questions"
    )
    time_limit_seconds: int | None = Field(
        default=None, description="Optional time limit in seconds"
    )
    attribution: GraniteAttribution = Field(..., description="AI attribution metadata")


class QuizResult(BaseModel):
    """Result of a completed quiz attempt."""

    quiz_id: str = Field(..., description="Quiz identifier")
    score: float = Field(..., ge=0.0, le=1.0, description="Normalized score")
    correct_count: int = Field(..., ge=0, description="Number of correct answers")
    total_questions: int = Field(..., ge=1, description="Total number of questions")
    time_taken_seconds: float = Field(
        ..., ge=0.0, description="Time taken to complete"
    )
    feedback: str = Field(..., description="AI-generated performance feedback")
    completed_at: datetime = Field(
        default_factory=datetime.utcnow, description="Completion timestamp"
    )


class SimulationScenario(BaseModel):
    """An interactive simulation scenario for training."""

    id: str = Field(..., description="Unique scenario identifier")
    title: str = Field(..., description="Scenario title")
    description: str = Field(..., description="Scenario description and context")
    historical_basis: str | None = Field(
        default=None, description="Historical event this scenario is based on"
    )
    decision_points: list[dict] = Field(
        default_factory=list,
        description="Decision points with options and consequences",
    )
    difficulty: str = Field(
        default="medium", description="Difficulty level (easy, medium, hard)"
    )
    estimated_duration_minutes: int = Field(
        default=15, ge=1, description="Estimated completion time in minutes"
    )
    attribution: GraniteAttribution = Field(..., description="AI attribution metadata")


class SimulationOutcome(BaseModel):
    """Outcome of a completed simulation scenario."""

    scenario_id: str = Field(..., description="Scenario identifier")
    decisions_made: list[dict] = Field(
        default_factory=list, description="Decisions made during the simulation"
    )
    outcome_summary: str = Field(..., description="Summary of the outcome")
    score: float = Field(
        ..., ge=0.0, le=1.0, description="Performance score"
    )
    lessons: list[str] = Field(
        default_factory=list, description="Lessons identified from the simulation"
    )
    historical_comparison: str = Field(
        default="", description="Comparison with historical outcomes"
    )
    attribution: GraniteAttribution = Field(..., description="AI attribution metadata")
    completed_at: datetime = Field(
        default_factory=datetime.utcnow, description="Completion timestamp"
    )
