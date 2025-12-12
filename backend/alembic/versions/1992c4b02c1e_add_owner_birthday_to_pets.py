"""add_owner_birthday_to_pets

Revision ID: 1992c4b02c1e
Revises: 20251105_allow_null_email_password
Create Date: 2025-12-12 19:20:11.829227

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1992c4b02c1e'
down_revision = '20251105_allow_null_email_password'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'pets',
        sa.Column('owner_birthday', sa.String(length=255), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('pets', 'owner_birthday')