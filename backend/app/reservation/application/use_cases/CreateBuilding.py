from pydantic import BaseModel

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.domain.entities import Building
from app.reservation.domain.exceptions import DuplicateBuildingNameError


class CreateBuildingCommand(BaseModel):
    name_ko: str
    name_en: str


class CreateBuildingUseCase:
    def __init__(self, building_repository: BuildingRepository) -> None:
        self.building_repository: BuildingRepository = building_repository

    async def execute(self, command: CreateBuildingCommand) -> Building:
        existing_ko: Building | None = await self.building_repository.find_by_name_ko(name_ko=command.name_ko)
        if existing_ko is not None:
            raise DuplicateBuildingNameError()

        existing_en: Building | None = await self.building_repository.find_by_name_en(name_en=command.name_en)
        if existing_en is not None:
            raise DuplicateBuildingNameError()

        return await self.building_repository.save(
            entity=Building.create(name_ko=command.name_ko, name_en=command.name_en),
        )
