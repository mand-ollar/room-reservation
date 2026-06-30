from datetime import datetime, timezone

from pydantic import BaseModel
from ulid import ULID


class Space(BaseModel):
    id: ULID
    building_id: ULID
    name: str
    created_at: datetime

    @classmethod
    def create(cls, building_id: ULID, name: str) -> "Space":
        return cls(
            id=ULID(),
            building_id=building_id,
            name=name,
            created_at=datetime.now(tz=timezone.utc),
        )
