"""add client_birthday to walk_in_records

Revision ID: a1b2c3d4e5f6
Revises: f5a9b8c7d6e3
Create Date: 2026-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'f5a9b8c7d6e3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add client_birthday column to walk_in_records table
    op.add_column('walk_in_records', sa.Column('client_birthday', sa.String(length=255), nullable=True))


def downgrade() -> None:
    # Remove client_birthday column from walk_in_records table
    op.drop_column('walk_in_records', 'client_birthday')

