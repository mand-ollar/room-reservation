from pydantic import BaseModel
from ulid import ULID

from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Space
from app.reservation.domain.exceptions import DuplicateSpaceNameError, SpaceNotFoundError
from app.reservation.domain.value_objects import LocalizedNames


class UpdateSpaceCommand(BaseModel):
    space_id: ULID
    names: LocalizedNames
    floor: int


class UpdateSpaceUseCase:
    def __init__(self, space_repository: SpaceRepository) -> None:
        self.space_repository: SpaceRepository = space_repository

    async def execute(self, command: UpdateSpaceCommand) -> Space:
        space: Space | None = await self.space_repository.find_by_id(id=command.space_id)
        if space is None:
            raise SpaceNotFoundError()

        if command.names.ko != space.names.ko:
            duplicate_ko: Space | None = await self.space_repository.find_by_building_id_and_locale_name(
                building_id=space.building_id,
                locale="ko",
                name=command.names.ko,
            )
            if duplicate_ko is not None:
                raise DuplicateSpaceNameError()

        if command.names.en != space.names.en:
            duplicate_en: Space | None = await self.space_repository.find_by_building_id_and_locale_name(
                building_id=space.building_id,
                locale="en",
                name=command.names.en,
            )
            if duplicate_en is not None:
                raise DuplicateSpaceNameError()

        updated: Space = space.model_copy(update={"names": command.names, "floor": command.floor})
        return await self.space_repository.update(entity=updated)
