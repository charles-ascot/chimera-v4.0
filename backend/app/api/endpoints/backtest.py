"""
CHIMERA v4 - Backtesting Endpoints
Copyright 2026 Ascot Wealth Management
"""

from fastapi import APIRouter, Request, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import pandas as pd
import io

router = APIRouter()


class BacktestStrategy(BaseModel):
    """Backtesting strategy configuration"""
    initial_bankroll: float = 100000.0
    stake_per_bet: float = 100.0
    min_probability: float = 0.5
    model_name: str = "random_forest"
    stop_loss_percent: Optional[float] = 15.0
    max_daily_bets: Optional[int] = None


class BacktestRequest(BaseModel):
    """Backtesting request with data and strategy"""
    data: List[Dict[str, Any]]
    strategy: BacktestStrategy


class BacktestResult(BaseModel):
    """Backtesting results"""
    initial_bankroll: float
    final_bankroll: float
    profit_loss: float
    roi_percent: float
    total_bets: int
    wins: int
    losses: int
    win_rate: float
    max_drawdown: float
    strategy: Dict[str, Any]


@router.post("/run", response_model=BacktestResult)
async def run_backtest(
    request: Request,
    backtest_request: BacktestRequest
):
    """
    Run backtesting simulation on historical data.
    
    Simulates betting strategy using trained ML model predictions
    against actual historical outcomes.
    """
    conductor = request.app.state.conductor
    model_manager = request.app.state.model_manager
    
    if not model_manager.is_trained:
        raise HTTPException(
            status_code=400, 
            detail="Model not trained. Train the model first before backtesting."
        )
    
    task = {
        "agent": "backtest",
        "action": "run_backtest",
        "data": backtest_request.data,
        "strategy": backtest_request.strategy.model_dump()
    }
    
    result = await conductor.route_task(task)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return BacktestResult(**result)


@router.post("/upload")
async def backtest_from_file(
    request: Request,
    file: UploadFile = File(...),
    initial_bankroll: float = 100000.0,
    stake_per_bet: float = 100.0,
    min_probability: float = 0.5
):
    """Run backtest from uploaded CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files supported")
    
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    model_manager = request.app.state.model_manager
    
    if not model_manager.is_trained:
        raise HTTPException(
            status_code=400, 
            detail="Model not trained. Train the model first before backtesting."
        )
    
    conductor = request.app.state.conductor
    
    strategy = {
        "initial_bankroll": initial_bankroll,
        "stake_per_bet": stake_per_bet,
        "min_probability": min_probability
    }
    
    task = {
        "agent": "backtest",
        "action": "run_backtest",
        "data": df.to_dict('records'),
        "strategy": strategy
    }
    
    result = await conductor.route_task(task)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return {
        "filename": file.filename,
        "rows_processed": len(df),
        "results": result
    }


@router.post("/report")
async def generate_backtest_report(
    request: Request,
    backtest_results: Dict[str, Any]
):
    """Generate detailed performance report from backtest results"""
    conductor = request.app.state.conductor
    
    task = {
        "agent": "backtest",
        "action": "performance_report",
        "backtest_results": backtest_results
    }
    
    result = await conductor.route_task(task)
    
    return result


@router.get("/strategies")
async def get_default_strategies():
    """Get list of predefined backtesting strategies"""
    return {
        "strategies": [
            {
                "name": "Conservative",
                "description": "Low risk, high probability threshold",
                "config": {
                    "min_probability": 0.65,
                    "stake_per_bet": 50,
                    "stop_loss_percent": 10
                }
            },
            {
                "name": "Balanced",
                "description": "Moderate risk and return",
                "config": {
                    "min_probability": 0.5,
                    "stake_per_bet": 100,
                    "stop_loss_percent": 15
                }
            },
            {
                "name": "Aggressive",
                "description": "Higher risk, lower probability threshold",
                "config": {
                    "min_probability": 0.4,
                    "stake_per_bet": 200,
                    "stop_loss_percent": 20
                }
            },
            {
                "name": "Kelly Criterion",
                "description": "Optimal stake sizing based on edge",
                "config": {
                    "min_probability": 0.5,
                    "stake_type": "kelly",
                    "kelly_fraction": 0.25
                }
            }
        ]
    }
