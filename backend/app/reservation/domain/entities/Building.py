from datetime import datetime, timezone

from pydantic import BaseModel
from ulid import ULID


class Building(BaseModel):
    id: ULID
    name: str
    created_at: datetime

    @classmethod
    def create(cls, name: str) -> "Building":
        return cls(
            id=ULID(),
            name=name,
            created_at=datetime.now(tz=timezone.utc),
        )
