"""add condem to meat inspection records

Revision ID: add_condem_meat_insp
Revises: a43da4c138ef
Create Date: 2025-01-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_condem_meat_insp'
down_revision = 'a43da4c138ef'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add condem column to meat_inspection_records table
    op.add_column('meat_inspection_records', sa.Column('condem', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove condem column from meat_inspection_records table
    op.drop_column('meat_inspection_records', 'condem')

