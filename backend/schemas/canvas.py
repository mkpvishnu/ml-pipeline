from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class ModuleConnection(BaseModel):
    """Schema for module connections in a canvas"""
    from_module: str  # module_id
    to_module: str    # module_id
    connection_type: str = "sequential"  # sequential, parallel, conditional

class ModulePosition(BaseModel):
    """Schema for module position in canvas"""
    module_id: str
    version: str
    position_x: float = 0
    position_y: float = 0
    execution_order: int  # For sequential ordering
    config: Dict = Field(default_factory=dict)

class CanvasBase(BaseModel):
    """Base Canvas Schema"""
    name: str
    description: Optional[str] = None
    version: Optional[str] = "v1"
    is_active: Optional[bool] = True
    module_config: Dict[str, ModulePosition] = Field(default_factory=dict)
    connections: List[ModuleConnection] = Field(default_factory=list)
    schedule_config: Optional[Dict] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    meta_info: Dict = Field(default_factory=dict)

class CanvasCreate(CanvasBase):
    """Schema for creating a canvas"""
    account_id: int

class CanvasUpdate(BaseModel):
    """Schema for updating a canvas"""
    name: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    is_active: Optional[bool] = None
    module_config: Optional[Dict[str, ModulePosition]] = None
    connections: Optional[List[ModuleConnection]] = None
    schedule_config: Optional[Dict] = None
    tags: Optional[List[str]] = None
    meta_info: Optional[Dict] = None

class CanvasResponse(CanvasBase):
    """Schema for canvas response"""
    id: int
    canvas_id: str
    account_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 