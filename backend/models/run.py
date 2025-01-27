from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, BigInteger
from sqlalchemy.orm import relationship

from backend.db.base import Base

if TYPE_CHECKING:
    from .account import Account  # noqa
    from .canvas import Canvas  # noqa
    from .module import Module  # noqa

class Run(Base):
    __tablename__ = "runs"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    account_id = Column(BigInteger, ForeignKey("accounts.id"), nullable=False)
    canvas_id = Column(BigInteger, ForeignKey("canvases.id"))  # Optional for module runs
    module_id = Column(BigInteger, ForeignKey("modules.id"))   # Optional for canvas runs
    status = Column(String(50), nullable=False, default="REQUESTED")  # REQUESTED, INPROGRESS, WAITING, ERROR, COMPLETED
    results = Column(JSON)
    error = Column(JSON)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="runs")
    canvas = relationship("Canvas", back_populates="runs")
    module = relationship("Module", back_populates="runs") 