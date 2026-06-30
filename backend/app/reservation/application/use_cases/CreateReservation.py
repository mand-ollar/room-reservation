from datetime import datetime

from pydantic import BaseModel
from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities.Reservation import Reservation
from app.reservation.domain.entities.Space import Space
from app.reservation.domain.exceptions import SpaceNotFoundError


class CreateReservationCommand(BaseModel):
    user_id: ULID
    space_id: ULID
    start_at: datetime
    end_at: datetime


class CreateReservationUseCase:
    def __init__(
        self,
        reservation_repository: ReservationRepository,
        space_repository: SpaceRepository,
    ) -> None:
        self.reservation_repository: ReservationRepository = reservation_repository
        self.space_repository: SpaceRepository = space_repository

    async def execute(self, command: CreateReservationCommand) -> Reservation:
        space: Space | None = await self.space_repository.find_by_id(id=command.space_id)
        if space is None:
            raise SpaceNotFoundError()

        reservation: Reservation = Reservation.create(
            user_id=command.user_id,
            space_id=command.space_id,
            start_at=command.start_at,
            end_at=command.end_at,
        )
        return await self.reservation_repository.save(entity=reservation)
