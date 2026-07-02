from pydantic import BaseModel

from app.user.application.outbound.repositories.AdminCredentialRepository import AdminCredentialRepository
from app.user.application.services.admin_credential_access import get_or_bootstrap_admin_credential
from app.user.application.use_cases.token_pair import TokenPair
from app.user.domain.entities.AdminCredential import AdminCredential
from app.user.domain.exceptions import InvalidCredentialsError
from core.security.jwt import create_access_token, create_refresh_token
from core.security.password import verify_password
from core.security.roles import AuthRole

ADMIN_SUBJECT: str = "admin"


class AdminLoginCommand(BaseModel):
    password: str


class AdminLoginUseCase:
    def __init__(
        self,
        admin_credential_repository: AdminCredentialRepository,
        bootstrap_password: str,
    ) -> None:
        self.admin_credential_repository: AdminCredentialRepository = admin_credential_repository
        self.bootstrap_password: str = bootstrap_password

    async def execute(self, command: AdminLoginCommand) -> TokenPair:
        credential: AdminCredential = await get_or_bootstrap_admin_credential(
            repository=self.admin_credential_repository,
            bootstrap_password=self.bootstrap_password,
        )

        if not verify_password(password=command.password, stored_hash=credential.password_hash):
            raise InvalidCredentialsError()

        return TokenPair(
            access_token=create_access_token(subject=ADMIN_SUBJECT, role=AuthRole.ADMIN),
            refresh_token=create_refresh_token(subject=ADMIN_SUBJECT, role=AuthRole.ADMIN),
        )
