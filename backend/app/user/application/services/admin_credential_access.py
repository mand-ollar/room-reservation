from datetime import UTC, datetime

from app.user.application.outbound.repositories.AdminCredentialRepository import AdminCredentialRepository
from app.user.domain.entities.AdminCredential import AdminCredential
from core.security.password import hash_password


async def get_or_bootstrap_admin_credential(
    repository: AdminCredentialRepository,
    bootstrap_password: str,
) -> AdminCredential:
    credential: AdminCredential | None = await repository.find()
    if credential is not None:
        return credential

    bootstrapped: AdminCredential = AdminCredential(
        password_hash=hash_password(password=bootstrap_password),
        updated_at=datetime.now(tz=UTC),
    )
    return await repository.save(credential=bootstrapped)
