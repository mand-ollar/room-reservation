from pydantic import BaseModel
from ulid import ULID

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Building, Space
from app.reservation.domain.exceptions import BuildingNotFoundError, DuplicateSpaceNameError


class CreateSpaceCommand(BaseModel):
    building_id: ULID
    name: str


class CreateSpaceUseCase:
    def __init__(self, building_repository: BuildingRepository, space_repository: SpaceRepository) -> None:
        self.building_repository: BuildingRepository = building_repository
        self.space_repository: SpaceRepository = space_repository

    async def execute(self, command: CreateSpaceCommand) -> Space:
        building: Building | None = await self.building_repository.find_by_id(id=command.building_id)
        if building is None:
            raise BuildingNotFoundError()

        duplicate: Space | None = await self.space_repository.find_by_building_id_and_name(
            building_id=command.building_id,
            name=command.name,
        )
        if duplicate is not None:
            raise DuplicateSpaceNameError()

        return await self.space_repository.save(
            entity=Space.create(building_id=command.building_id, name=command.name),
        )
