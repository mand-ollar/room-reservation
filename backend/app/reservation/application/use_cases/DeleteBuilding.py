from ulid import ULID

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Building, Space
from app.reservation.domain.exceptions import BuildingInUseError, BuildingNotFoundError


class DeleteBuildingUseCase:
    def __init__(self, building_repository: BuildingRepository, space_repository: SpaceRepository) -> None:
        self.building_repository: BuildingRepository = building_repository
        self.space_repository: SpaceRepository = space_repository

    async def execute(self, building_id: ULID) -> None:
        building: Building | None = await self.building_repository.find_by_id(id=building_id)
        if building is None:
            raise BuildingNotFoundError()

        spaces: list[Space] = await self.space_repository.find_by_building_id(building_id=building_id)
        if spaces:
            raise BuildingInUseError()

        await self.building_repository.delete(id=building_id)
