from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from backend.db.base import Base

if TYPE_CHECKING:
    from .account import Account  # noqa
    from .group import Group  # noqa
    from .module import Module  # noqa

class Component(Base):
    __tablename__ = "components"

    id = Column(String(36), primary_key=True, index=True)
    account_id = Column(String(36), ForeignKey("accounts.id"), nullable=False)
    group_id = Column(String(36), ForeignKey("groups.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    active_module_id = Column(String(36), ForeignKey("modules.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="components")
    group = relationship("Group", back_populates="components")
    modules = relationship("Module", back_populates="component", foreign_keys="[Module.component_id]", cascade="all, delete-orphan")
    active_module = relationship("Module", foreign_keys=[active_module_id], post_update=True) 