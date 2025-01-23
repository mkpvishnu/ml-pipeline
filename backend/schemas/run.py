from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class RunStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ModuleRunResultBase(BaseModel):
    module_id: str
    status: str = "pending"
    metrics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    error: Optional[Dict[str, Any]] = Field(default_factory=dict)
    cache_location: Optional[str] = None

class ModuleRunResultCreate(ModuleRunResultBase):
    run_id: str

class ModuleRunResult(ModuleRunResultBase):
    id: int
    run_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    input_hash: Optional[str] = None
    output_hash: Optional[str] = None

    class Config:
        from_attributes = True

class CanvasRunBase(BaseModel):
    canvas_id: str
    status: str = "pending"
    module_runs: Optional[Dict[str, Any]] = Field(default_factory=dict)
    metrics: Optional[Dict[str, Any]] = Field(default_factory=dict)
    logs: Optional[List[str]] = Field(default_factory=list)
    error: Optional[Dict[str, Any]] = None
    cache_config: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CanvasRunCreate(CanvasRunBase):
    pass

class CanvasRun(CanvasRunBase):
    id: int
    run_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    module_run_results: List[ModuleRunResult] = []

    class Config:
        from_attributes = True

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
    total_runs: int = 0
    completed_runs: int = 0
    failed_runs: int = 0
    average_duration: Optional[float] = None
    success_rate: Optional[float] = None
    error_count: int = 0 