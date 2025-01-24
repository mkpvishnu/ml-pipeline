from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .base import Base

class ModuleType(enum.Enum):
    SCRIPT = "script"
    CONFIG = "config"
    HYBRID = "hybrid"

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String(36), unique=True, nullable=False)  # UUID
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    type = Column(String(50), nullable=False)  # default or custom
    module_type = Column(Enum(ModuleType), nullable=False)
    component_id = Column(Integer, ForeignKey("components.id"))
    code = Column(String(10000))  # For script and hybrid types
    config_schema = Column(JSON)  # For config and hybrid types
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    component = relationship("Component", back_populates="modules")
    canvas_nodes = relationship("CanvasNode", back_populates="module")
    versions = relationship("ModuleVersion", back_populates="module")

class ModuleVersion(Base):
    __tablename__ = "module_versions"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String(36), ForeignKey("modules.module_id"), nullable=False)
    version = Column(String(50), nullable=False)
    code = Column(String(10000))  # For script and hybrid types
    config_schema = Column(JSON)  # For config and hybrid types
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    module = relationship("Module", back_populates="versions") 