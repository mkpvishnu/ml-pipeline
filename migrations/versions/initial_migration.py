"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create accounts table
    op.create_table(
        'accounts',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('account_type', sa.Enum('PERSONAL', 'TEAM', 'ENTERPRISE', name='accounttype'), nullable=False),
        sa.Column('settings', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create groups table
    op.create_table(
        'groups',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(1000), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create components table
    op.create_table(
        'components',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.BigInteger(), nullable=False),
        sa.Column('group_id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(1000), nullable=True),
        sa.Column('active_module_id', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create modules table
    op.create_table(
        'modules',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.BigInteger(), nullable=False),
        sa.Column('component_id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(1000), nullable=True),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('module_type', sa.Enum('SCRIPT', 'CONFIG', 'HYBRID', name='moduletype'), nullable=False),
        sa.Column('code', sa.String(10000), nullable=True),
        sa.Column('config_schema', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.ForeignKeyConstraint(['component_id'], ['components.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Add foreign key for active_module_id after modules table exists
    op.create_foreign_key(
        'fk_components_active_module',
        'components',
        'modules',
        ['active_module_id'],
        ['id']
    )

    # Create canvases table
    op.create_table(
        'canvases',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(1000), nullable=True),
        sa.Column('module_config', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create runs table
    op.create_table(
        'runs',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('account_id', sa.BigInteger(), nullable=False),
        sa.Column('canvas_id', sa.BigInteger(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('results', sa.JSON(), nullable=True),
        sa.Column('error', sa.JSON(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.ForeignKeyConstraint(['canvas_id'], ['canvases.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('runs')
    op.drop_table('canvases')
    op.drop_table('modules')
    op.drop_table('components')
    op.drop_table('groups')
    op.drop_table('accounts')
    
    # Drop enums
    op.execute('DROP TYPE accounttype')
    op.execute('DROP TYPE moduletype') 