"""
CHIMERA v4 - Multi-Agent AI Horse Racing Prediction Platform
Copyright 2026 Ascot Wealth Management
Main FastAPI Application Entry Point
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog

from app.api import router as api_router
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.agents.conductor import ConductorAgent
from app.ml.model_manager import ModelManager

# Setup structured logging
setup_logging()
logger = structlog.get_logger()

# Global instances
conductor_agent: ConductorAgent = None
model_manager: ModelManager = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    global conductor_agent, model_manager
    
    logger.info("🚀 CHIMERA v4 Starting up...")
    
    # Initialize Model Manager
    model_manager = ModelManager()
    await model_manager.initialize()
    logger.info("✅ Model Manager initialized")
    
    # Initialize Conductor Agent (Master AI)
    conductor_agent = ConductorAgent(model_manager=model_manager)
    await conductor_agent.initialize()
    logger.info("✅ Conductor Agent initialized")
    
    # Store in app state
    app.state.conductor = conductor_agent
    app.state.model_manager = model_manager
    
    logger.info("🎯 CHIMERA v4 Ready for operations")
    
    yield
    
    # Cleanup on shutdown
    logger.info("🛑 CHIMERA v4 Shutting down...")
    if conductor_agent:
        await conductor_agent.shutdown()
    if model_manager:
        await model_manager.shutdown()
    logger.info("👋 CHIMERA v4 Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="CHIMERA v4",
    description="Multi-Agent AI Horse Racing Prediction Platform - Ascot Wealth Management",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://chimera4.thync.online",
        "https://chimera-v4.pages.dev",
        "*"  # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint - Health check"""
    return {
        "name": "CHIMERA v4",
        "version": "4.0.0",
        "status": "operational",
        "copyright": "2026 Ascot Wealth Management",
        "description": "Multi-Agent AI Horse Racing Prediction Platform"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for Cloud Run"""
    return {
        "status": "healthy",
        "service": "chimera-v4",
        "version": "4.0.0"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8080)),
        reload=settings.DEBUG
    )
