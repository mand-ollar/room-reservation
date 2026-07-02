import secrets
from datetime import UTC, datetime

from pydantic import BaseModel

from app.user.application.outbound.repositories.AdminCredentialRepository import AdminCredentialRepository
from app.user.application.services.admin_credential_access import get_or_bootstrap_admin_credential
from app.user.domain.entities.AdminCredential import AdminCredential
from app.user.domain.exceptions import InvalidCredentialsError, WeakAdminPasswordError
from core.security.password import (
    MIN_ADMIN_PASSWORD_LENGTH,
    hash_password,
    verify_password,
)


class ChangeAdminPasswordCommand(BaseModel):
    current_password: str
    new_password: str


class ChangeAdminPasswordUseCase:
    def __init__(
        self,
        admin_credential_repository: AdminCredentialRepository,
        bootstrap_password: str,
    ) -> None:
        self.admin_credential_repository: AdminCredentialRepository = admin_credential_repository
        self.bootstrap_password: str = bootstrap_password

    async def execute(self, command: ChangeAdminPasswordCommand) -> None:
        if len(command.new_password) < MIN_ADMIN_PASSWORD_LENGTH:
            raise WeakAdminPasswordError()

        if secrets.compare_digest(command.current_password, command.new_password):
            raise WeakAdminPasswordError()

        credential: AdminCredential = await get_or_bootstrap_admin_credential(
            repository=self.admin_credential_repository,
            bootstrap_password=self.bootstrap_password,
        )

        if not verify_password(password=command.current_password, stored_hash=credential.password_hash):
            raise InvalidCredentialsError()

        updated_credential: AdminCredential = AdminCredential(
            password_hash=hash_password(password=command.new_password),
            updated_at=datetime.now(tz=UTC),
        )
        await self.admin_credential_repository.save(credential=updated_credential)
