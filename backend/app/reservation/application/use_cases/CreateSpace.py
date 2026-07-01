from pydantic import BaseModel
from ulid import ULID

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Building, Space
from app.reservation.domain.exceptions import BuildingNotFoundError, DuplicateSpaceNameError
from app.reservation.domain.value_objects import LocalizedNames


class CreateSpaceCommand(BaseModel):
    building_id: ULID
    names: LocalizedNames
    floor: int


class CreateSpaceUseCase:
    def __init__(self, building_repository: BuildingRepository, space_repository: SpaceRepository) -> None:
        self.building_repository: BuildingRepository = building_repository
        self.space_repository: SpaceRepository = space_repository

    async def execute(self, command: CreateSpaceCommand) -> Space:
        building: Building | None = await self.building_repository.find_by_id(id=command.building_id)
        if building is None:
            raise BuildingNotFoundError()

        duplicate_ko: Space | None = await self.space_repository.find_by_building_id_and_locale_name(
            building_id=command.building_id,
            locale="ko",
            name=command.names.ko,
        )
        if duplicate_ko is not None:
            raise DuplicateSpaceNameError()

        duplicate_en: Space | None = await self.space_repository.find_by_building_id_and_locale_name(
            building_id=command.building_id,
            locale="en",
            name=command.names.en,
        )
        if duplicate_en is not None:
            raise DuplicateSpaceNameError()

        return await self.space_repository.save(
            entity=Space.create(
                building_id=command.building_id,
                names=command.names,
                floor=command.floor,
            ),
        )
