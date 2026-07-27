"""
app/main.py
FastAPI application entry point.

Startup order:
  1. Load settings (Pydantic BaseSettings)
  2. Initialise Supabase clients (module-level singletons in app/db/supabase.py)
  3. Mount all routers under /api/v1
  4. Add CORS middleware for the frontend dev server
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, weavers, credit, loans, assistant, transactions, credit_scoring



# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
settings = get_settings()
logging.basicConfig(level=settings.LOG_LEVEL.upper())
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (replaces deprecated @app.on_event)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Startup
    logger.info("🚀 Karghadhan API starting in [%s] mode", settings.APP_ENV)
    logger.info("📚 Docs available at http://localhost:8000/docs")
    yield
    # Shutdown
    logger.info("👋 Karghadhan API shutting down")


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Karghadhan API",
    description=(
        "Backend service for the Karghadhan Handloom Weaver Micro-Credit Platform. "
        "Provides alternative credit scoring, micro-loan facilitation, and "
        "vernacular AI assistance powered by Google Gemini."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    contact={
        "name": "Karghadhan Team",
        "url": "https://github.com/Madhanika-04/Karghadhan",
    },
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server and production frontend
# ---------------------------------------------------------------------------
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    settings.FRONTEND_ORIGIN,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
API_V1 = "/api/v1"

app.include_router(auth.router,      prefix=API_V1)
app.include_router(weavers.router,   prefix=API_V1)
app.include_router(credit.router,    prefix=API_V1)
app.include_router(loans.router,     prefix=API_V1)
app.include_router(assistant.router, prefix=API_V1)
app.include_router(transactions.router, prefix=API_V1)
app.include_router(credit_scoring.router, prefix=API_V1)




# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"], summary="Service health check")
async def health():
    """Returns 200 OK when the server is running."""
    return {
        "status": "ok",
        "environment": settings.APP_ENV,
        "version": "1.0.0",
    }
