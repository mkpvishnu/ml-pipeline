from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from .base import BaseSchema

class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class GroupCreate(GroupBase):
    account_id: int

class Group(GroupBase, BaseSchema):
    id: int
    account_id: int
    created_at: datetime
    updated_at: Optional[datetime] 