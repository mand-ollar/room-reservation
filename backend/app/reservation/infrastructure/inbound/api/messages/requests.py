from datetime import datetime

from pydantic import BaseModel


class CreateBuildingRequest(BaseModel):
    name: str


class CreateSpaceRequest(BaseModel):
    building_id: str
    name: str


class CreateReservationRequest(BaseModel):
    space_id: str
    start_at: datetime
    end_at: datetime


class RescheduleReservationRequest(BaseModel):
    start_at: datetime
    end_at: datetime
