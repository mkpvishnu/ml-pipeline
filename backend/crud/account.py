from typing import List, Optional
from sqlalchemy.orm import Session

from backend.crud.base import CRUDBase
from backend.models.account import Account
from backend.schemas.account import AccountCreate, AccountUpdate


class CRUDAccount(CRUDBase[Account, AccountCreate, AccountUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[Account]:
        """Get an account by email"""
        return db.query(Account).filter(Account.email == email).first()

    def get_multi_by_type(
        self, db: Session, *, account_type: str, skip: int = 0, limit: int = 100
    ) -> List[Account]:
        """Get accounts by type"""
        return (
            db.query(Account)
            .filter(Account.account_type == account_type)
            .offset(skip)
            .limit(limit)
            .all()
        )


account = CRUDAccount(Account) 