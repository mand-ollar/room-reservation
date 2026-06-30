from ulid import ULID

from app.user.domain.entities.User import User
from app.user.infrastructure.outbound.repositories.user.UserAlchemyEntity import UserAlchemyEntity


class UserMapper:
    @staticmethod
    def to_domain_entity(alchemy_entity: UserAlchemyEntity) -> User:
        return User(
            id=ULID.from_str(alchemy_entity.id),
            name=alchemy_entity.name,
            phone=alchemy_entity.phone,
            created_at=alchemy_entity.created_at,
        )

    @staticmethod
    def to_alchemy_entity(domain_entity: User) -> UserAlchemyEntity:
        return UserAlchemyEntity(
            id=str(domain_entity.id),
            name=domain_entity.name,
            phone=domain_entity.phone,
            created_at=domain_entity.created_at,
        )
