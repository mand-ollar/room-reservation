from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from ulid import ULID

from app.reservation.application.use_cases.ApproveReservation import ApproveReservationUseCase
from app.reservation.application.use_cases.CancelReservation import CancelReservationUseCase
from app.reservation.application.use_cases.CreateBuilding import CreateBuildingCommand, CreateBuildingUseCase
from app.reservation.application.use_cases.CreateReservation import (
    CreateReservationCommand,
    CreateReservationUseCase,
)
from app.reservation.application.use_cases.CreateSpace import CreateSpaceCommand, CreateSpaceUseCase
from app.reservation.application.use_cases.DeleteBuilding import DeleteBuildingUseCase
from app.reservation.application.use_cases.DeleteSpace import DeleteSpaceUseCase
from app.reservation.application.use_cases.ListBuildings import ListBuildingsUseCase
from app.reservation.application.use_cases.ListMyReservations import ListMyReservationsUseCase
from app.reservation.application.use_cases.ListReservations import ListReservationsUseCase
from app.reservation.application.use_cases.ListSpaces import ListSpacesUseCase
from app.reservation.application.use_cases.RejectReservation import RejectReservationUseCase
from app.reservation.application.use_cases.RescheduleReservation import (
    RescheduleReservationCommand,
    RescheduleReservationUseCase,
)
from app.reservation.domain.entities.Building import Building
from app.reservation.domain.entities.Reservation import Reservation
from app.reservation.domain.entities.Space import Space
from app.reservation.domain.exceptions import (
    BuildingInUseError,
    BuildingNotFoundError,
    DuplicateBuildingNameError,
    DuplicateSpaceNameError,
    InvalidReservationPeriodError,
    InvalidReservationTransitionError,
    ReservationAccessDeniedError,
    ReservationConflictError,
    ReservationNotFoundError,
    SpaceNotFoundError,
)
from app.reservation.domain.value_objects.ReservationStatus import ReservationStatus
from app.reservation.infrastructure.inbound.api.messages.requests import (
    CreateBuildingRequest,
    CreateReservationRequest,
    CreateSpaceRequest,
    RescheduleReservationRequest,
)
from app.reservation.infrastructure.inbound.api.messages.responses import (
    BuildingResponse,
    ReservationResponse,
    SpaceResponse,
)
from app.user.domain.entities.User import User
from di.auth import get_current_user, require_admin
from di.usecase import (
    get_approve_reservation_use_case,
    get_cancel_reservation_use_case,
    get_create_building_use_case,
    get_create_reservation_use_case,
    get_create_space_use_case,
    get_delete_building_use_case,
    get_delete_space_use_case,
    get_list_buildings_use_case,
    get_list_my_reservations_use_case,
    get_list_reservations_use_case,
    get_list_spaces_use_case,
    get_reject_reservation_use_case,
    get_reschedule_reservation_use_case,
)

router: APIRouter = APIRouter(tags=["reservation"])


def _parse_ulid(value: str) -> ULID:
    try:
        return ULID.from_str(value)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid ID format") from error


@router.get("/buildings", response_model=list[BuildingResponse])
async def list_buildings(
    use_case: Annotated[ListBuildingsUseCase, Depends(get_list_buildings_use_case)],
):
    buildings: list[Building] = await use_case.execute()
    return [BuildingResponse.from_entity(building=building) for building in buildings]


