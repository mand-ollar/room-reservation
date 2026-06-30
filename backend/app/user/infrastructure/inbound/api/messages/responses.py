from datetime import datetime

from pydantic import BaseModel

from app.user.domain.entities.User import User


class UserResponse(BaseModel):
    id: str
    name: str
    phone: str
    created_at: datetime

    @classmethod
    def from_entity(cls, user: User) -> "UserResponse":
        return cls(
            id=str(user.id),
            name=user.name,
            phone=user.phone,
            created_at=user.created_at,
        )


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

    @classmethod
    def from_pair(cls, access_token: str, refresh_token: str) -> "TokenResponse":
        return cls(access_token=access_token, refresh_token=refresh_token)
