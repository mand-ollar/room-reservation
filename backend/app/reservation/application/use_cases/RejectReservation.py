from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.domain.entities.Reservation import Reservation
from app.reservation.domain.exceptions import ReservationNotFoundError


class RejectReservationUseCase:
    def __init__(self, reservation_repository: ReservationRepository) -> None:
        self.reservation_repository: ReservationRepository = reservation_repository

    async def execute(self, reservation_id: ULID) -> Reservation:
        reservation: Reservation | None = await self.reservation_repository.find_by_id(id=reservation_id)
        if reservation is None:
            raise ReservationNotFoundError()

        rejected: Reservation = reservation.reject()
        return await self.reservation_repository.update(entity=rejected)
