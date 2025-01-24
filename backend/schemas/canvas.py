from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

from .base import BaseSchema

class CanvasNodeBase(BaseModel):
    component_id: int
    module_id: int
    config: Optional[Dict[str, Any]] = None
    position_x: int
    position_y: int
    execution_order: int

class CanvasNodeCreate(CanvasNodeBase):
    canvas_id: int

class CanvasNode(CanvasNodeBase, BaseSchema):
    id: int
    canvas_id: int
    created_at: datetime
    updated_at: Optional[datetime]

class CanvasBase(BaseModel):
    name: str
    description: Optional[str] = None
    version: Optional[str] = "v1"
    module_config: Optional[Dict[str, Any]] = None
    schedule_config: Optional[Dict[str, Any]] = Field(default_factory=dict)
    tags: Optional[List[str]] = Field(default_factory=list)
    meta_info: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CanvasCreate(CanvasBase):
    account_id: int
    nodes: List[CanvasNodeCreate]

class CanvasUpdate(CanvasBase):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class Canvas(CanvasBase, BaseSchema):
    id: int
    account_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    nodes: List[CanvasNode]

class CanvasExecutionBase(BaseModel):
    canvas_id: int

class CanvasExecutionCreate(CanvasExecutionBase):
    pass

class CanvasExecution(CanvasExecutionBase, BaseSchema):
    id: int
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]

class CanvasModuleVersionBase(BaseModel):
    module_id: str
    version: str
    position_x: Optional[float] = 0
    position_y: Optional[float] = 0
    config: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CanvasModuleVersionCreate(CanvasModuleVersionBase):
    pass

class CanvasModuleVersion(CanvasModuleVersionBase):
    id: int
    canvas_id: str

    class Config:
        from_attributes = True 