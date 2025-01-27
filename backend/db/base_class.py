# Import all models here for Alembic to detect them
from backend.models.account import Account  # noqa
from backend.models.group import Group  # noqa
from backend.models.module import Module  # noqa
from backend.models.canvas import Canvas  # noqa
from backend.models.run import Run  # noqa

# Import Base class
from .base import Base  # noqa

# This allows Alembic to detect all models
__all__ = ["Account", "Group", "Module", "Canvas", "Run", "Base"] 