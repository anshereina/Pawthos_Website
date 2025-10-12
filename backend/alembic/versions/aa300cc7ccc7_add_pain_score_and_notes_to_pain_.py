"""add_pain_score_and_notes_to_pain_assessments

Revision ID: aa300cc7ccc7
Revises: 37182f2c2f5f
Create Date: 2025-08-27 19:46:31.661137

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = 'aa300cc7ccc7'
down_revision = '37182f2c2f5f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add only missing columns. pain_score appears to already exist in some environments.
    # Safely add notes column if not present.
    op.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS notes TEXT"))
    # Optionally, ensure pain_score exists without error if it already does
    op.execute(text("ALTER TABLE pain_assessments ADD COLUMN IF NOT EXISTS pain_score INTEGER"))


def downgrade() -> None:
    # Remove columns if present
    op.execute(text("ALTER TABLE pain_assessments DROP COLUMN IF EXISTS notes"))
    op.execute(text("ALTER TABLE pain_assessments DROP COLUMN IF EXISTS pain_score")) 