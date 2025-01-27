from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, BigInteger, Text
from sqlalchemy.orm import relationship

from backend.db.base import Base
from backend.schemas.base import ModuleType

if TYPE_CHECKING:
    from .account import Account  # noqa
    from .group import Group  # noqa

class Module(Base):
    __tablename__ = "modules"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    identifier = Column(String(255), nullable=False, unique=True)
    scope = Column(String(50), nullable=False, default="account")  # global or account
    group_id = Column(BigInteger, ForeignKey("groups.id"), nullable=False)
    account_id = Column(BigInteger, ForeignKey("accounts.id"), nullable=False)
    parent_module_id = Column(BigInteger, ForeignKey("modules.id"))
    code = Column(Text)
    config_schema = Column(JSON, default={})
    user_config = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="modules")
    group = relationship("Group", back_populates="modules")
    parent_module = relationship("Module", remote_side=[id], backref="child_modules") 