"""add_walk_in_records_table

Revision ID: 3dc12a05d1ff
Revises: 5d8d29e9b88b
Create Date: 2026-01-02 00:24:06.164321

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3dc12a05d1ff'
down_revision = '5d8d29e9b88b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create walk_in_records table
    op.create_table(
        'walk_in_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('pet_id', sa.Integer(), nullable=True),
        sa.Column('date', sa.String(255), nullable=True),
        sa.Column('client_name', sa.String(255), nullable=False),
        sa.Column('contact_no', sa.String(255), nullable=True),
        sa.Column('pet_name', sa.String(255), nullable=False),
        sa.Column('pet_birthday', sa.String(255), nullable=True),
        sa.Column('breed', sa.String(255), nullable=True),
        sa.Column('age', sa.String(50), nullable=True),
        sa.Column('gender', sa.String(50), nullable=True),
        sa.Column('service_type', sa.String(255), nullable=True),
        sa.Column('medicine_used', sa.String(255), nullable=True),
        sa.Column('handled_by', sa.String(255), nullable=True, server_default='Dr. Fe Templado'),
        sa.Column('status', sa.String(255), nullable=True, server_default='Completed'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop walk_in_records table
    op.drop_table('walk_in_records') 