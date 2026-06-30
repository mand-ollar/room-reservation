from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.domain.entities.Reservation import Reservation


class ListMyReservationsUseCase:
    def __init__(self, reservation_repository: ReservationRepository) -> None:
        self.reservation_repository: ReservationRepository = reservation_repository

    async def execute(self, user_id: ULID) -> list[Reservation]:
        return await self.reservation_repository.find_by_user_id(user_id=user_id)
