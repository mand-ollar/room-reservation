from datetime import datetime

from pydantic import BaseModel

from app.reservation.domain.entities.Building import Building
from app.reservation.domain.entities.Reservation import Reservation
from app.reservation.domain.entities.Space import Space
from app.reservation.domain.value_objects.ReservationStatus import ReservationStatus


class BuildingResponse(BaseModel):
    id: str
    name: str
    created_at: datetime

    @classmethod
    def from_entity(cls, building: Building) -> "BuildingResponse":
        return cls(
            id=str(building.id),
            name=building.name,
            created_at=building.created_at,
        )


class SpaceResponse(BaseModel):
    id: str
    building_id: str
    name: str
    created_at: datetime

    @classmethod
    def from_entity(cls, space: Space) -> "SpaceResponse":
        return cls(
            id=str(space.id),
            building_id=str(space.building_id),
            name=space.name,
            created_at=space.created_at,
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
