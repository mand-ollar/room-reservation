from abc import ABC, abstractmethod

from ulid import ULID

from app.reservation.domain.entities import Space


class SpaceRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: ULID) -> Space | None: ...

    @abstractmethod
    async def find_all(self) -> list[Space]: ...

    @abstractmethod
    async def find_by_building_id(self, building_id: ULID) -> list[Space]: ...

    @abstractmethod
    async def find_by_building_id_and_locale_name(
        self,
        building_id: ULID,
        locale: str,
        name: str,
    ) -> Space | None: ...

    @abstractmethod
    async def save(self, entity: Space) -> Space: ...

    @abstractmethod
    async def update(self, entity: Space) -> Space: ...

    @abstractmethod
    async def delete(self, id: ULID) -> None: ...
