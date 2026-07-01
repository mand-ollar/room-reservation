from datetime import datetime, timezone

from pydantic import BaseModel
from ulid import ULID

from app.reservation.domain.value_objects import LocalizedNames


class Space(BaseModel):
    id: ULID
    building_id: ULID
    names: LocalizedNames
    floor: int
    created_at: datetime

    @classmethod
    def create(cls, building_id: ULID, names: LocalizedNames, floor: int) -> "Space":
        return cls(
            id=ULID(),
            building_id=building_id,
            names=names,
            floor=floor,
            created_at=datetime.now(tz=timezone.utc),
        )
