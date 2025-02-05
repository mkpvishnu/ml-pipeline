from typing import Optional, Dict, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl

class ConfigItem(BaseModel):
    """Schema for a configuration item"""
    name: str
    type: str
    value: Any
    description: Optional[str] = None

class ModuleBase(BaseModel):
    """Base Module Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    identifier: str = Field(..., min_length=1, max_length=255)
    scope: str = Field(default="account")
    code: Optional[str] = None
    config_schema: Dict[str, Any] = Field(default_factory=dict)
    user_config: List[Dict[str, Any]] = Field(default_factory=list)
    icon_url: Optional[HttpUrl] = Field(None, description="URL to the module's icon")

class ModuleCreate(ModuleBase):
    """Schema for creating a module"""
    parent_module_id: Optional[int] = None

class ModuleUpdate(BaseModel):
    """Schema for updating a module"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    code: Optional[str] = None
    config_schema: Optional[Dict[str, Any]] = None
    user_config: Optional[List[Dict[str, Any]]] = None
    scope: Optional[str] = None

class ModuleCodeUpdate(BaseModel):
    """Schema for updating module code"""
    code: str

class ModuleConfigSchemaUpdate(BaseModel):
    """Schema for updating module config schema"""
    config_schema: Dict[str, Any]

class ModuleUserConfigUpdate(BaseModel):
    """Schema for updating module user config"""
    user_config: List[Dict[str, Any]]

class ModuleResponse(ModuleBase):
    """Schema for module response"""
    id: int
    group_id: int
    account_id: int
    parent_module_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 