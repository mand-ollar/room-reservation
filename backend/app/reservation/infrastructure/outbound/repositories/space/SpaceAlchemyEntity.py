from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from core.db.session import Base


class SpaceAlchemyEntity(Base):
    __tablename__ = "spaces"
    __table_args__ = (UniqueConstraint("building_id", "name", name="uq_spaces_building_id_name"),)

    id: Mapped[str] = mapped_column(String(26), primary_key=True)
    building_id: Mapped[str] = mapped_column(
        String(26),
        ForeignKey("buildings.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
