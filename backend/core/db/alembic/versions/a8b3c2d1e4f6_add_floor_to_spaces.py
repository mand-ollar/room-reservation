"""add floor to spaces

Revision ID: a8b3c2d1e4f6
Revises: c4e9a1b7d2f5
Create Date: 2026-07-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "a8b3c2d1e4f6"
down_revision: Union[str, Sequence[str], None] = "c4e9a1b7d2f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("spaces", sa.Column("floor", sa.Integer(), nullable=False, server_default="1"))
    op.alter_column("spaces", "floor", server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("spaces", "floor")
