"""allow null email and password on users

Revision ID: 20251105_allow_null_email_password
Revises: 
Create Date: 2025-11-05
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251105_allow_null_email_password'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use batch mode for SQLite
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('email', existing_type=sa.String(length=255), nullable=True)
        batch_op.alter_column('password_hash', existing_type=sa.String(length=255), nullable=True)


def downgrade() -> None:
    # Revert to NOT NULL; may fail if nulls exist
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('email', existing_type=sa.String(length=255), nullable=False)
        batch_op.alter_column('password_hash', existing_type=sa.String(length=255), nullable=False)


