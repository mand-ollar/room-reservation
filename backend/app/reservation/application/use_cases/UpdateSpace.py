from pydantic import BaseModel
from ulid import ULID

from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Space
from app.reservation.domain.exceptions import SpaceNotFoundError
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

        updated: Space = space.model_copy(update={"names": command.names, "floor": command.floor})
        return await self.space_repository.update(entity=updated)
