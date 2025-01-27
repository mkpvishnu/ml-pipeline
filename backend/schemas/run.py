from typing import Optional, Dict
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

class RunStatus(str, Enum):
    """Run status enum"""
    REQUESTED = "REQUESTED"
    INPROGRESS = "INPROGRESS"
    WAITING = "WAITING"
    ERROR = "ERROR"
    COMPLETED = "COMPLETED"

class RunBase(BaseModel):
    """Base Run Schema"""
    status: RunStatus = RunStatus.REQUESTED
    results: Optional[Dict] = None
    error: Optional[Dict] = None

class RunCreate(RunBase):
    """Schema for creating a run"""
    canvas_id: Optional[int] = None
    module_id: Optional[int] = None

    @property
    def is_valid(self) -> bool:
        """Validate that either canvas_id or module_id is provided, but not both"""
        return (self.canvas_id is not None) != (self.module_id is not None)

class RunUpdate(RunBase):
    """Schema for updating a run"""
    status: Optional[RunStatus] = None
    results: Optional[Dict] = None
    error: Optional[Dict] = None

class RunStatusUpdate(BaseModel):
    """Schema for updating run status"""
    status: RunStatus
    results: Optional[Dict] = None
    error: Optional[Dict] = None

class RunStatusResponse(BaseModel):
    """Schema for run status response"""
    status: RunStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[Dict] = None

class RunResponse(RunBase):
    """Schema for run response"""
    id: int
    account_id: int
    canvas_id: Optional[int] = None
    module_id: Optional[int] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 