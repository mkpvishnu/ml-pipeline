from typing import Optional, Dict
from pydantic import BaseModel, EmailStr
from datetime import datetime
from backend.models.database import AccountType

class AccountBase(BaseModel):
    """Base Account Schema"""
    name: str
    email: EmailStr
    account_type: Optional[AccountType] = AccountType.PERSONAL
    is_active: Optional[bool] = True
    settings: Optional[Dict] = {}

class AccountCreate(AccountBase):
    """Schema for creating an account"""
    pass

class AccountUpdate(BaseModel):
    """Schema for updating an account"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    account_type: Optional[AccountType] = None
    is_active: Optional[bool] = None
    settings: Optional[Dict] = None

class AccountResponse(AccountBase):
    """Schema for account response"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 