"""add_admin_id_to_three_tables

Revision ID: add_admin_id_to_three_tables
Revises: add_admin_id_columns
Create Date: 2025-08-17 16:25:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_admin_id_to_three_tables'
down_revision = 'add_admin_id_columns'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add admin_id column to animal_control_records table
    op.add_column('animal_control_records', sa.Column('admin_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_animal_control_records_admin_id', 'animal_control_records', 'admins', ['admin_id'], ['id'])
    
    # Add admin_id column to meat_inspection_records table
    op.add_column('meat_inspection_records', sa.Column('admin_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_meat_inspection_records_admin_id', 'meat_inspection_records', 'admins', ['admin_id'], ['id'])
    
    # Add admin_id column to shipping_permit_records table
    op.add_column('shipping_permit_records', sa.Column('admin_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_shipping_permit_records_admin_id', 'shipping_permit_records', 'admins', ['admin_id'], ['id'])


def downgrade() -> None:
    # Remove foreign key constraints
    op.drop_constraint('fk_shipping_permit_records_admin_id', 'shipping_permit_records', type_='foreignkey')
    op.drop_constraint('fk_meat_inspection_records_admin_id', 'meat_inspection_records', type_='foreignkey')
    op.drop_constraint('fk_animal_control_records_admin_id', 'animal_control_records', type_='foreignkey')
    
    # Remove columns
    op.drop_column('shipping_permit_records', 'admin_id')
    op.drop_column('meat_inspection_records', 'admin_id')
    op.drop_column('animal_control_records', 'admin_id')




































