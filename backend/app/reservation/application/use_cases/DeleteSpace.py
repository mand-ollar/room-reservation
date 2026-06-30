from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Reservation, Space
from app.reservation.domain.exceptions import SpaceInUseError, SpaceNotFoundError


class DeleteSpaceUseCase:
    def __init__(
        self,
        space_repository: SpaceRepository,
        reservation_repository: ReservationRepository,
    ) -> None:
        self.space_repository: SpaceRepository = space_repository
        self.reservation_repository: ReservationRepository = reservation_repository

    async def execute(self, space_id: ULID) -> None:
        space: Space | None = await self.space_repository.find_by_id(id=space_id)
        if space is None:
            raise SpaceNotFoundError()

        reservations: list[Reservation] = await self.reservation_repository.find_all(space_id=space_id)
        if reservations:
            raise SpaceInUseError()

        await self.space_repository.delete(id=space_id)
