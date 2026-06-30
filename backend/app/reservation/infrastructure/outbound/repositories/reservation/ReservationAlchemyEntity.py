from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.orm import Mapped, mapped_column

from app.reservation.domain.value_objects import ReservationStatus
from core.db.session import Base


class ReservationAlchemyEntity(Base):
    __tablename__ = "reservations"
    __table_args__ = (CheckConstraint("start_at < end_at", name="ck_reservations_period"),)

    id: Mapped[str] = mapped_column(String(26), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String(26),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    space_id: Mapped[str] = mapped_column(
        String(26),
        ForeignKey("spaces.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    status: Mapped[ReservationStatus] = mapped_column(
        ENUM(ReservationStatus, name="reservation_status", create_type=False),
        nullable=False,
    )
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
