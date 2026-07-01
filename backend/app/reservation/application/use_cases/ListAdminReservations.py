from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.domain.entities import Reservation
from app.reservation.domain.value_objects import ReservationStatus


class ListAdminReservationsUseCase:
    def __init__(self, reservation_repository: ReservationRepository) -> None:
        self.reservation_repository: ReservationRepository = reservation_repository

    async def execute(
        self,
        status: ReservationStatus | None = None,
        space_id: ULID | None = None,
    ) -> list[Reservation]:
        return await self.reservation_repository.find_all(status=status, space_id=space_id)
