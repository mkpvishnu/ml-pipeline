from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

from .base import BaseSchema

class GroupBase(BaseModel):
    """Base Group Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)

    class Config:
        from_attributes = True


class GroupCreate(GroupBase):
    """Schema for creating a group"""
    pass


class GroupUpdate(BaseModel):
    """Schema for updating a group"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[int] = Field(None, ge=0, le=1)

    class Config:
        from_attributes = True


class GroupResponse(GroupBase):
    """Schema for group response"""
    id: int
    account_id: int
    status: int
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 