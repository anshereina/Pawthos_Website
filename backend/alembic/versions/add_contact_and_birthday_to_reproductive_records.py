"""add contact_number and owner_birthday to reproductive_records

Revision ID: acbb1234abcd
Revises: a43da4c138ef
Create Date: 2025-01-XX
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'acbb1234abcd'
down_revision = 'a43da4c138ef'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('reproductive_records', sa.Column('contact_number', sa.String(length=50), nullable=True))
    op.add_column('reproductive_records', sa.Column('owner_birthday', sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column('reproductive_records', 'owner_birthday')
    op.drop_column('reproductive_records', 'contact_number')

