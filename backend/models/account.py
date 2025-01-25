from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, JSON, Enum, BigInteger
from sqlalchemy.orm import relationship

from backend.db.base import Base
from backend.schemas.base import AccountType

if TYPE_CHECKING:
    from .group import Group  # noqa
    from .component import Component  # noqa
    from .module import Module  # noqa
    from .canvas import Canvas  # noqa
    from .run import Run  # noqa

class Account(Base):
    __tablename__ = "accounts"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    account_type = Column(Enum(AccountType), default=AccountType.PERSONAL)
    settings = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    groups = relationship("Group", back_populates="account", cascade="all, delete-orphan")
    components = relationship("Component", back_populates="account", cascade="all, delete-orphan")
    canvases = relationship("Canvas", back_populates="account", cascade="all, delete-orphan")
    runs = relationship("Run", back_populates="account", cascade="all, delete-orphan")
    modules = relationship("Module", back_populates="account", cascade="all, delete-orphan") 
 