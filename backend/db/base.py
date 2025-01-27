from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Remove model imports to prevent circular dependencies
# Models will import Base from here instead 