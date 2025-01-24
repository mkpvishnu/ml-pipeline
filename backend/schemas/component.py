from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from .base import BaseSchema

class ComponentBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str  # data_loader, data_transformer, classifier, evaluator, model_server

class ComponentCreate(ComponentBase):
    group_id: int

class Component(ComponentBase, BaseSchema):
    id: int
    group_id: int
    created_at: datetime
    updated_at: Optional[datetime] 