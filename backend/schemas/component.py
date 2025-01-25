from typing import Optional
from datetime import datetime

from pydantic import Field

from .base import BaseSchema

class ComponentBase(BaseSchema):
    """Base Component Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)


class ComponentCreate(ComponentBase):
    """Schema for creating a component"""
    group_id: int


class ComponentUpdate(BaseSchema):
    """Schema for updating a component"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    group_id: Optional[int] = None


class ComponentTitleUpdate(BaseSchema):
    """Schema for updating component title"""
    title: str = Field(..., min_length=1, max_length=255)


class ComponentActiveModule(BaseSchema):
    """Schema for setting active module"""
    module_id: int


class ComponentResponse(ComponentBase):
    """Schema for component response"""
    id: int = Field(..., description="Component ID")
    account_id: int = Field(..., description="Account ID")
    group_id: int = Field(..., description="Group ID")
    active_module_id: Optional[int] = Field(None, description="Active Module ID")
    created_at: datetime
    updated_at: datetime 