from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from backend.models.database import Account
from backend.schemas.account import AccountCreate, AccountUpdate

class AccountCRUD:
    @staticmethod
    def get(db: Session, id: int) -> Optional[Account]:
        return db.query(Account).filter(Account.id == id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[Account]:
        return db.query(Account).filter(Account.email == email).first()

    @staticmethod
    def get_multi(db: Session, *, skip: int = 0, limit: int = 100) -> List[Account]:
        return db.query(Account).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, *, obj_in: AccountCreate) -> Account:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = Account(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(db: Session, *, db_obj: Account, obj_in: Union[AccountUpdate, Dict[str, Any]]) -> Account:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db: Session, *, id: int) -> Account:
        obj = db.query(Account).get(id)
        db.delete(obj)
        db.commit()
        return obj 