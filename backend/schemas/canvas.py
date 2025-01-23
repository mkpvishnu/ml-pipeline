from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

class CanvasBase(BaseModel):
    name: str
    description: Optional[str] = None
    version: Optional[str] = "v1"
    module_config: Optional[Dict[str, Any]] = None
    schedule_config: Optional[Dict[str, Any]] = Field(default_factory=dict)
    tags: Optional[List[str]] = Field(default_factory=list)
    meta_info: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CanvasCreate(CanvasBase):
    pass

class CanvasUpdate(CanvasBase):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class Canvas(CanvasBase):
    id: int
    canvas_id: str
    account_id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

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