from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Enum, BigInteger
from sqlalchemy.orm import relationship

from backend.db.base import Base
from backend.schemas.base import ModuleType

if TYPE_CHECKING:
    from .account import Account  # noqa
    from .component import Component  # noqa

class Module(Base):
    __tablename__ = "modules"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    account_id = Column(BigInteger, ForeignKey("accounts.id"), nullable=False)
    component_id = Column(BigInteger, ForeignKey("components.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    type = Column(String(50), nullable=False)  # "default" or "custom"
    module_type = Column(Enum(ModuleType), nullable=False)
    code = Column(String(10000))  # Python code for script/hybrid types
    config_schema = Column(JSON)  # JSON schema for config/hybrid types
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="modules")
    component = relationship("Component", back_populates="modules", foreign_keys=[component_id])
    active_in_components = relationship("Component", back_populates="active_module", foreign_keys="[Component.active_module_id]") 