from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from backend.db.base import Base

if TYPE_CHECKING:
    from .account import Account  # noqa
    from .canvas import Canvas  # noqa

class Run(Base):
    __tablename__ = "runs"

    id = Column(String(36), primary_key=True, index=True)
    account_id = Column(String(36), ForeignKey("accounts.id"), nullable=False)
    canvas_id = Column(String(36), ForeignKey("canvases.id"), nullable=False)
    status = Column(String(50), nullable=False, default="pending")  # pending, running, completed, failed, cancelled
    results = Column(JSON)
    error = Column(JSON)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="runs")
    canvas = relationship("Canvas", back_populates="runs") 