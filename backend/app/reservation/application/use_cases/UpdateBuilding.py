from pydantic import BaseModel
from ulid import ULID

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.domain.entities import Building
from app.reservation.domain.exceptions import BuildingNotFoundError, DuplicateBuildingNameError
from app.reservation.domain.value_objects import LocalizedNames


class UpdateBuildingCommand(BaseModel):
    building_id: ULID
    names: LocalizedNames


class UpdateBuildingUseCase:
    def __init__(self, building_repository: BuildingRepository) -> None:
        self.building_repository: BuildingRepository = building_repository

    async def execute(self, command: UpdateBuildingCommand) -> Building:
        building: Building | None = await self.building_repository.find_by_id(id=command.building_id)
        if building is None:
            raise BuildingNotFoundError()

        if command.names.ko != building.names.ko:
            existing_ko: Building | None = await self.building_repository.find_by_locale_name(
                locale="ko",
                name=command.names.ko,
            )
            if existing_ko is not None:
                raise DuplicateBuildingNameError()

        if command.names.en != building.names.en:
            existing_en: Building | None = await self.building_repository.find_by_locale_name(
                locale="en",
                name=command.names.en,
            )
            if existing_en is not None:
                raise DuplicateBuildingNameError()

        updated: Building = building.model_copy(update={"names": command.names})
        return await self.building_repository.update(entity=updated)
