from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from pydantic import BaseModel
from ulid import ULID

from app.user.application.outbound.repositories.UserRepository import UserRepository
from app.user.domain.entities import User
from core.security.jwt import decode_token
from core.security.roles import AuthRole
from di.repository import get_user_repository


class ReservationActor(BaseModel):
    role: AuthRole
    user_id: ULID | None = None

    @property
    def is_admin(self) -> bool:
        return self.role == AuthRole.ADMIN

bearer_scheme: HTTPBearer = HTTPBearer()

_credentials_exception: HTTPException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def _decode_access_payload(token: str) -> dict[str, Any]:
    try:
        payload: dict[str, Any] = decode_token(token=token)
    except JWTError as error:
        raise _credentials_exception from error
    if payload.get("type") != "access":
        raise _credentials_exception
    return payload


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> User:
    payload: dict[str, Any] = _decode_access_payload(token=credentials.credentials)
    if payload.get("role") != AuthRole.USER.value:
        raise _credentials_exception

    subject: Any = payload.get("sub")
    if not isinstance(subject, str):
        raise _credentials_exception

    user: User | None = await user_repository.find_by_id(id=ULID.from_str(subject))
    if user is None:
        raise _credentials_exception
    return user


async def require_admin(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
) -> None:
    payload: dict[str, Any] = _decode_access_payload(token=credentials.credentials)
    if payload.get("role") != AuthRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )


async def get_reservation_actor(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> ReservationActor:
    payload: dict[str, Any] = _decode_access_payload(token=credentials.credentials)
    role: Any = payload.get("role")

    if role == AuthRole.ADMIN.value:
        return ReservationActor(role=AuthRole.ADMIN)

    if role != AuthRole.USER.value:
        raise _credentials_exception

    subject: Any = payload.get("sub")
    if not isinstance(subject, str):
        raise _credentials_exception

    user: User | None = await user_repository.find_by_id(id=ULID.from_str(subject))
    if user is None:
        raise _credentials_exception

    return ReservationActor(role=AuthRole.USER, user_id=user.id)
