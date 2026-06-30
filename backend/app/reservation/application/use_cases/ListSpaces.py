from ulid import ULID

from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Space


class ListSpacesUseCase:
    def __init__(self, space_repository: SpaceRepository) -> None:
        self.space_repository: SpaceRepository = space_repository

    async def execute(self, building_id: ULID | None = None) -> list[Space]:
        if building_id is not None:
            return await self.space_repository.find_by_building_id(building_id=building_id)
        return await self.space_repository.find_all()
