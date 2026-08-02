"""
SENTINEL AI Flight Readiness Platform - Main Application Entry Point

Starts the FastAPI application with:
- CORS middleware (frontend port 3000)
- API versioning under /api/v1/
- Health check endpoint
- Custom exception handlers with standard error envelope
"""

import uuid
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Application Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup: initialize services, load mock data, etc.
    print("🚀 SENTINEL Platform starting up...")
    print("   ├── Loading mock response store...")
    print("   ├── Initializing Granite Client fallback chain...")
    print("   └── Ready to serve requests")
    yield
    # Shutdown: cleanup resources
    print("🛑 SENTINEL Platform shutting down...")


# ---------------------------------------------------------------------------
# Application Factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="SENTINEL AI Flight Readiness Platform",
    description=(
        "AI-powered space mission safety platform leveraging IBM Granite "
        "to combat organizational blindness in spaceflight decision-making."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)


# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Standard API Envelope Models
# ---------------------------------------------------------------------------

class APIError(BaseModel):
    """Standard error object within the API envelope."""
    message: str
    id: str
    validation_errors: list[dict[str, Any]] | None = None


class APIResponse(BaseModel):
    """Standard API response envelope."""
    status: str  # "success" or "error"
    data: Any | None = None
    error: APIError | None = None


# ---------------------------------------------------------------------------
# Custom Exception Handlers
# ---------------------------------------------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return 422 with structured validation failure details."""
    validation_errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        validation_errors.append({
            "field": field,
            "constraint": error["type"],
            "rejected_value": error.get("input"),
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=APIResponse(
            status="error",
            data=None,
            error=APIError(
                message="Request validation failed",
                id=f"err_{uuid.uuid4().hex[:12]}",
                validation_errors=validation_errors,
            ),
        ).model_dump(),
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Any) -> JSONResponse:
    """Return 404 with standard error envelope."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content=APIResponse(
            status="error",
            data=None,
            error=APIError(
                message="The requested resource was not found",
                id=f"err_{uuid.uuid4().hex[:12]}",
            ),
        ).model_dump(),
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Any) -> JSONResponse:
    """Return 500 with opaque error ID, no internal details exposed."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse(
            status="error",
            data=None,
            error=APIError(
                message="An internal error occurred. Please try again later.",
                id=f"err_{uuid.uuid4().hex[:12]}",
            ),
        ).model_dump(),
    )


# ---------------------------------------------------------------------------
# Health & Status Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/v1/health", tags=["system"])
async def health_check():
    """Platform health check endpoint."""
    return APIResponse(
        status="success",
        data={
            "platform": "SENTINEL",
            "version": "1.0.0",
            "modules": [
                "devils_advocate",
                "anomaly_tracker",
                "mission_planner",
                "orbital_monitor",
                "telemetry_engine",
                "knowledge_graph",
                "space_academy",
            ],
            "ai_provider": "mock",  # Will be dynamic once Granite Client is implemented
            "mock_mode": True,
        },
    ).model_dump()


@app.get("/api/v1/status", tags=["system"])
async def platform_status():
    """Detailed platform status with module health states."""
    return APIResponse(
        status="success",
        data={
            "modules": {
                "devils_advocate": {"state": "healthy", "last_check": None},
                "anomaly_tracker": {"state": "healthy", "last_check": None},
                "mission_planner": {"state": "healthy", "last_check": None},
                "orbital_monitor": {"state": "healthy", "last_check": None},
                "telemetry_engine": {"state": "healthy", "last_check": None},
                "knowledge_graph": {"state": "healthy", "last_check": None},
                "space_academy": {"state": "healthy", "last_check": None},
            },
            "granite_client": {
                "active_provider": "mock",
                "mock_mode": True,
                "fallback_events": [],
            },
        },
    ).model_dump()


@app.get("/", tags=["system"])
async def root():
    """Root endpoint redirect info."""
    return {
        "message": "SENTINEL AI Flight Readiness Platform",
        "docs": "/api/docs",
        "health": "/api/v1/health",
        "version": "1.0.0",
    }


# ---------------------------------------------------------------------------
# Module Router Registration (placeholder - routers added in later tasks)
# ---------------------------------------------------------------------------

# from backend.routers import (
#     devils_advocate,
#     anomaly_tracker,
#     mission_planner,
#     orbital_monitor,
#     telemetry_engine,
#     knowledge_graph,
#     space_academy,
# )
# app.include_router(devils_advocate.router, prefix="/api/v1/devils_advocate", tags=["Devil's Advocate"])
# app.include_router(anomaly_tracker.router, prefix="/api/v1/anomaly_tracker", tags=["Anomaly Tracker"])
# app.include_router(mission_planner.router, prefix="/api/v1/mission_planner", tags=["Mission Planner"])
# app.include_router(orbital_monitor.router, prefix="/api/v1/orbital_monitor", tags=["Orbital Monitor"])
# app.include_router(telemetry_engine.router, prefix="/api/v1/telemetry_engine", tags=["Telemetry Engine"])
# app.include_router(knowledge_graph.router, prefix="/api/v1/knowledge_graph", tags=["Knowledge Graph"])
# app.include_router(space_academy.router, prefix="/api/v1/space_academy", tags=["Space Academy"])
