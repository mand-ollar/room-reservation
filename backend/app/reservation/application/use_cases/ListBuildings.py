from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.domain.entities.Building import Building


class ListBuildingsUseCase:
    def __init__(self, building_repository: BuildingRepository) -> None:
        self.building_repository: BuildingRepository = building_repository

    async def execute(self) -> list[Building]:
        return await self.building_repository.find_all()
