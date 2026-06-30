from typing import Annotated

from fastapi import Depends

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.application.use_cases.ApproveReservation import ApproveReservationUseCase
from app.reservation.application.use_cases.CancelReservation import CancelReservationUseCase
from app.reservation.application.use_cases.CreateBuilding import CreateBuildingUseCase
from app.reservation.application.use_cases.CreateReservation import CreateReservationUseCase
from app.reservation.application.use_cases.CreateSpace import CreateSpaceUseCase
from app.reservation.application.use_cases.DeleteBuilding import DeleteBuildingUseCase
from app.reservation.application.use_cases.DeleteSpace import DeleteSpaceUseCase
from app.reservation.application.use_cases.ListBuildings import ListBuildingsUseCase
from app.reservation.application.use_cases.ListMyReservations import ListMyReservationsUseCase
from app.reservation.application.use_cases.ListReservations import ListReservationsUseCase
from app.reservation.application.use_cases.ListSpaces import ListSpacesUseCase
from app.reservation.application.use_cases.RejectReservation import RejectReservationUseCase
from app.reservation.application.use_cases.RescheduleReservation import RescheduleReservationUseCase
from app.user.application.outbound.repositories.UserRepository import UserRepository
from app.user.application.use_cases.AdminLogin import AdminLoginUseCase
from app.user.application.use_cases.RefreshToken import RefreshTokenUseCase
from app.user.application.use_cases.UserLogin import UserLoginUseCase
from config import settings
from di.repository import (
    get_building_repository,
    get_reservation_repository,
    get_space_repository,
    get_user_repository,
)


def get_user_login_use_case(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> UserLoginUseCase:
    return UserLoginUseCase(user_repository=user_repository)


def get_admin_login_use_case() -> AdminLoginUseCase:
    return AdminLoginUseCase(admin_password=settings.admin_password)


def get_refresh_token_use_case(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> RefreshTokenUseCase:
    return RefreshTokenUseCase(user_repository=user_repository)


def get_create_building_use_case(
    building_repository: Annotated[BuildingRepository, Depends(get_building_repository)],
) -> CreateBuildingUseCase:
    return CreateBuildingUseCase(building_repository=building_repository)


def get_list_buildings_use_case(
    building_repository: Annotated[BuildingRepository, Depends(get_building_repository)],
) -> ListBuildingsUseCase:
    return ListBuildingsUseCase(building_repository=building_repository)


def get_delete_building_use_case(
    building_repository: Annotated[BuildingRepository, Depends(get_building_repository)],
    space_repository: Annotated[SpaceRepository, Depends(get_space_repository)],
) -> DeleteBuildingUseCase:
    return DeleteBuildingUseCase(building_repository=building_repository, space_repository=space_repository)


def get_create_space_use_case(
    building_repository: Annotated[BuildingRepository, Depends(get_building_repository)],
    space_repository: Annotated[SpaceRepository, Depends(get_space_repository)],
) -> CreateSpaceUseCase:
    return CreateSpaceUseCase(building_repository=building_repository, space_repository=space_repository)


def get_list_spaces_use_case(
    space_repository: Annotated[SpaceRepository, Depends(get_space_repository)],
) -> ListSpacesUseCase:
    return ListSpacesUseCase(space_repository=space_repository)


def get_delete_space_use_case(
    space_repository: Annotated[SpaceRepository, Depends(get_space_repository)],
) -> DeleteSpaceUseCase:
    return DeleteSpaceUseCase(space_repository=space_repository)


def get_create_reservation_use_case(
    reservation_repository: Annotated[ReservationRepository, Depends(get_reservation_repository)],
    space_repository: Annotated[SpaceRepository, Depends(get_space_repository)],
) -> CreateReservationUseCase:
    return CreateReservationUseCase(reservation_repository=reservation_repository, space_repository=space_repository)


def get_list_reservations_use_case(
    reservation_repository: Annotated[ReservationRepository, Depends(get_reservation_repository)],
) -> ListReservationsUseCase:
    return ListReservationsUseCase(reservation_repository=reservation_repository)


def get_list_my_reservations_use_case(
    reservation_repository: Annotated[ReservationRepository, Depends(get_reservation_repository)],
) -> ListMyReservationsUseCase:
    return ListMyReservationsUseCase(reservation_repository=reservation_repository)


def get_approve_reservation_use_case(
    reservation_repository: Annotated[ReservationRepository, Depends(get_reservation_repository)],
) -> ApproveReservationUseCase:
    return ApproveReservationUseCase(reservation_repository=reservation_repository)


def get_reject_reservation_use_case(
    reservation_repository: Annotated[ReservationRepository, Depends(get_reservation_repository)],
) -> RejectReservationUseCase:
    return RejectReservationUseCase(reservation_repository=reservation_repository)


def get_cancel_reservation_use_case(
    reservation_repository: Annotated[ReservationRepository, Depends(get_reservation_repository)],
) -> CancelReservationUseCase:
    return CancelReservationUseCase(reservation_repository=reservation_repository)


def get_reschedule_reservation_use_case(
    reservation_repository: Annotated[ReservationRepository, Depends(get_reservation_repository)],
) -> RescheduleReservationUseCase:
    return RescheduleReservationUseCase(reservation_repository=reservation_repository)
