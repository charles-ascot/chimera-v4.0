"""
CHIMERA v4 - Analysis Endpoints
Copyright 2026 Ascot Wealth Management
"""

from fastapi import APIRouter, Request, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import pandas as pd
import io

router = APIRouter()


class AnalysisRequest(BaseModel):
    data: List[Dict[str, Any]]
    analysis_type: str = "eda"  # eda, feature_analysis, correlation


@router.post("/eda")
async def exploratory_data_analysis(
    request: Request,
    analysis_request: AnalysisRequest
):
    """
    Perform Exploratory Data Analysis on provided data.
    
    Returns statistics, distributions, and data quality metrics.
    """
    conductor = request.app.state.conductor
    
    task = {
        "agent": "analysis",
        "action": "eda",
        "data": analysis_request.data
    }
    
    result = await conductor.route_task(task)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/features")
async def feature_analysis(
    request: Request,
    analysis_request: AnalysisRequest
):
    """
    Analyze feature importance and patterns.
    
    Based on paper methodology, analyzes:
    - Favorite horse performance
    - Jockey win rates
    - Trainer statistics
    - Body weight optimization
    - Draw advantage
    """
    conductor = request.app.state.conductor
    
    task = {
        "agent": "analysis",
        "action": "feature_analysis",
        "data": analysis_request.data
    }
    
    result = await conductor.route_task(task)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/correlation")
async def correlation_analysis(
    request: Request,
    analysis_request: AnalysisRequest
):
    """
    Analyze feature correlations with target variable.
    """
    conductor = request.app.state.conductor
    
    task = {
        "agent": "analysis",
        "action": "correlation",
        "data": analysis_request.data
    }
    
    result = await conductor.route_task(task)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/upload")
async def analyze_uploaded_file(
    request: Request,
    file: UploadFile = File(...),
    analysis_type: str = "eda"
):
    """Analyze data from uploaded CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files supported")
    
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    conductor = request.app.state.conductor
    
    task = {
        "agent": "analysis",
        "action": analysis_type,
        "data": df.to_dict('records')
    }
    
    result = await conductor.route_task(task)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return {
        "filename": file.filename,
        "rows": len(df),
        "columns": len(df.columns),
        "analysis": result
    }


@router.post("/validate")
async def validate_data(
    request: Request,
    data: List[Dict[str, Any]]
):
    """
    Validate data against expected schema for horse racing prediction.
    
    Checks for required columns as per paper methodology.
    """
    conductor = request.app.state.conductor
    
    task = {
        "agent": "data",
        "action": "validate_data",
        "data": data
    }
    
    result = await conductor.route_task(task)
    
    return result
