from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Reservation
from app.reservation.domain.exceptions import SpaceNotFoundError
from app.reservation.domain.value_objects import ReservationStatus


class ListReservationsUseCase:
    def __init__(
        self,
        reservation_repository: ReservationRepository,
        space_repository: SpaceRepository,
    ) -> None:
        self.reservation_repository: ReservationRepository = reservation_repository
        self.space_repository: SpaceRepository = space_repository

    async def execute(
        self,
        status: ReservationStatus | None = None,
        space_id: ULID | None = None,
        *,
        require_existing_space: bool = False,
    ) -> list[Reservation]:
        if space_id is not None and require_existing_space:
            if await self.space_repository.find_by_id(id=space_id) is None:
                raise SpaceNotFoundError()
        return await self.reservation_repository.find_all(status=status, space_id=space_id)
