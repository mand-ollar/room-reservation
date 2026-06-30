from abc import ABC, abstractmethod

from ulid import ULID

from app.reservation.domain.entities import Reservation
from app.reservation.domain.value_objects import ReservationStatus


class ReservationRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: ULID) -> Reservation | None: ...

    @abstractmethod
    async def find_all(
        self,
        status: ReservationStatus | None = None,
        space_id: ULID | None = None,
    ) -> list[Reservation]: ...

    @abstractmethod
    async def find_by_user_id(self, user_id: ULID) -> list[Reservation]: ...

    @abstractmethod
    async def save(self, entity: Reservation) -> Reservation: ...

    @abstractmethod
    async def update(self, entity: Reservation) -> Reservation: ...
