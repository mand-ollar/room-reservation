from sqlalchemy import Select, delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from ulid import ULID

from app.reservation.application.outbound.repositories.SpaceRepository import SpaceRepository
from app.reservation.domain.entities import Space
from app.reservation.infrastructure.outbound.repositories.space.SpaceAlchemyEntity import SpaceAlchemyEntity
from app.reservation.infrastructure.outbound.repositories.space.SpaceMapper import SpaceMapper


class AlchemySpaceRepository(SpaceRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def find_by_id(self, id: ULID) -> Space | None:
        stmt: Select[tuple[SpaceAlchemyEntity]] = select(SpaceAlchemyEntity).where(SpaceAlchemyEntity.id == str(id))
        entity: SpaceAlchemyEntity | None = (await self.session.execute(stmt)).scalar_one_or_none()
        if entity is None:
            return None
        return SpaceMapper.to_domain_entity(alchemy_entity=entity)

    async def find_all(self) -> list[Space]:
        stmt: Select[tuple[SpaceAlchemyEntity]] = select(SpaceAlchemyEntity).order_by(SpaceAlchemyEntity.name)
        entities: list[SpaceAlchemyEntity] = list((await self.session.execute(stmt)).scalars().all())
        return [SpaceMapper.to_domain_entity(alchemy_entity=entity) for entity in entities]

    async def find_by_building_id(self, building_id: ULID) -> list[Space]:
        stmt: Select[tuple[SpaceAlchemyEntity]] = (
            select(SpaceAlchemyEntity)
            .where(SpaceAlchemyEntity.building_id == str(building_id))
            .order_by(SpaceAlchemyEntity.name)
        )
        entities: list[SpaceAlchemyEntity] = list((await self.session.execute(stmt)).scalars().all())
        return [SpaceMapper.to_domain_entity(alchemy_entity=entity) for entity in entities]

    async def find_by_building_id_and_name(self, building_id: ULID, name: str) -> Space | None:
        stmt: Select[tuple[SpaceAlchemyEntity]] = select(SpaceAlchemyEntity).where(
            SpaceAlchemyEntity.building_id == str(building_id),
            SpaceAlchemyEntity.name == name,
        )
        entity: SpaceAlchemyEntity | None = (await self.session.execute(stmt)).scalar_one_or_none()
        if entity is None:
            return None
        return SpaceMapper.to_domain_entity(alchemy_entity=entity)

    async def save(self, entity: Space) -> Space:
        alchemy_entity: SpaceAlchemyEntity = SpaceMapper.to_alchemy_entity(domain_entity=entity)
        self.session.add(alchemy_entity)
        await self.session.flush()
        return SpaceMapper.to_domain_entity(alchemy_entity=alchemy_entity)

    async def delete(self, id: ULID) -> None:
        await self.session.execute(delete(SpaceAlchemyEntity).where(SpaceAlchemyEntity.id == str(id)))
