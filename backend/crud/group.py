from typing import List
from sqlalchemy.orm import Session

from backend.crud.base import CRUDBase
from backend.models.group import Group
from backend.schemas.group import GroupCreate, GroupUpdate


class CRUDGroup(CRUDBase[Group, GroupCreate, GroupUpdate]):
    def get_multi_by_account(
        self, db: Session, *, account_id: str, skip: int = 0, limit: int = 100
    ) -> List[Group]:
        """Get groups by account ID"""
        return (
            db.query(Group)
            .filter(Group.account_id == account_id)
            .offset(skip)
            .limit(limit)
            .all()
        )


group = CRUDGroup(Group) 