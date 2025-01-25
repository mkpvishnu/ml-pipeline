from typing import Optional, Dict
from datetime import datetime

from pydantic import Field

from .base import BaseSchema

class CanvasBase(BaseSchema):
    """Base Canvas Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    module_config: Dict = {}  # Stores component positions, connections


class CanvasCreate(CanvasBase):
    """Schema for creating a canvas"""
    pass


class CanvasUpdate(BaseSchema):
    """Schema for updating a canvas"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    module_config: Optional[Dict] = None


class CanvasNameUpdate(BaseSchema):
    """Schema for updating canvas name"""
    name: str = Field(..., min_length=1, max_length=255)


class CanvasModuleConfigUpdate(BaseSchema):
    """Schema for updating canvas module configuration"""
    module_config: Dict


class CanvasResponse(CanvasBase):
    """Schema for canvas response"""
    id: int
    account_id: int
    created_at: datetime
    updated_at: datetime 