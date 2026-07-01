from datetime import datetime

from pydantic import BaseModel
from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.exceptions import SpaceNotFoundError
from app.reservation.domain.value_objects import ReservationStatus
from app.user.application.outbound.repositories.UserRepository import UserRepository
from app.user.domain.entities import User

_UNKNOWN_USER_NAME: str = "알 수 없음"


class PublicReservationView(BaseModel):
    status: ReservationStatus
    start_at: datetime
    end_at: datetime
    user_name: str


class ListReservationsUseCase:
    def __init__(
        self,
        reservation_repository: ReservationRepository,
        space_repository: SpaceRepository,
        user_repository: UserRepository,
    ) -> None:
        self.reservation_repository: ReservationRepository = reservation_repository
        self.space_repository: SpaceRepository = space_repository
        self.user_repository: UserRepository = user_repository

    async def execute(
        self,
        status: ReservationStatus | None = None,
        space_id: ULID | None = None,
        *,
        require_existing_space: bool = False,
    ) -> list[PublicReservationView]:
        if space_id is not None and require_existing_space:
            if await self.space_repository.find_by_id(id=space_id) is None:
                raise SpaceNotFoundError()

        reservations = await self.reservation_repository.find_all(status=status, space_id=space_id)
        unique_user_ids: list[ULID] = list({reservation.user_id for reservation in reservations})
        users: list[User] = await self.user_repository.find_by_ids(ids=unique_user_ids)
        user_names_by_id: dict[ULID, str] = {user.id: user.name for user in users}

        return [
            PublicReservationView(
                status=reservation.status,
                start_at=reservation.start_at,
                end_at=reservation.end_at,
                user_name=user_names_by_id.get(reservation.user_id, _UNKNOWN_USER_NAME),
            )
            for reservation in reservations
        ]
