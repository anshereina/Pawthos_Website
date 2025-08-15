"""merge heads

Revision ID: 8f8921546fe7
Revises: 0fa05a0aefe2, add_recipients_to_alerts
Create Date: 2025-08-14 19:49:05.788603

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8f8921546fe7'
down_revision = ('0fa05a0aefe2', 'add_recipients_to_alerts')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass 