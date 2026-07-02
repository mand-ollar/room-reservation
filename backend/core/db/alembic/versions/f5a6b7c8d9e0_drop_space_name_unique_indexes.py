"""drop space name unique indexes per building

Revision ID: f5a6b7c8d9e0
Revises: e3f4a5b6c7d8
Create Date: 2026-07-02 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "f5a6b7c8d9e0"
down_revision: Union[str, Sequence[str], None] = "e3f4a5b6c7d8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("uq_spaces_building_id_names_en", table_name="spaces")
    op.drop_index("uq_spaces_building_id_names_ko", table_name="spaces")


def downgrade() -> None:
    import sqlalchemy as sa

    op.create_index(
        "uq_spaces_building_id_names_ko",
        "spaces",
        [sa.text("building_id"), sa.text("(names->>'ko')")],
        unique=True,
    )
    op.create_index(
        "uq_spaces_building_id_names_en",
        "spaces",
        [sa.text("building_id"), sa.text("(names->>'en')")],
        unique=True,
    )
