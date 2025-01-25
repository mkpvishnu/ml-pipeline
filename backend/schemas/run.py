from typing import Optional, Dict
from datetime import datetime
from enum import Enum

from pydantic import Field

from .base import BaseSchema

class RunStatus(str, Enum):
    """Run status enum"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RunBase(BaseSchema):
    """Base Run Schema"""
    status: RunStatus = RunStatus.PENDING
    results: Optional[Dict] = None
    error: Optional[Dict] = None


class RunCreate(RunBase):
    """Schema for creating a run"""
    canvas_id: str


class RunUpdate(RunBase):
    """Schema for updating a run"""
    canvas_id: Optional[str] = None
    status: Optional[RunStatus] = None
    results: Optional[Dict] = None
    error: Optional[Dict] = None


class RunStatusUpdate(BaseSchema):
    """Schema for updating run status"""
    status: RunStatus
    results: Optional[Dict] = None
    error: Optional[Dict] = None


class RunStatusResponse(BaseSchema):
    """Schema for run status response"""
    status: RunStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[Dict] = None


class RunResponse(RunBase):
    """Schema for run response"""
    id: str
    canvas_id: str
    account_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime 