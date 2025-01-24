from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import SQLAlchemyError
import logging

from ..models.account import Account
from ..schemas.account import AccountCreate, AccountUpdate, AccountResponse
from .base import CRUDBase

logger = logging.getLogger(__name__)

class CRUDAccount(CRUDBase[Account, AccountCreate, AccountUpdate]):
    """CRUD operations for Account model"""
    
    def get(self, db: Session, id: int) -> Optional[Account]:
        """Get account by ID with error handling"""
        try:
            return super().get(db=db, id=id)
        except SQLAlchemyError as e:
            logger.error(f"Error getting account by ID: {str(e)}")
            return None

    def get_by_email(self, db: Session, *, email: str) -> Optional[Account]:
        """Get account by email address"""
        try:
            return db.query(Account).filter(Account.email == email).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting account by email: {str(e)}")
            return None

    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Account]:
        """Get multiple accounts with pagination"""
        try:
            return super().get_multi(db=db, skip=skip, limit=limit)
        except SQLAlchemyError as e:
            logger.error(f"Error getting multiple accounts: {str(e)}")
            return []

    def create(self, db: Session, *, obj_in: AccountCreate) -> Optional[Account]:
        """Create a new account"""
        try:
            return super().create(db=db, obj_in=obj_in)
        except SQLAlchemyError as e:
            logger.error(f"Error creating account: {str(e)}")
            db.rollback()
            return None

    def update(self, db: Session, *, db_obj: Account, obj_in: AccountUpdate) -> Optional[Account]:
        """Update an existing account"""
        try:
            return super().update(db=db, db_obj=db_obj, obj_in=obj_in)
        except SQLAlchemyError as e:
            logger.error(f"Error updating account: {str(e)}")
            db.rollback()
            return None

    def remove(self, db: Session, *, id: int) -> Optional[Account]:
        """Remove an account"""
        try:
            return super().remove(db=db, id=id)
        except SQLAlchemyError as e:
            logger.error(f"Error removing account: {str(e)}")
            db.rollback()
            return None

    def update_settings(self, db: Session, *, db_obj: Account, settings: Dict[str, Any]) -> Optional[Account]:
        """Update account settings"""
        try:
            db_obj.settings = settings
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            logger.error(f"Error updating account settings: {str(e)}")
            db.rollback()
            return None

account = CRUDAccount(Account) 