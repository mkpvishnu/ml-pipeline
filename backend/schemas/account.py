from typing import Optional, Dict
from datetime import datetime
from pydantic import EmailStr, Field, BaseModel
from .base import BaseSchema, AccountType

class AccountBase(BaseSchema):
    """Base Account Schema"""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    account_type: AccountType = AccountType.PERSONAL
    settings: Dict = Field(default_factory=dict)


class AccountCreate(AccountBase):
    """Schema for creating an account"""
    pass


class AccountUpdate(BaseModel):
    """Schema for updating an account"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    account_type: Optional[AccountType] = None
    settings: Optional[Dict] = None


class AccountResponse(AccountBase):
    """Schema for account response"""
    id: int = Field(..., description="Account ID")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 