from abc import ABC, abstractmethod

from ulid import ULID

from app.reservation.domain.entities import Building


class BuildingRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: ULID) -> Building | None: ...

    @abstractmethod
    async def find_by_locale_name(self, locale: str, name: str) -> Building | None: ...

    @abstractmethod
    async def find_all(self) -> list[Building]: ...

    @abstractmethod
    async def save(self, entity: Building) -> Building: ...

    @abstractmethod
    async def update(self, entity: Building) -> Building: ...

    @abstractmethod
    async def delete(self, id: ULID) -> None: ...
