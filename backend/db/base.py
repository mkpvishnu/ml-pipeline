from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models here for Alembic to detect them
from backend.models.account import Account  # noqa
from backend.models.group import Group  # noqa
from backend.models.component import Component  # noqa
from backend.models.module import Module  # noqa
from backend.models.canvas import Canvas  # noqa
from backend.models.run import Run  # noqa 