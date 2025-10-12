"""merge_multiple_heads

Revision ID: 37182f2c2f5f
Revises: add_admin_id_to_three_tables, rm_unused_cols_medrecs
Create Date: 2025-08-27 19:45:57.001643

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '37182f2c2f5f'
down_revision = ('add_admin_id_to_three_tables', 'rm_unused_cols_medrecs')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass 