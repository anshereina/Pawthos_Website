"""add barangay to walk_in_records

Revision ID: f5a9b8c7d6e3
Revises: 3dc12a05d1ff
Create Date: 2026-01-02 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f5a9b8c7d6e3'
down_revision = '3dc12a05d1ff'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add barangay column to walk_in_records table
    op.add_column('walk_in_records', sa.Column('barangay', sa.String(length=255), nullable=True))


def downgrade() -> None:
    # Remove barangay column from walk_in_records table
    op.drop_column('walk_in_records', 'barangay')

