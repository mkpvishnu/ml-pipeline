from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, ForeignKey, BigInteger, Integer
from sqlalchemy.orm import relationship

from backend.db.base import Base

if TYPE_CHECKING:
    from .account import Account  # noqa
    from .module import Module  # noqa

class Group(Base):
    __tablename__ = "groups"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    account_id = Column(BigInteger, ForeignKey("accounts.id"), nullable=False)
    status = Column(Integer, nullable=False, default=1)  # 1: active, 0: deleted
    deleted_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="groups")
    modules = relationship("Module", back_populates="group", cascade="all, delete-orphan") 