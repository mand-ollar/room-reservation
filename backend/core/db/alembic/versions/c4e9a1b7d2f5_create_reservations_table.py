"""create reservations table

Revision ID: c4e9a1b7d2f5
Revises: 3f8a1c7d2b94
Create Date: 2026-06-30 13:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c4e9a1b7d2f5'
down_revision: Union[str, Sequence[str], None] = '3f8a1c7d2b94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")

    reservation_status = postgresql.ENUM(
        'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED',
        name='reservation_status',
    )
    reservation_status.create(op.get_bind(), checkfirst=True)

    op.create_table('reservations',
    sa.Column('id', sa.String(length=26), nullable=False),
    sa.Column('user_id', sa.String(length=26), nullable=False),
    sa.Column('space_id', sa.String(length=26), nullable=False),
    sa.Column('status', postgresql.ENUM(name='reservation_status', create_type=False), nullable=False),
    sa.Column('start_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('end_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.CheckConstraint('start_at < end_at', name='ck_reservations_period'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['space_id'], ['spaces.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reservations_user_id'), 'reservations', ['user_id'], unique=False)
    op.create_index(op.f('ix_reservations_space_id'), 'reservations', ['space_id'], unique=False)

    # Prevent overlapping active (PENDING/APPROVED) reservations for the same space.
    # Half-open range [start, end) lets back-to-back bookings touch without conflicting.
    op.execute(
        """
        ALTER TABLE reservations ADD CONSTRAINT no_overlapping_reservations
        EXCLUDE USING gist (
            space_id WITH =,
            tstzrange(start_at, end_at, '[)') WITH &&
        ) WHERE (status IN ('PENDING', 'APPROVED'))
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE reservations DROP CONSTRAINT no_overlapping_reservations")
    op.drop_index(op.f('ix_reservations_space_id'), table_name='reservations')
    op.drop_index(op.f('ix_reservations_user_id'), table_name='reservations')
    op.drop_table('reservations')
    op.execute("DROP TYPE IF EXISTS reservation_status")
