from datetime import datetime

from pydantic import BaseModel
from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.domain.entities import Reservation
from app.reservation.domain.exceptions import ReservationAccessDeniedError, ReservationNotFoundError


class RescheduleReservationCommand(BaseModel):
    reservation_id: ULID
    user_id: ULID | None = None
    start_at: datetime
    end_at: datetime
    as_admin: bool = False


class RescheduleReservationUseCase:
    def __init__(self, reservation_repository: ReservationRepository) -> None:
        self.reservation_repository: ReservationRepository = reservation_repository

    async def execute(self, command: RescheduleReservationCommand) -> Reservation:
        reservation: Reservation | None = await self.reservation_repository.find_by_id(id=command.reservation_id)
        if reservation is None:
            raise ReservationNotFoundError()
        if not command.as_admin:
            if command.user_id is None:
                raise ReservationAccessDeniedError()
            if reservation.user_id != command.user_id:
                raise ReservationAccessDeniedError()

        rescheduled: Reservation = reservation.reschedule(start_at=command.start_at, end_at=command.end_at)
        return await self.reservation_repository.update(entity=rescheduled)
