from datetime import datetime, timezone

from pydantic import BaseModel
from ulid import ULID

from app.reservation.domain.exceptions import (
    InvalidReservationPeriodError,
    InvalidReservationTransitionError,
)
from app.reservation.domain.value_objects.ReservationStatus import ReservationStatus


class Reservation(BaseModel):
    id: ULID
    user_id: ULID
    space_id: ULID
    status: ReservationStatus
    start_at: datetime
    end_at: datetime
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(cls, user_id: ULID, space_id: ULID, start_at: datetime, end_at: datetime) -> "Reservation":
        if start_at >= end_at:
            raise InvalidReservationPeriodError()
        now: datetime = datetime.now(tz=timezone.utc)
        return cls(
            id=ULID(),
            user_id=user_id,
            space_id=space_id,
            status=ReservationStatus.PENDING,
            start_at=start_at,
            end_at=end_at,
            created_at=now,
            updated_at=now,
        )

    def approve(self) -> "Reservation":
        if self.status != ReservationStatus.PENDING:
            raise InvalidReservationTransitionError()
        return self.model_copy(
            update={"status": ReservationStatus.APPROVED, "updated_at": datetime.now(tz=timezone.utc)}
        )

    def reject(self) -> "Reservation":
        if self.status != ReservationStatus.PENDING:
            raise InvalidReservationTransitionError()
        return self.model_copy(
            update={"status": ReservationStatus.REJECTED, "updated_at": datetime.now(tz=timezone.utc)}
        )

    def cancel(self) -> "Reservation":
        if self.status not in (ReservationStatus.PENDING, ReservationStatus.APPROVED):
            raise InvalidReservationTransitionError()
        return self.model_copy(
            update={"status": ReservationStatus.CANCELLED, "updated_at": datetime.now(tz=timezone.utc)}
        )

    def reschedule(self, start_at: datetime, end_at: datetime) -> "Reservation":
        if self.status not in (ReservationStatus.PENDING, ReservationStatus.APPROVED):
            raise InvalidReservationTransitionError()
        if start_at >= end_at:
            raise InvalidReservationPeriodError()
        # Changing the time always returns to PENDING so an admin re-approves the new slot.
        return self.model_copy(
            update={
                "start_at": start_at,
                "end_at": end_at,
                "status": ReservationStatus.PENDING,
                "updated_at": datetime.now(tz=timezone.utc),
            }
        )
