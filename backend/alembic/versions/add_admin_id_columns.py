"""add_admin_id_columns_to_reports_and_alerts

Revision ID: add_admin_id_columns
Revises: bcfdfb9f949e
Create Date: 2025-08-17 16:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_admin_id_columns'
down_revision = 'bcfdfb9f949e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add admin_id column to reports table
    op.add_column('reports', sa.Column('admin_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_reports_admin_id', 'reports', 'admins', ['admin_id'], ['id'])
    
    # Add admin_id column to alerts table
    op.add_column('alerts', sa.Column('admin_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_alerts_admin_id', 'alerts', 'admins', ['admin_id'], ['id'])


def downgrade() -> None:
    # Remove foreign key constraints
    op.drop_constraint('fk_alerts_admin_id', 'alerts', type_='foreignkey')
    op.drop_constraint('fk_reports_admin_id', 'reports', type_='foreignkey')
    
    # Remove columns
    op.drop_column('alerts', 'admin_id')
    op.drop_column('reports', 'admin_id')







































