"""FastAPI route handlers for REST API endpoints."""

from backend.routers import (
    anomaly_tracker,
    devils_advocate,
    knowledge_graph,
    mission_planner,
    orbital_monitor,
    space_academy,
    telemetry_engine,
)

__all__ = [
    "anomaly_tracker",
    "devils_advocate",
    "knowledge_graph",
    "mission_planner",
    "orbital_monitor",
    "space_academy",
    "telemetry_engine",
]
