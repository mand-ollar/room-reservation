from app.user.domain.entities.AdminCredential import AdminCredential
from app.user.infrastructure.outbound.repositories.admin_credential.AdminCredentialAlchemyEntity import (
    AdminCredentialAlchemyEntity,
)


class AdminCredentialMapper:
    @staticmethod
    def to_domain_entity(alchemy_entity: AdminCredentialAlchemyEntity) -> AdminCredential:
        return AdminCredential(
            password_hash=alchemy_entity.password_hash,
            updated_at=alchemy_entity.updated_at,
        )

    @staticmethod
    def to_alchemy_entity(domain_entity: AdminCredential) -> AdminCredentialAlchemyEntity:
        from app.user.domain.entities.AdminCredential import ADMIN_CREDENTIAL_ID

        return AdminCredentialAlchemyEntity(
            id=ADMIN_CREDENTIAL_ID,
            password_hash=domain_entity.password_hash,
            updated_at=domain_entity.updated_at,
        )
