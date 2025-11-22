"""
remove unused columns from medical_records

Revision ID: rm_unused_cols_medrecs
Revises: 
Create Date: 2025-08-21 00:00:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = 'rm_unused_cols_medrecs'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use IF EXISTS to avoid failures if columns are already gone
    op.execute("ALTER TABLE medical_records DROP COLUMN IF EXISTS notes")
    op.execute("ALTER TABLE medical_records DROP COLUMN IF EXISTS record_type")
    op.execute("ALTER TABLE medical_records DROP COLUMN IF EXISTS title")
    op.execute("ALTER TABLE medical_records DROP COLUMN IF EXISTS description")
    op.execute("ALTER TABLE medical_records DROP COLUMN IF EXISTS \"date\"")
    op.execute("ALTER TABLE medical_records DROP COLUMN IF EXISTS clinic")
    op.execute("ALTER TABLE medical_records DROP COLUMN IF EXISTS next_due_date")


def downgrade() -> None:
    # No-op: columns are intentionally removed. If needed, re-add with generic types.
    op.execute("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS notes TEXT")
    op.execute("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS record_type VARCHAR")
    op.execute("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS title VARCHAR")
    op.execute("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS description TEXT")
    op.execute("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS \"date\" TIMESTAMP WITHOUT TIME ZONE")
    op.execute("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS clinic VARCHAR")
    op.execute("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS next_due_date TIMESTAMP WITHOUT TIME ZONE")






































