"""add recipients to alerts

Revision ID: add_recipients_to_alerts
Revises: ebeae5e51ec8
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_recipients_to_alerts'
down_revision = 'ebeae5e51ec8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add recipients column to alerts table
    op.add_column('alerts', sa.Column('recipients', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove recipients column from alerts table
    op.drop_column('alerts', 'recipients') 