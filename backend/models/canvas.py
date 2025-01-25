from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, BigInteger
from sqlalchemy.orm import relationship

from backend.db.base import Base

if TYPE_CHECKING:
    from .account import Account  # noqa
    from .run import Run  # noqa

class Canvas(Base):
    __tablename__ = "canvases"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    account_id = Column(BigInteger, ForeignKey("accounts.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    module_config = Column(JSON, default={})  # Stores component positions, connections
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="canvases")
    runs = relationship("Run", back_populates="canvas", cascade="all, delete-orphan") 