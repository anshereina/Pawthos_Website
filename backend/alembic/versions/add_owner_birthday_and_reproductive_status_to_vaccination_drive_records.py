"""add owner_birthday and reproductive_status to vaccination_drive_records

Revision ID: vacc_drive_records_update
Revises: a43da4c138ef
Create Date: 2025-01-XX

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'vacc_drive_records_update'
down_revision = 'a43da4c138ef'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add owner_birthday column
    op.add_column('vaccination_drive_records', sa.Column('owner_birthday', sa.String(length=255), nullable=True))
    
    # Add reproductive_status column
    op.add_column('vaccination_drive_records', sa.Column('reproductive_status', sa.String(length=20), nullable=True))
    
    # Make owner_contact nullable (it was previously NOT NULL)
    op.alter_column('vaccination_drive_records', 'owner_contact',
                    existing_type=sa.String(length=50),
                    nullable=True)


def downgrade() -> None:
    # Make owner_contact NOT NULL again
    op.alter_column('vaccination_drive_records', 'owner_contact',
                    existing_type=sa.String(length=50),
                    nullable=False)
    
    # Drop reproductive_status column
    op.drop_column('vaccination_drive_records', 'reproductive_status')
    
    # Drop owner_birthday column
    op.drop_column('vaccination_drive_records', 'owner_birthday')

