import secrets

from pydantic import BaseModel

from app.user.application.use_cases.token_pair import TokenPair
from app.user.domain.exceptions import InvalidCredentialsError
from core.security.jwt import create_access_token, create_refresh_token
from core.security.roles import AuthRole

ADMIN_SUBJECT: str = "admin"


class AdminLoginCommand(BaseModel):
    password: str


class AdminLoginUseCase:
    def __init__(self, admin_password: str) -> None:
        self.admin_password: str = admin_password

    async def execute(self, command: AdminLoginCommand) -> TokenPair:
        if not secrets.compare_digest(command.password, self.admin_password):
            raise InvalidCredentialsError()

        return TokenPair(
            access_token=create_access_token(subject=ADMIN_SUBJECT, role=AuthRole.ADMIN),
            refresh_token=create_refresh_token(subject=ADMIN_SUBJECT, role=AuthRole.ADMIN),
        )
