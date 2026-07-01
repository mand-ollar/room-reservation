from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from core.db.session import Base


class SpaceAlchemyEntity(Base):
    __tablename__ = "spaces"

    id: Mapped[str] = mapped_column(String(26), primary_key=True)
    building_id: Mapped[str] = mapped_column(
        String(26),
        ForeignKey("buildings.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    names: Mapped[dict[str, str]] = mapped_column(JSONB, nullable=False)
    floor: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
