from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, 
    ForeignKey, JSON, Text, Enum, Float, Table, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()

class AccountType(enum.Enum):
    PERSONAL = "personal"
    TEAM = "team"
    ENTERPRISE = "enterprise"

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    account_type = Column(Enum(AccountType), default=AccountType.PERSONAL)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    settings = Column(JSON, default={})

    # Relationships
    canvases = relationship("Canvas", back_populates="account")
    modules = relationship("Module", back_populates="account")

class Canvas(Base):
    __tablename__ = "canvases"

    id = Column(Integer, primary_key=True)
    canvas_id = Column(String(50), unique=True, nullable=False)  # UUID
    account_id = Column(Integer, ForeignKey('accounts.id'))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    version = Column(String(50), default="v1")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Canvas configuration
    module_config = Column(JSON)  # Stores module positions, connections
    schedule_config = Column(JSON, default={})  # Scheduling configuration
    
    # Metadata
    tags = Column(JSON, default=[])
    meta_info = Column(JSON, default={})  # Changed from metadata to meta_info

    # Relationships
    account = relationship("Account", back_populates="canvases")
    runs = relationship("CanvasRun", back_populates="canvas")
    module_versions = relationship("CanvasModuleVersion", back_populates="canvas")

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True)
    module_id = Column(String(50), unique=True, nullable=False)  # UUID
    account_id = Column(Integer, ForeignKey('accounts.id'))
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # data, preprocess, training, etc.
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Module metadata
    category = Column(String(50))  # For organization in UI
    tags = Column(JSON, default=[])
    meta_info = Column(JSON, default={})  # Changed from metadata to meta_info

    # Relationships
    account = relationship("Account", back_populates="modules")
    versions = relationship("ModuleVersion", back_populates="module")

class ModuleVersion(Base):
    __tablename__ = "module_versions"

    id = Column(Integer, primary_key=True)
    module_id = Column(String(50), ForeignKey('modules.module_id'), unique=True)
    version = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Version configuration
    config = Column(JSON, default={})  # Module-specific configuration
    requirements = Column(JSON, default=[])  # Python package requirements

    # Relationships
    module = relationship("Module", back_populates="versions")
    canvas_versions = relationship("CanvasModuleVersion", back_populates="module_version")

    __table_args__ = (
        UniqueConstraint('module_id', 'version', name='uix_module_version'),
    )

class CanvasModuleVersion(Base):
    __tablename__ = "canvas_module_versions"

    id = Column(Integer, primary_key=True)
    canvas_id = Column(String(50), ForeignKey('canvases.canvas_id'))
    module_id = Column(String(50), ForeignKey('module_versions.module_id'))
    version = Column(String(50), nullable=False)
    position_x = Column(Float)
    position_y = Column(Float)
    config = Column(JSON, default={})  # Instance-specific configuration

    # Relationships
    canvas = relationship("Canvas", back_populates="module_versions")
    module_version = relationship("ModuleVersion", back_populates="canvas_versions")

class CanvasRun(Base):
    __tablename__ = "canvas_runs"

    id = Column(Integer, primary_key=True)
    run_id = Column(String(50), unique=True, nullable=False)  # UUID
    canvas_id = Column(String(50), ForeignKey('canvases.canvas_id'))
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Run details
    module_runs = Column(JSON, default={})  # Details of each module run
    metrics = Column(JSON, default={})  # Run metrics and results
    logs = Column(JSON, default=[])  # Run logs
    error = Column(JSON, default={})  # Error details if failed

    # Cache configuration
    cache_config = Column(JSON, default={})  # Cache settings and locations

    # Relationships
    canvas = relationship("Canvas", back_populates="runs")
    module_run_results = relationship("ModuleRunResult", back_populates="canvas_run")

class ModuleRunResult(Base):
    __tablename__ = "module_run_results"

    id = Column(Integer, primary_key=True)
    run_id = Column(String(50), ForeignKey('canvas_runs.run_id'))
    module_id = Column(String(50), ForeignKey('module_versions.module_id'))
    status = Column(String(50), default="pending")
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Run details
    input_hash = Column(String(255))  # Hash of input data for caching
    output_hash = Column(String(255))  # Hash of output data
    metrics = Column(JSON, default={})
    cache_location = Column(String(512))  # S3/local path to cached results
    error = Column(JSON, default={})

    # Relationships
    canvas_run = relationship("CanvasRun", back_populates="module_run_results")

class ModuleCache(Base):
    __tablename__ = "module_cache"

    id = Column(Integer, primary_key=True)
    module_id = Column(String(50), ForeignKey('module_versions.module_id'))
    input_hash = Column(String(255), nullable=False)
    output_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, default=datetime.utcnow)
    size_bytes = Column(Integer)
    
    # Cache details
    location = Column(String(512), nullable=False)  # S3/local path
    meta_info = Column(JSON, default={})  # Changed from metadata to meta_info
    is_valid = Column(Boolean, default=True)

    class Config:
        indexes = [
            ('module_id', 'input_hash'),  # For quick cache lookups
            ('created_at', 'is_valid'),   # For cache cleanup
        ] 