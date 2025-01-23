from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class RunStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ModuleRunResult(BaseModel):
    """Schema for individual module run results"""
    module_id: str
    version: str
    status: RunStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    execution_time: Optional[float] = None
    output: Optional[Dict] = None
    error: Optional[Dict] = None
    logs: List[str] = Field(default_factory=list)
    metrics: Dict = Field(default_factory=dict)

class CanvasRunBase(BaseModel):
    """Base Canvas Run Schema"""
    canvas_id: str
    status: RunStatus = RunStatus.PENDING
    module_runs: Dict[str, ModuleRunResult] = Field(default_factory=dict)
    metrics: Dict = Field(default_factory=dict)
    logs: List[str] = Field(default_factory=list)
    error: Optional[Dict] = None
    cache_config: Dict = Field(default_factory=dict)

class CanvasRunCreate(CanvasRunBase):
    """Schema for creating a canvas run"""
    pass

class CanvasRunUpdate(BaseModel):
    """Schema for updating a canvas run"""
    status: Optional[RunStatus] = None
    module_runs: Optional[Dict[str, ModuleRunResult]] = None
    metrics: Optional[Dict] = None
    logs: Optional[List[str]] = None
    error: Optional[Dict] = None
    cache_config: Optional[Dict] = None

class CanvasRunResponse(CanvasRunBase):
    """Schema for canvas run response"""
    id: int
    run_id: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    execution_time: Optional[float] = None

    class Config:
        from_attributes = True

class ModuleRunStats(BaseModel):
    """Schema for module run statistics"""
    total_runs: int
    success_rate: float
    avg_execution_time: float
    last_run_status: RunStatus
    last_run_at: Optional[datetime]
    error_count: int 