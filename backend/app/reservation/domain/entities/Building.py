from datetime import datetime, timezone

from pydantic import BaseModel
from ulid import ULID

from app.reservation.domain.value_objects import LocalizedNames


class Building(BaseModel):
    id: ULID
    names: LocalizedNames
    created_at: datetime

    @classmethod
    def create(cls, names: LocalizedNames) -> "Building":
        return cls(
            id=ULID(),
            names=names,
            created_at=datetime.now(tz=timezone.utc),
        )
