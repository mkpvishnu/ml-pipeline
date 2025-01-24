from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base

class Canvas(Base):
    __tablename__ = "canvases"

    id = Column(Integer, primary_key=True, index=True)
    canvas_id = Column(String(36), unique=True, nullable=False)  # UUID
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    account_id = Column(Integer, ForeignKey("accounts.id"))
    config = Column(JSON)  # Stores the canvas configuration including node positions
    module_config = Column(JSON)  # Stores module-specific configurations
    connections = Column(JSON)  # Stores module connections
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    account = relationship("Account", back_populates="canvases")
    nodes = relationship("CanvasNode", back_populates="canvas")
    executions = relationship("CanvasExecution", back_populates="canvas")

class CanvasNode(Base):
    __tablename__ = "canvas_nodes"

    id = Column(Integer, primary_key=True, index=True)
    canvas_id = Column(Integer, ForeignKey("canvases.id"))
    component_id = Column(Integer, ForeignKey("components.id"))
    module_id = Column(Integer, ForeignKey("modules.id"))
    config = Column(JSON)  # Stores node-specific configuration
    position_x = Column(Integer)
    position_y = Column(Integer)
    execution_order = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    canvas = relationship("Canvas", back_populates="nodes")
    component = relationship("Component", back_populates="canvas_nodes")
    module = relationship("Module", back_populates="canvas_nodes")

class CanvasExecution(Base):
    __tablename__ = "canvas_executions"

    id = Column(Integer, primary_key=True, index=True)
    canvas_id = Column(Integer, ForeignKey("canvases.id"))
    status = Column(String(50))  # pending, running, completed, failed
    result = Column(JSON)
    error = Column(String(1000))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    canvas = relationship("Canvas", back_populates="executions")

class CanvasModuleVersion(Base):
    __tablename__ = "canvas_module_versions"

    id = Column(Integer, primary_key=True, index=True)
    canvas_id = Column(String(36), nullable=False)  # References Canvas.canvas_id
    module_id = Column(String(36), nullable=False)  # References Module.module_id
    version = Column(String(50), nullable=False)
    position_x = Column(Integer)
    position_y = Column(Integer)
    config = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 