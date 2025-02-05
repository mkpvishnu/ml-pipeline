from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, BigInteger, Text, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship

from backend.db.base import Base
from backend.schemas.module import ModuleType, ModuleStatus

if TYPE_CHECKING:
    from .account import Account  # noqa
    from .group import Group  # noqa

class Module(Base):
    __tablename__ = "modules"

    id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    identifier = Column(String(255), nullable=False)
    scope = Column(String(50), nullable=False, default="account")  # global or account
    type = Column(SQLAlchemyEnum(ModuleType), nullable=False, default=ModuleType.DEFAULT)
    status = Column(SQLAlchemyEnum(ModuleStatus), nullable=False, default=ModuleStatus.DRAFT)
    icon_url = Column(String(1000))
    group_id = Column(BigInteger, ForeignKey("groups.id"), nullable=False)
    account_id = Column(BigInteger, ForeignKey("accounts.id"), nullable=False)
    parent_module_id = Column(BigInteger, ForeignKey("modules.id"))
    code = Column(Text)
    config_schema = Column(JSON, default=dict)
    output_schema = Column(JSON, default=dict)
    user_config = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    account = relationship("Account", back_populates="modules")
    group = relationship("Group", back_populates="modules")
    parent_module = relationship("Module", remote_side=[id], backref="child_modules")
    runs = relationship("Run", back_populates="module")