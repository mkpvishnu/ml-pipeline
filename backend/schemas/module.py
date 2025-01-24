from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field
from datetime import datetime

from .base import BaseSchema, ModuleType

class ModuleVersionBase(BaseModel):
    """Base Module Version Schema"""
    version: str
    code: str
    is_active: Optional[bool] = True
    config: Dict = Field(default_factory=dict)
    requirements: List[str] = Field(default_factory=list)

class ModuleVersionCreate(ModuleVersionBase):
    """Schema for creating a module version"""
    module_id: str

class ModuleVersionUpdate(BaseModel):
    """Schema for updating a module version"""
    code: Optional[str] = None
    is_active: Optional[bool] = None
    config: Optional[Dict] = None
    requirements: Optional[List[str]] = None

class ModuleVersionResponse(ModuleVersionBase):
    """Schema for module version response"""
    id: int
    module_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ModuleBase(BaseModel):
    """Base Module Schema"""
    name: str
    description: Optional[str] = None
    type: str  # default or custom
    module_type: ModuleType
    code: Optional[str] = None
    config_schema: Optional[Dict[str, Any]] = None

class ModuleCreate(ModuleBase):
    """Schema for creating a module"""
    account_id: int

class ModuleUpdate(BaseModel):
    """Schema for updating a module"""
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    module_type: Optional[ModuleType] = None
    code: Optional[str] = None
    config_schema: Optional[Dict[str, Any]] = None

class ModuleResponse(ModuleBase):
    """Schema for module response"""
    id: int
    module_id: str
    account_id: int
    created_at: datetime
    updated_at: datetime
    versions: List[ModuleVersionResponse] = []

    class Config:
        from_attributes = True

class Module(ModuleBase, BaseSchema):
    id: int
    component_id: int
    created_at: datetime
    updated_at: Optional[datetime] 