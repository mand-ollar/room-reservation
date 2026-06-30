"""create buildings and spaces tables

Revision ID: 3f8a1c7d2b94
Revises: 249c6bcff292
Create Date: 2026-06-30 13:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3f8a1c7d2b94'
down_revision: Union[str, Sequence[str], None] = '249c6bcff292'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('buildings',
    sa.Column('id', sa.String(length=26), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_buildings_name'), 'buildings', ['name'], unique=True)
    op.create_table('spaces',
    sa.Column('id', sa.String(length=26), nullable=False),
    sa.Column('building_id', sa.String(length=26), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['building_id'], ['buildings.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('building_id', 'name', name='uq_spaces_building_id_name')
    )
    op.create_index(op.f('ix_spaces_building_id'), 'spaces', ['building_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_spaces_building_id'), table_name='spaces')
    op.drop_table('spaces')
    op.drop_index(op.f('ix_buildings_name'), table_name='buildings')
    op.drop_table('buildings')
