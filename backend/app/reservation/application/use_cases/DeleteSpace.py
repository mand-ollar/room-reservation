from ulid import ULID

from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Space
from app.reservation.domain.exceptions import SpaceNotFoundError


class DeleteSpaceUseCase:
    def __init__(self, space_repository: SpaceRepository) -> None:
        self.space_repository: SpaceRepository = space_repository

    async def execute(self, space_id: ULID) -> None:
        space: Space | None = await self.space_repository.find_by_id(id=space_id)
        if space is None:
            raise SpaceNotFoundError()

        # Guard against deleting a space with reservations is added once the reservation
        # domain exists; until then the DB-level ON DELETE RESTRICT FK protects integrity.
        await self.space_repository.delete(id=space_id)
