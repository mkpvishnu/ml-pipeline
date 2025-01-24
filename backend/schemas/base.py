from enum import Enum
from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel, ConfigDict


class AccountType(str, Enum):
    PERSONAL = "personal"
    TEAM = "team"
    ENTERPRISE = "enterprise"


class ModuleType(str, Enum):
    SCRIPT = "script"    # Pure Python script modules
    CONFIG = "config"    # Configuration-only modules
    HYBRID = "hybrid"    # Modules with both script and config


class BaseSchema(BaseModel):
    """Base schema with common configurations"""
    model_config = ConfigDict(
        from_attributes=True,  # Allow ORM model parsing
        populate_by_name=True  # Allow alias fields
    ) 