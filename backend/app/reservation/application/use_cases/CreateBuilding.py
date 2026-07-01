from pydantic import BaseModel

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.domain.entities import Building
from app.reservation.domain.exceptions import DuplicateBuildingNameError
from app.reservation.domain.value_objects import LocalizedNames


class CreateBuildingCommand(BaseModel):
    names: LocalizedNames


class CreateBuildingUseCase:
    def __init__(self, building_repository: BuildingRepository) -> None:
        self.building_repository: BuildingRepository = building_repository

    async def execute(self, command: CreateBuildingCommand) -> Building:
        existing_ko: Building | None = await self.building_repository.find_by_locale_name(
            locale="ko",
            name=command.names.ko,
        )
        if existing_ko is not None:
            raise DuplicateBuildingNameError()

        existing_en: Building | None = await self.building_repository.find_by_locale_name(
            locale="en",
            name=command.names.en,
        )
        if existing_en is not None:
            raise DuplicateBuildingNameError()

        return await self.building_repository.save(entity=Building.create(names=command.names))
