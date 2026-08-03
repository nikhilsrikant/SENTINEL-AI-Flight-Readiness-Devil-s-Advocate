"""Models for the Knowledge Graph module."""

from __future__ import annotations

from pydantic import BaseModel, Field

from backend.models.shared import GraniteAttribution


class IncidentRecord(BaseModel):
    """A complete incident record in the knowledge base."""

    id: str = Field(..., description="Unique incident identifier")
    date: str = Field(..., description="Incident date (ISO 8601)")
    mission: str = Field(..., description="Mission or program name")
    vehicle: str = Field(..., description="Vehicle or spacecraft involved")
    root_cause: str = Field(..., description="Identified root cause")
    contributing_factors: list[str] = Field(
        default_factory=list, description="Contributing factors"
    )
    outcome: str = Field(..., description="Outcome of the incident")
    lessons_learned: list[str] = Field(
        default_factory=list, description="Lessons learned from the incident"
    )
    related_incidents: list[str] = Field(
        default_factory=list, description="IDs of related incidents"
    )
    is_complete: bool = Field(
        default=True, description="Whether the record has been fully populated"
    )


class GraphNode(BaseModel):
    """A node in the knowledge graph visualization."""

    id: str = Field(..., description="Unique node identifier")
    label: str = Field(..., description="Display label for the node")
    type: str = Field(
        ..., description="Node type (e.g., incident, factor, vehicle, mission)"
    )
    connection_count: int = Field(
        default=0, ge=0, description="Number of edges connected to this node"
    )
    metadata: dict = Field(
        default_factory=dict, description="Additional node metadata"
    )


class GraphEdge(BaseModel):
    """An edge connecting two nodes in the knowledge graph."""

    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    relationship: str = Field(
        ..., description="Relationship type (e.g., caused_by, related_to, preceded)"
    )


class GraphData(BaseModel):
    """Complete graph structure for visualization."""

    nodes: list[GraphNode] = Field(default_factory=list, description="Graph nodes")
    edges: list[GraphEdge] = Field(default_factory=list, description="Graph edges")


class Citation(BaseModel):
    """A citation reference from the knowledge base."""

    incident_name: str = Field(..., description="Name of the cited incident")
    section: str = Field(..., description="Section of the incident record cited")
    similarity_score: float = Field(
        ..., ge=0.0, le=1.0, description="Semantic similarity score"
    )


class KnowledgeQueryResult(BaseModel):
    """Result of a knowledge graph query."""

    query: str = Field(..., description="Original query text")
    answer: str = Field(..., description="AI-generated answer")
    citations: list[Citation] = Field(
        default_factory=list, description="Supporting citations"
    )
    graph_context: GraphData | None = Field(
        default=None, description="Relevant subgraph for visualization"
    )
    attribution: GraniteAttribution = Field(..., description="AI attribution metadata")
