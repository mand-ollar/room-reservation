from datetime import datetime, timezone

from pydantic import BaseModel
from ulid import ULID


class Building(BaseModel):
    id: ULID
    name_ko: str
    name_en: str
    created_at: datetime

    @classmethod
    def create(cls, name_ko: str, name_en: str) -> "Building":
        return cls(
            id=ULID(),
            name_ko=name_ko,
            name_en=name_en,
            created_at=datetime.now(tz=timezone.utc),
        )
