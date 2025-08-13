"""add_vaccination_events_table

Revision ID: 911f6d4360de
Revises: 61d7fb72e330
Create Date: 2025-07-27 02:25:15.695939

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '911f6d4360de'
down_revision = '61d7fb72e330'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('vaccination_events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('event_date', sa.Date(), nullable=False),
    sa.Column('barangay', sa.String(length=255), nullable=False),
    sa.Column('service_coordinator', sa.String(length=255), nullable=False),
    sa.Column('status', sa.String(length=50), nullable=False),
    sa.Column('event_title', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vaccination_events_id'), 'vaccination_events', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_vaccination_events_id'), table_name='vaccination_events')
    op.drop_table('vaccination_events') 