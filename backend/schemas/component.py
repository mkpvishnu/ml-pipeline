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
    group_id: str


class ComponentUpdate(BaseSchema):
    """Schema for updating a component"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    group_id: Optional[str] = None


class ComponentTitleUpdate(BaseSchema):
    """Schema for updating component title"""
    title: str = Field(..., min_length=1, max_length=255)


class ComponentActiveModule(BaseSchema):
    """Schema for setting active module"""
    module_id: str


class ComponentResponse(ComponentBase):
    """Schema for component response"""
    id: str
    account_id: str
    group_id: str
    active_module_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime 