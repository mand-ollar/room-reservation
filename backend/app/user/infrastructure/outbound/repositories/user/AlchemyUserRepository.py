from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from ulid import ULID

from app.user.application.outbound.repositories.UserRepository import UserRepository
from app.user.domain.entities import User
from app.user.infrastructure.outbound.repositories.user.UserAlchemyEntity import UserAlchemyEntity
from app.user.infrastructure.outbound.repositories.user.UserMapper import UserMapper


class AlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def find_by_id(self, id: ULID) -> User | None:
        stmt: Select[tuple[UserAlchemyEntity]] = select(UserAlchemyEntity).where(UserAlchemyEntity.id == str(id))
        entity: UserAlchemyEntity | None = (await self.session.execute(stmt)).scalar_one_or_none()
        if entity is None:
            return None
        return UserMapper.to_domain_entity(alchemy_entity=entity)

    async def find_by_ids(self, ids: list[ULID]) -> list[User]:
        if not ids:
            return []
        id_strings: list[str] = [str(user_id) for user_id in ids]
        stmt: Select[tuple[UserAlchemyEntity]] = select(UserAlchemyEntity).where(UserAlchemyEntity.id.in_(id_strings))
        entities: list[UserAlchemyEntity] = list((await self.session.execute(stmt)).scalars().all())
        return [UserMapper.to_domain_entity(alchemy_entity=entity) for entity in entities]

    async def find_by_phone(self, phone: str) -> User | None:
        stmt: Select[tuple[UserAlchemyEntity]] = select(UserAlchemyEntity).where(UserAlchemyEntity.phone == phone)
        entity: UserAlchemyEntity | None = (await self.session.execute(stmt)).scalar_one_or_none()
        if entity is None:
            return None
        return UserMapper.to_domain_entity(alchemy_entity=entity)

    async def save(self, entity: User) -> User:
        alchemy_entity: UserAlchemyEntity = UserMapper.to_alchemy_entity(domain_entity=entity)
        self.session.add(alchemy_entity)
        await self.session.flush()
        return UserMapper.to_domain_entity(alchemy_entity=alchemy_entity)
