from typing import Optional, Dict
from datetime import datetime

from pydantic import Field

from .base import BaseSchema, ModuleType

class ModuleBase(BaseSchema):
    """Base Module Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    type: str = Field(..., pattern="^(default|custom)$")  # "default" or "custom"
    module_type: ModuleType
    code: Optional[str] = None  # Python code for script/hybrid types
    config_schema: Optional[Dict] = None  # JSON schema for config/hybrid types


class ModuleCreate(ModuleBase):
    """Schema for creating a module"""
    pass


class ModuleUpdate(BaseSchema):
    """Schema for updating a module"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    type: Optional[str] = Field(None, pattern="^(default|custom)$")
    module_type: Optional[ModuleType] = None
    code: Optional[str] = None
    config_schema: Optional[Dict] = None


class ModuleCodeUpdate(BaseSchema):
    """Schema for updating module code"""
    code: str = Field(..., min_length=1)


class ModuleConfigUpdate(BaseSchema):
    """Schema for updating module config schema"""
    config_schema: Dict


class ModuleNameUpdate(BaseSchema):
    """Schema for updating module name"""
    name: str = Field(..., min_length=1, max_length=255)


class ModuleResponse(ModuleBase):
    """Schema for module response"""
    id: str
    account_id: str
    component_id: str
    created_at: datetime
    updated_at: datetime 