from datetime import datetime, timezone

from pydantic import BaseModel
from ulid import ULID


class User(BaseModel):
    id: ULID
    name: str
    phone: str
    created_at: datetime

    @classmethod
    def create(cls, name: str, phone: str) -> "User":
        return cls(
            id=ULID(),
            name=name,
            phone=phone,
            created_at=datetime.now(tz=timezone.utc),
        )
