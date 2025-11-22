"""add reproductive_records table

Revision ID: add_reproductive_records
Revises: 
Create Date: 2025-10-02
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_reproductive_records'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'reproductive_records',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('pet_name', sa.String(length=255), nullable=False),
        sa.Column('owner_name', sa.String(length=255), nullable=False),
        sa.Column('species', sa.String(length=50), nullable=False),
        sa.Column('color', sa.String(length=100), nullable=True),
        sa.Column('breed', sa.String(length=100), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('reproductive_status', sa.String(length=20), nullable=True),
        sa.Column('date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )


def downgrade() -> None:
    op.drop_table('reproductive_records')










