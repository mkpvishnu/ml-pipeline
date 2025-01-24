from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base

class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    type = Column(String(50), nullable=False)  # data_loader, data_transformer, classifier, evaluator, model_server
    group_id = Column(Integer, ForeignKey("groups.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    group = relationship("Group", back_populates="components")
    modules = relationship("Module", back_populates="component")
    canvas_nodes = relationship("CanvasNode", back_populates="component") 