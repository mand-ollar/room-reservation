from datetime import UTC, datetime

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.user.application.outbound.repositories.AdminCredentialRepository import AdminCredentialRepository
from app.user.domain.entities.AdminCredential import ADMIN_CREDENTIAL_ID, AdminCredential
from app.user.infrastructure.outbound.repositories.admin_credential.AdminCredentialAlchemyEntity import (
    AdminCredentialAlchemyEntity,
)
from app.user.infrastructure.outbound.repositories.admin_credential.AdminCredentialMapper import (
    AdminCredentialMapper,
)


class AlchemyAdminCredentialRepository(AdminCredentialRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def find(self) -> AdminCredential | None:
        stmt: Select[tuple[AdminCredentialAlchemyEntity]] = select(AdminCredentialAlchemyEntity).where(
            AdminCredentialAlchemyEntity.id == ADMIN_CREDENTIAL_ID,
        )
        entity: AdminCredentialAlchemyEntity | None = (await self.session.execute(stmt)).scalar_one_or_none()
        if entity is None:
            return None
        return AdminCredentialMapper.to_domain_entity(alchemy_entity=entity)

    async def save(self, credential: AdminCredential) -> AdminCredential:
        existing: AdminCredentialAlchemyEntity | None = await self.session.get(
            AdminCredentialAlchemyEntity,
            ADMIN_CREDENTIAL_ID,
        )
        if existing is None:
            alchemy_entity: AdminCredentialAlchemyEntity = AdminCredentialMapper.to_alchemy_entity(
                domain_entity=credential,
            )
            self.session.add(alchemy_entity)
        else:
            existing.password_hash = credential.password_hash
            existing.updated_at = credential.updated_at or datetime.now(tz=UTC)
            alchemy_entity = existing

        await self.session.flush()
        return AdminCredentialMapper.to_domain_entity(alchemy_entity=alchemy_entity)
