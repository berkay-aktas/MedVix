"""MedVix FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import data, domains, health, ml, preparation
from app.services.session_service import cleanup_expired_sessions

logger = logging.getLogger("medvix")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle events."""
    logger.info("MedVix API started")
    cleanup_expired_sessions()
    yield
    logger.info("MedVix API shutting down — cleaning up sessions")
    cleanup_expired_sessions(max_age_minutes=0)


app = FastAPI(
    title="MedVix API",
    description="ML Visualization Tool for Healthcare Professionals",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(health.router)
app.include_router(domains.router)
app.include_router(data.router)
app.include_router(preparation.router)
app.include_router(ml.router)


# --- Global exception handlers ---

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "error_code": "VALIDATION_ERROR"},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred.",
            "error_code": "INTERNAL_ERROR",
        },
    )
