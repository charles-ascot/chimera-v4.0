"""
CHIMERA v4 - Agent Management Endpoints
Copyright 2026 Ascot Wealth Management
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

router = APIRouter()


class AgentTask(BaseModel):
    """Task to send to an agent"""
    agent: str
    action: str
    data: Optional[Dict[str, Any]] = None
    priority: str = "medium"


class AgentStatus(BaseModel):
    """Agent status response"""
    name: str
    status: str
    tasks_completed: int
    tasks_failed: int
    current_task: Optional[str]
    last_active: Optional[str]


@router.get("")
async def list_agents(request: Request):
    """List all available AI agents"""
    conductor = request.app.state.conductor
    
    agents = []
    for name, agent in conductor.agents.items():
        status = agent.get_status()
        agents.append(AgentStatus(**status))
    
    return {
        "conductor_status": conductor.status.value,
        "agents": [a.model_dump() for a in agents]
    }


@router.get("/{agent_name}")
async def get_agent_status(request: Request, agent_name: str):
    """Get status of a specific agent"""
    conductor = request.app.state.conductor
    
    if agent_name not in conductor.agents:
        raise HTTPException(status_code=404, detail=f"Agent not found: {agent_name}")
    
    agent = conductor.agents[agent_name]
    return agent.get_status()


@router.post("/task")
async def execute_agent_task(request: Request, task: AgentTask):
    """Execute a task through an agent"""
    conductor = request.app.state.conductor
    
    if task.agent not in conductor.agents:
        raise HTTPException(status_code=404, detail=f"Agent not found: {task.agent}")
    
    task_dict = {
        "agent": task.agent,
        "action": task.action,
        "priority": task.priority
    }
    if task.data:
        task_dict.update(task.data)
    
    result = await conductor.route_task(task_dict)
    
    return {
        "agent": task.agent,
        "action": task.action,
        "result": result
    }


@router.get("/conductor/status")
async def get_conductor_status(request: Request):
    """Get master conductor status and system overview"""
    conductor = request.app.state.conductor
    return conductor.get_system_status()


@router.post("/conductor/broadcast")
async def broadcast_to_agents(request: Request, message: Dict[str, Any]):
    """Broadcast a message to all agents"""
    conductor = request.app.state.conductor
    results = await conductor.broadcast(message)
    return {"broadcast_results": results}


@router.get("/monitor/health")
async def get_system_health(request: Request):
    """Get comprehensive system health from MonitorAgent"""
    conductor = request.app.state.conductor
    
    task = {
        "agent": "monitor",
        "action": "system_health"
    }
    
    result = await conductor.route_task(task)
    return result


@router.get("/monitor/metrics")
async def get_performance_metrics(request: Request):
    """Get model performance metrics"""
    conductor = request.app.state.conductor
    
    task = {
        "agent": "monitor",
        "action": "performance_metrics"
    }
    
    result = await conductor.route_task(task)
    return result
