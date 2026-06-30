from abc import ABC, abstractmethod

from ulid import ULID

from app.user.domain.entities import User


class UserRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: ULID) -> User | None: ...

    @abstractmethod
    async def find_by_phone(self, phone: str) -> User | None: ...

    @abstractmethod
    async def save(self, entity: User) -> User: ...
