from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, BigInteger
from sqlalchemy.orm import relationship

from backend.db.base import Base

if TYPE_CHECKING:
    from .group import Group  # noqa
    from .module import Module  # noqa
    from .canvas import Canvas  # noqa
    from .run import Run  # noqa

class Account(Base):
    __tablename__ = "accounts"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    groups = relationship("Group", back_populates="account", cascade="all, delete-orphan")
    modules = relationship("Module", back_populates="account", cascade="all, delete-orphan")
    canvases = relationship("Canvas", back_populates="account", cascade="all, delete-orphan")
    runs = relationship("Run", back_populates="account", cascade="all, delete-orphan") 