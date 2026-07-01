from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from core.db.session import Base


class BuildingAlchemyEntity(Base):
    __tablename__ = "buildings"

    id: Mapped[str] = mapped_column(String(26), primary_key=True)
    names: Mapped[dict[str, str]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
