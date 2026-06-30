from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.infrastructure.outbound.repositories.building.AlchemyBuildingRepository import (
    AlchemyBuildingRepository,
)
from app.reservation.infrastructure.outbound.repositories.reservation.AlchemyReservationRepository import (
    AlchemyReservationRepository,
)
from app.reservation.infrastructure.outbound.repositories.space.AlchemySpaceRepository import (
    AlchemySpaceRepository,
)
from app.user.application.outbound.repositories.UserRepository import UserRepository
from app.user.infrastructure.outbound.repositories.user.AlchemyUserRepository import (
    AlchemyUserRepository,
)
from core.db.session import get_session


def get_user_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> UserRepository:
    return AlchemyUserRepository(session=session)


def get_building_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> BuildingRepository:
    return AlchemyBuildingRepository(session=session)


def get_space_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> SpaceRepository:
    return AlchemySpaceRepository(session=session)


def get_reservation_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> ReservationRepository:
    return AlchemyReservationRepository(session=session)
