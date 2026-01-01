"""merge_migration_heads

Revision ID: 5d8d29e9b88b
Revises: 1992c4b02c1e, add_condem_meat_insp, acbb1234abcd, vacc_drive_records_update
Create Date: 2026-01-02 00:23:41.957545

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5d8d29e9b88b'
down_revision = ('1992c4b02c1e', 'add_condem_meat_insp', 'acbb1234abcd', 'vacc_drive_records_update')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass 