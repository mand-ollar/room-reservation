from sqlalchemy import Select, delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from ulid import ULID

from app.reservation.application.outbound.repositories.BuildingRepository import BuildingRepository
from app.reservation.domain.entities import Building
from app.reservation.domain.exceptions import DuplicateBuildingNameError
from app.reservation.infrastructure.outbound.repositories.building.BuildingAlchemyEntity import BuildingAlchemyEntity
from app.reservation.infrastructure.outbound.repositories.building.BuildingMapper import BuildingMapper


class AlchemyBuildingRepository(BuildingRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def find_by_id(self, id: ULID) -> Building | None:
        stmt: Select[tuple[BuildingAlchemyEntity]] = select(BuildingAlchemyEntity).where(
            BuildingAlchemyEntity.id == str(id)
        )
        entity: BuildingAlchemyEntity | None = (await self.session.execute(stmt)).scalar_one_or_none()
        if entity is None:
            return None
        return BuildingMapper.to_domain_entity(alchemy_entity=entity)

    async def find_by_locale_name(self, locale: str, name: str) -> Building | None:
        stmt: Select[tuple[BuildingAlchemyEntity]] = select(BuildingAlchemyEntity).where(
            BuildingAlchemyEntity.names[locale].as_string() == name
        )
        entity: BuildingAlchemyEntity | None = (await self.session.execute(stmt)).scalar_one_or_none()
        if entity is None:
            return None
        return BuildingMapper.to_domain_entity(alchemy_entity=entity)

    async def find_all(self) -> list[Building]:
        stmt: Select[tuple[BuildingAlchemyEntity]] = select(BuildingAlchemyEntity).order_by(
            BuildingAlchemyEntity.names["ko"].as_string()
        )
        entities: list[BuildingAlchemyEntity] = list((await self.session.execute(stmt)).scalars().all())
        return [BuildingMapper.to_domain_entity(alchemy_entity=entity) for entity in entities]

    async def save(self, entity: Building) -> Building:
        alchemy_entity: BuildingAlchemyEntity = BuildingMapper.to_alchemy_entity(domain_entity=entity)
        self.session.add(alchemy_entity)
        await self.session.flush()
        return BuildingMapper.to_domain_entity(alchemy_entity=alchemy_entity)

    async def update(self, entity: Building) -> Building:
        stmt = (
            update(BuildingAlchemyEntity)
            .where(BuildingAlchemyEntity.id == str(entity.id))
            .values(names=entity.names.to_dict())
        )
        try:
            await self.session.execute(stmt)
            await self.session.flush()
        except IntegrityError as error:
            raise DuplicateBuildingNameError() from error
        return entity

    async def delete(self, id: ULID) -> None:
        await self.session.execute(delete(BuildingAlchemyEntity).where(BuildingAlchemyEntity.id == str(id)))
