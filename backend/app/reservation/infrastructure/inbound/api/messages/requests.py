from datetime import datetime

from pydantic import BaseModel

from app.reservation.domain.value_objects import LocalizedNames


class LocalizedNamesRequest(BaseModel):
    ko: str
    en: str

    def to_value_object(self) -> LocalizedNames:
        return LocalizedNames(ko=self.ko, en=self.en)


class CreateBuildingRequest(BaseModel):
    names: LocalizedNamesRequest


class CreateSpaceRequest(BaseModel):
    building_id: str
    names: LocalizedNamesRequest
    floor: int


class CreateReservationRequest(BaseModel):
    space_id: str
    start_at: datetime
    end_at: datetime


class RescheduleReservationRequest(BaseModel):
    start_at: datetime
    end_at: datetime
