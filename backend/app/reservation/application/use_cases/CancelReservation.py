from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.domain.entities import Reservation
from app.reservation.domain.exceptions import ReservationAccessDeniedError, ReservationNotFoundError


class CancelReservationUseCase:
    def __init__(self, reservation_repository: ReservationRepository) -> None:
        self.reservation_repository: ReservationRepository = reservation_repository

    async def execute(self, reservation_id: ULID, user_id: ULID) -> Reservation:
        reservation: Reservation | None = await self.reservation_repository.find_by_id(id=reservation_id)
        if reservation is None:
            raise ReservationNotFoundError()
        if reservation.user_id != user_id:
            raise ReservationAccessDeniedError()

        cancelled: Reservation = reservation.cancel()
        return await self.reservation_repository.update(entity=cancelled)
