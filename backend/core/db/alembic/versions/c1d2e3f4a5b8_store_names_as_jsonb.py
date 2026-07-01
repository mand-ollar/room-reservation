"""store building and space names as JSONB

Revision ID: c1d2e3f4a5b8
Revises: b9c4d3e2f5a7
Create Date: 2026-07-01 07:15:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "c1d2e3f4a5b8"
down_revision: Union[str, Sequence[str], None] = "b9c4d3e2f5a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("TRUNCATE TABLE reservations, spaces, buildings")

    op.drop_index(op.f("ix_buildings_name_en"), table_name="buildings")
    op.drop_index(op.f("ix_buildings_name_ko"), table_name="buildings")
    op.drop_column("buildings", "name_en")
    op.drop_column("buildings", "name_ko")
    op.add_column("buildings", sa.Column("names", postgresql.JSONB(astext_type=sa.Text()), nullable=False))
    op.create_index(
        "ix_buildings_names_ko",
        "buildings",
        [sa.text("(names->>'ko')")],
        unique=True,
    )
    op.create_index(
        "ix_buildings_names_en",
        "buildings",
        [sa.text("(names->>'en')")],
        unique=True,
    )

    op.drop_constraint("uq_spaces_building_id_name_en", "spaces", type_="unique")
    op.drop_constraint("uq_spaces_building_id_name_ko", "spaces", type_="unique")
    op.drop_column("spaces", "name_en")
    op.drop_column("spaces", "name_ko")
    op.add_column("spaces", sa.Column("names", postgresql.JSONB(astext_type=sa.Text()), nullable=False))
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


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("TRUNCATE TABLE reservations, spaces, buildings")

    op.drop_index("uq_spaces_building_id_names_en", table_name="spaces")
    op.drop_index("uq_spaces_building_id_names_ko", table_name="spaces")
    op.drop_column("spaces", "names")
    op.add_column("spaces", sa.Column("name_ko", sa.String(length=255), nullable=False))
    op.add_column("spaces", sa.Column("name_en", sa.String(length=255), nullable=False))
    op.create_unique_constraint("uq_spaces_building_id_name_ko", "spaces", ["building_id", "name_ko"])
    op.create_unique_constraint("uq_spaces_building_id_name_en", "spaces", ["building_id", "name_en"])

    op.drop_index("ix_buildings_names_en", table_name="buildings")
    op.drop_index("ix_buildings_names_ko", table_name="buildings")
    op.drop_column("buildings", "names")
    op.add_column("buildings", sa.Column("name_ko", sa.String(length=255), nullable=False))
    op.add_column("buildings", sa.Column("name_en", sa.String(length=255), nullable=False))
    op.create_index(op.f("ix_buildings_name_ko"), "buildings", ["name_ko"], unique=True)
    op.create_index(op.f("ix_buildings_name_en"), "buildings", ["name_en"], unique=True)
