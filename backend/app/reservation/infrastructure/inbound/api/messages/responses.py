from datetime import datetime

from pydantic import BaseModel

from app.reservation.application.use_cases.ListReservations import PublicReservationView
from app.reservation.domain.entities import Building, Reservation, Space
from app.reservation.domain.value_objects import ReservationStatus


class BuildingResponse(BaseModel):
    id: str
    name_ko: str
    name_en: str
    created_at: datetime

    @classmethod
    def from_entity(cls, building: Building) -> "BuildingResponse":
        return cls(
            id=str(building.id),
            name_ko=building.name_ko,
            name_en=building.name_en,
            created_at=building.created_at,
        )


class SpaceResponse(BaseModel):
    id: str
    building_id: str
    name_ko: str
    name_en: str
    floor: int
    created_at: datetime

    @classmethod
    def from_entity(cls, space: Space) -> "SpaceResponse":
        return cls(
            id=str(space.id),
            building_id=str(space.building_id),
            name_ko=space.name_ko,
            name_en=space.name_en,
            floor=space.floor,
            created_at=space.created_at,
        )


class ReservationPublicResponse(BaseModel):
    status: ReservationStatus
    start_at: datetime
    end_at: datetime
    user_name: str

    @classmethod
    def from_view(cls, view: PublicReservationView) -> "ReservationPublicResponse":
        return cls(
            status=view.status,
            start_at=view.start_at,
            end_at=view.end_at,
            user_name=view.user_name,
        )


class ReservationResponse(BaseModel):
    id: str
    user_id: str
    space_id: str
    status: ReservationStatus
    start_at: datetime
    end_at: datetime
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, reservation: Reservation) -> "ReservationResponse":
        return cls(
            id=str(reservation.id),
            user_id=str(reservation.user_id),
            space_id=str(reservation.space_id),
            status=reservation.status,
            start_at=reservation.start_at,
            end_at=reservation.end_at,
            created_at=reservation.created_at,
            updated_at=reservation.updated_at,
        )
