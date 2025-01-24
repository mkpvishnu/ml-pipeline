from typing import List
from sqlalchemy.orm import Session

from .base import CRUDBase
from ..models.group import Group
from ..schemas.group import GroupCreate, GroupUpdate

class CRUDGroup(CRUDBase[Group, GroupCreate, GroupUpdate]):
    def get_by_account(self, db: Session, *, account_id: int, skip: int = 0, limit: int = 100) -> List[Group]:
        return db.query(Group).filter(Group.account_id == account_id).offset(skip).limit(limit).all()

group = CRUDGroup(Group) 