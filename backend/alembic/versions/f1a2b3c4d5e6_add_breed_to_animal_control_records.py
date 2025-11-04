"""add breed to animal_control_records

Revision ID: f1a2b3c4d5e6
Revises: fe0b3e51a11d
Create Date: 2025-11-04 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'fe0b3e51a11d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('animal_control_records', sa.Column('breed', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('animal_control_records', 'breed')


