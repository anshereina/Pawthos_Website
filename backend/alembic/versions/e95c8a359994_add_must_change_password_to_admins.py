"""add_must_change_password_to_admins

Revision ID: e95c8a359994
Revises: aa300cc7ccc7
Create Date: 2025-10-02 16:46:35.431237

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = 'e95c8a359994'
down_revision = 'aa300cc7ccc7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add column nullable with default False for existing rows
    op.add_column('admins', sa.Column('must_change_password', sa.Boolean(), nullable=True))
    # Backfill existing rows to False
    op.execute(text("UPDATE admins SET must_change_password = FALSE WHERE must_change_password IS NULL"))
    # Set NOT NULL constraint
    op.alter_column('admins', 'must_change_password', nullable=False)


def downgrade() -> None:
    op.drop_column('admins', 'must_change_password') 