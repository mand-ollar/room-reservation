from abc import ABC, abstractmethod

from app.user.domain.entities.AdminCredential import AdminCredential


class AdminCredentialRepository(ABC):
    @abstractmethod
    async def find(self) -> AdminCredential | None:
        raise NotImplementedError

    @abstractmethod
    async def save(self, credential: AdminCredential) -> AdminCredential:
        raise NotImplementedError
