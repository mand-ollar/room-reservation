"""add JSONB names validation check constraints

Revision ID: d2e3f4a5b8c9
Revises: c1d2e3f4a5b8
Create Date: 2026-07-01 08:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "d2e3f4a5b8c9"
down_revision: Union[str, Sequence[str], None] = "c1d2e3f4a5b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_NAMES_JSONB_CHECK: str = (
    "names ? 'ko' AND names ? 'en' "
    "AND jsonb_typeof(names->'ko') = 'string' "
    "AND jsonb_typeof(names->'en') = 'string' "
    "AND length(btrim(names->>'ko')) > 0 "
    "AND length(btrim(names->>'en')) > 0"
)


def upgrade() -> None:
    """Upgrade schema."""
    op.create_check_constraint("ck_buildings_names", "buildings", _NAMES_JSONB_CHECK)
    op.create_check_constraint("ck_spaces_names", "spaces", _NAMES_JSONB_CHECK)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("ck_spaces_names", "spaces", type_="check")
    op.drop_constraint("ck_buildings_names", "buildings", type_="check")
