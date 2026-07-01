"""split building and space names into name_ko and name_en

Revision ID: b9c4d3e2f5a7
Revises: a8b3c2d1e4f6
Create Date: 2026-07-01 06:45:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b9c4d3e2f5a7"
down_revision: Union[str, Sequence[str], None] = "a8b3c2d1e4f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("TRUNCATE TABLE reservations, spaces, buildings")

    op.drop_index(op.f("ix_buildings_name"), table_name="buildings")
    op.drop_column("buildings", "name")
    op.add_column("buildings", sa.Column("name_ko", sa.String(length=255), nullable=False))
    op.add_column("buildings", sa.Column("name_en", sa.String(length=255), nullable=False))
    op.create_index(op.f("ix_buildings_name_ko"), "buildings", ["name_ko"], unique=True)
    op.create_index(op.f("ix_buildings_name_en"), "buildings", ["name_en"], unique=True)

    op.drop_constraint("uq_spaces_building_id_name", "spaces", type_="unique")
    op.drop_column("spaces", "name")
    op.add_column("spaces", sa.Column("name_ko", sa.String(length=255), nullable=False))
    op.add_column("spaces", sa.Column("name_en", sa.String(length=255), nullable=False))
    op.create_unique_constraint("uq_spaces_building_id_name_ko", "spaces", ["building_id", "name_ko"])
    op.create_unique_constraint("uq_spaces_building_id_name_en", "spaces", ["building_id", "name_en"])


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("TRUNCATE TABLE reservations, spaces, buildings")

    op.drop_constraint("uq_spaces_building_id_name_en", "spaces", type_="unique")
    op.drop_constraint("uq_spaces_building_id_name_ko", "spaces", type_="unique")
    op.drop_column("spaces", "name_en")
    op.drop_column("spaces", "name_ko")
    op.add_column("spaces", sa.Column("name", sa.String(length=255), nullable=False))
    op.create_unique_constraint("uq_spaces_building_id_name", "spaces", ["building_id", "name"])

    op.drop_index(op.f("ix_buildings_name_en"), table_name="buildings")
    op.drop_index(op.f("ix_buildings_name_ko"), table_name="buildings")
    op.drop_column("buildings", "name_en")
    op.drop_column("buildings", "name_ko")
    op.add_column("buildings", sa.Column("name", sa.String(length=255), nullable=False))
    op.create_index(op.f("ix_buildings_name"), "buildings", ["name"], unique=True)
