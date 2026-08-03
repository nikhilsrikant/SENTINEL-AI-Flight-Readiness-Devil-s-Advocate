"""Knowledge Graph REST API router.

Provides endpoints for semantic search, graph visualization,
and incident retrieval from the spaceflight knowledge base.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from backend.clients.granite_client import granite_client
from backend.models.shared import APIResponse
from backend.services.knowledge_graph import KnowledgeGraphService

router = APIRouter()

_service = KnowledgeGraphService(granite_client)


# ---------------------------------------------------------------------------
# Request Models
# ---------------------------------------------------------------------------


class KnowledgeQueryRequest(BaseModel):
    """Request body for knowledge graph query."""

    query: str = Field(..., max_length=2000, description="Natural language query")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results to return")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/query")
async def query_knowledge(request: KnowledgeQueryRequest) -> dict:
    """Semantic search over the spaceflight incident knowledge base.

    Returns AI-generated answer with citations and graph context.
    """
    try:
        result = await _service.query(
            query_text=request.query,
            top_k=request.top_k,
        )
        return APIResponse(
            status="success",
            data=result.model_dump(mode="json"),
        ).model_dump()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.get("/graph")
async def get_graph(max_nodes: int = Query(default=200, ge=1, le=500)) -> dict:
    """Get full knowledge graph data for D3 visualization.

    Returns nodes and edges representing incidents and their relationships.
    """
    graph_data = _service.get_graph_data(max_nodes=max_nodes)
    return APIResponse(
        status="success",
        data=graph_data.model_dump(mode="json"),
    ).model_dump()


@router.get("/incident/{incident_id}")
async def get_incident(incident_id: str) -> dict:
    """Retrieve a single incident record by ID."""
    record = _service.get_incident(incident_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' not found",
        )
    return APIResponse(
        status="success",
        data=record.model_dump(mode="json"),
    ).model_dump()


@router.get("/incidents")
async def search_incidents(q: str = Query(..., min_length=1, max_length=500)) -> dict:
    """Keyword search across all incidents in the knowledge base."""
    results = _service.search_incidents(q)
    return APIResponse(
        status="success",
        data=[r.model_dump(mode="json") for r in results],
    ).model_dump()
