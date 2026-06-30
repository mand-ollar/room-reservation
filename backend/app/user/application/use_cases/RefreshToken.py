from typing import Any

from jose import JWTError
from ulid import ULID

from app.user.application.outbound.repositories.UserRepository import UserRepository
from app.user.application.use_cases.token_pair import TokenPair
from app.user.domain.entities.User import User
from app.user.domain.exceptions import InvalidCredentialsError, UserNotFoundError
from core.security.jwt import create_access_token, create_refresh_token, decode_token
from core.security.roles import AuthRole


class RefreshTokenUseCase:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository: UserRepository = user_repository

    async def execute(self, refresh_token: str) -> TokenPair:
        try:
            payload: dict[str, Any] = decode_token(token=refresh_token)
        except JWTError as error:
            raise InvalidCredentialsError() from error

        if payload.get("type") != "refresh":
            raise InvalidCredentialsError()

        subject: Any = payload.get("sub")
        role_value: Any = payload.get("role")
        if not isinstance(subject, str) or not isinstance(role_value, str):
            raise InvalidCredentialsError()

        try:
            role: AuthRole = AuthRole(role_value)
        except ValueError as error:
            raise InvalidCredentialsError() from error

        if role is AuthRole.USER:
            user: User | None = await self.user_repository.find_by_id(id=ULID.from_str(subject))
            if user is None:
                raise UserNotFoundError()

        return TokenPair(
            access_token=create_access_token(subject=subject, role=role),
            refresh_token=create_refresh_token(subject=subject, role=role),
        )
