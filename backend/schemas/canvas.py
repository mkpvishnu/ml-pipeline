from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field

from .base import BaseSchema

class CanvasBase(BaseModel):
    """Base Canvas Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    module_config: Dict = {}  # Stores component positions, connections


class CanvasCreate(CanvasBase):
    """Schema for creating a canvas"""
    pass


class CanvasUpdate(BaseModel):
    """Schema for updating a canvas"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    module_config: Optional[Dict] = None
    status: Optional[int] = Field(None, ge=0, le=1)


class CanvasNameUpdate(BaseModel):
    """Schema for updating canvas name"""
    name: str = Field(..., min_length=1, max_length=255)


class CanvasModuleConfigUpdate(BaseModel):
    """Schema for updating canvas module configuration"""
    module_config: Dict


class CanvasResponse(CanvasBase):
    """Schema for canvas response"""
    id: int
    account_id: int
    status: int
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 