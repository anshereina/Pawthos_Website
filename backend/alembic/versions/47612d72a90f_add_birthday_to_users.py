"""add_birthday_to_users

Revision ID: 47612d72a90f
Revises: 5d8d29e9b88b
Create Date: 2026-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '47612d72a90f'
down_revision = '5d8d29e9b88b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add birthday column to users table
    # Using Date type to match the model definition
    op.add_column('users', sa.Column('birthday', sa.Date(), nullable=True))


def downgrade() -> None:
    # Remove birthday column from users table
    op.drop_column('users', 'birthday')

