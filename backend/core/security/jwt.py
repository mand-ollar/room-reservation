from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt

from config import settings
from core.security.roles import AuthRole


def _create_token(subject: str, role: AuthRole, token_type: str, expires_delta: timedelta) -> str:
    expire: datetime = datetime.now(tz=timezone.utc) + expires_delta
    payload: dict[str, Any] = {
        "sub": subject,
        "role": role.value,
        "type": token_type,
        "exp": expire,
    }
    token: str = jwt.encode(
        claims=payload,
        key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    return token


def create_access_token(subject: str, role: AuthRole) -> str:
    return _create_token(
        subject=subject,
        role=role,
        token_type="access",
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(subject: str, role: AuthRole) -> str:
    return _create_token(
        subject=subject,
        role=role,
        token_type="refresh",
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
    )


def decode_token(token: str) -> dict[str, Any]:
    payload: dict[str, Any] = jwt.decode(
        token=token,
        key=settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )
    return payload
