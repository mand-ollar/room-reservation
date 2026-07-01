from datetime import datetime, timezone

from pydantic import BaseModel
from ulid import ULID


class Space(BaseModel):
    id: ULID
    building_id: ULID
    name_ko: str
    name_en: str
    floor: int
    created_at: datetime

    @classmethod
    def create(cls, building_id: ULID, name_ko: str, name_en: str, floor: int) -> "Space":
        return cls(
            id=ULID(),
            building_id=building_id,
            name_ko=name_ko,
            name_en=name_en,
            floor=floor,
            created_at=datetime.now(tz=timezone.utc),
        )
