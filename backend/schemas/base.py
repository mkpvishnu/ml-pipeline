from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime

class ModuleType(str, Enum):
    SCRIPT = "script"
    CONFIG = "config"
    HYBRID = "hybrid"

class BaseSchema:
    class Config:
        orm_mode = True 