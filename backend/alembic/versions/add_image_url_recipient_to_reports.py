"""add image_url and recipient to reports

Revision ID: add_image_url_recipient
Revises: bcfdfb9f949e
Create Date: 2025-10-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_image_url_recipient'
down_revision = 'bcfdfb9f949e'
branch_labels = None
depends_on = None


def upgrade():
    # Add image_url column to reports table
    op.add_column('reports', sa.Column('image_url', sa.String(500), nullable=True))
    
    # Add recipient column to reports table
    op.add_column('reports', sa.Column('recipient', sa.String(255), nullable=True))


def downgrade():
    # Remove recipient column from reports table
    op.drop_column('reports', 'recipient')
    
    # Remove image_url column from reports table
    op.drop_column('reports', 'image_url')



