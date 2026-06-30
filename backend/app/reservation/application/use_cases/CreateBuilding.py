from pydantic import BaseModel

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.domain.entities import Building
from app.reservation.domain.exceptions import DuplicateBuildingNameError


class CreateBuildingCommand(BaseModel):
    name: str


class CreateBuildingUseCase:
    def __init__(self, building_repository: BuildingRepository) -> None:
        self.building_repository: BuildingRepository = building_repository

    async def execute(self, command: CreateBuildingCommand) -> Building:
        existing: Building | None = await self.building_repository.find_by_name(name=command.name)
        if existing is not None:
            raise DuplicateBuildingNameError()
        return await self.building_repository.save(entity=Building.create(name=command.name))