@router.post(
    "/buildings",
    response_model=BuildingResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_building(
    request: CreateBuildingRequest,
    use_case: Annotated[CreateBuildingUseCase, Depends(get_create_building_use_case)],
):
    try:
        building: Building = await use_case.execute(command=CreateBuildingCommand(name=request.name))
    except DuplicateBuildingNameError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    return BuildingResponse.from_entity(building=building)


@router.delete(
    "/buildings/{building_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
async def delete_building(
    building_id: str,
    use_case: Annotated[DeleteBuildingUseCase, Depends(get_delete_building_use_case)],
):
    try:
        await use_case.execute(building_id=_parse_ulid(value=building_id))
    except BuildingNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except BuildingInUseError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error


@router.get("/spaces", response_model=list[SpaceResponse])
async def list_spaces(
    use_case: Annotated[ListSpacesUseCase, Depends(get_list_spaces_use_case)],
    building_id: Annotated[str | None, Query()] = None,
):
    parsed_building_id: ULID | None = _parse_ulid(value=building_id) if building_id is not None else None
    spaces: list[Space] = await use_case.execute(building_id=parsed_building_id)
    return [SpaceResponse.from_entity(space=space) for space in spaces]


@router.post(
    "/spaces",
    response_model=SpaceResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_space(
    request: CreateSpaceRequest,
    use_case: Annotated[CreateSpaceUseCase, Depends(get_create_space_use_case)],
):
    try:
        space: Space = await use_case.execute(
            command=CreateSpaceCommand(building_id=_parse_ulid(value=request.building_id), name=request.name),
        )
    except BuildingNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except DuplicateSpaceNameError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    return SpaceResponse.from_entity(space=space)


@router.delete(
    "/spaces/{space_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
async def delete_space(
    space_id: str,
    use_case: Annotated[DeleteSpaceUseCase, Depends(get_delete_space_use_case)],
):
    try:
        await use_case.execute(space_id=_parse_ulid(value=space_id))
    except SpaceNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error


@router.post(
    "/reservations",
    response_model=ReservationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_reservation(
    request: CreateReservationRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[CreateReservationUseCase, Depends(get_create_reservation_use_case)],
):
    try:
        reservation: Reservation = await use_case.execute(
            command=CreateReservationCommand(
                user_id=current_user.id,
                space_id=_parse_ulid(value=request.space_id),
                start_at=request.start_at,
                end_at=request.end_at,
            ),
        )
    except SpaceNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except InvalidReservationPeriodError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    except ReservationConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    return ReservationResponse.from_entity(reservation=reservation)


@router.get("/reservations", response_model=list[ReservationResponse])
async def list_reservations(
    use_case: Annotated[ListReservationsUseCase, Depends(get_list_reservations_use_case)],
    status_filter: Annotated[ReservationStatus | None, Query(alias="status")] = None,
    space_id: Annotated[str | None, Query()] = None,
):
    parsed_space_id: ULID | None = _parse_ulid(value=space_id) if space_id is not None else None
    reservations: list[Reservation] = await use_case.execute(status=status_filter, space_id=parsed_space_id)
    return [ReservationResponse.from_entity(reservation=reservation) for reservation in reservations]


@router.get("/reservations/me", response_model=list[ReservationResponse])
async def list_my_reservations(
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[ListMyReservationsUseCase, Depends(get_list_my_reservations_use_case)],
):
    reservations: list[Reservation] = await use_case.execute(user_id=current_user.id)
    return [ReservationResponse.from_entity(reservation=reservation) for reservation in reservations]


@router.post(
    "/reservations/{reservation_id}/approve",
    response_model=ReservationResponse,
    dependencies=[Depends(require_admin)],
)
async def approve_reservation(
    reservation_id: str,
    use_case: Annotated[ApproveReservationUseCase, Depends(get_approve_reservation_use_case)],
):
    try:
        reservation: Reservation = await use_case.execute(reservation_id=_parse_ulid(value=reservation_id))
    except ReservationNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except InvalidReservationTransitionError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    return ReservationResponse.from_entity(reservation=reservation)


@router.post(
    "/reservations/{reservation_id}/reject",
    response_model=ReservationResponse,
    dependencies=[Depends(require_admin)],
)
async def reject_reservation(
    reservation_id: str,
    use_case: Annotated[RejectReservationUseCase, Depends(get_reject_reservation_use_case)],
):
    try:
        reservation: Reservation = await use_case.execute(reservation_id=_parse_ulid(value=reservation_id))
    except ReservationNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except InvalidReservationTransitionError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    return ReservationResponse.from_entity(reservation=reservation)


@router.post("/reservations/{reservation_id}/cancel", response_model=ReservationResponse)
async def cancel_reservation(
    reservation_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[CancelReservationUseCase, Depends(get_cancel_reservation_use_case)],
):
    try:
        reservation: Reservation = await use_case.execute(
            reservation_id=_parse_ulid(value=reservation_id),
            user_id=current_user.id,
        )
    except ReservationNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except ReservationAccessDeniedError as error:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error)) from error
    except InvalidReservationTransitionError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    return ReservationResponse.from_entity(reservation=reservation)


@router.patch("/reservations/{reservation_id}", response_model=ReservationResponse)
async def reschedule_reservation(
    reservation_id: str,
    request: RescheduleReservationRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[RescheduleReservationUseCase, Depends(get_reschedule_reservation_use_case)],
):
    try:
        reservation: Reservation = await use_case.execute(
            command=RescheduleReservationCommand(
                reservation_id=_parse_ulid(value=reservation_id),
                user_id=current_user.id,
                start_at=request.start_at,
                end_at=request.end_at,
            ),
        )
    except ReservationNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except ReservationAccessDeniedError as error:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error)) from error
    except InvalidReservationPeriodError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    except InvalidReservationTransitionError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    except ReservationConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    return ReservationResponse.from_entity(reservation=reservation)
