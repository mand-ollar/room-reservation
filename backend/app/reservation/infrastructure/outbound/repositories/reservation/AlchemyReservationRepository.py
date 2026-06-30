from sqlalchemy import Select, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from ulid import ULID

from app.reservation.application.outbound.repositories.ReservationRepository import ReservationRepository
from app.reservation.domain.entities.Reservation import Reservation
from app.reservation.domain.exceptions import ReservationConflictError
from app.reservation.domain.value_objects.ReservationStatus import ReservationStatus
from app.reservation.infrastructure.outbound.repositories.reservation.ReservationAlchemyEntity import (
    ReservationAlchemyEntity,
)
from app.reservation.infrastructure.outbound.repositories.reservation.ReservationMapper import ReservationMapper


class AlchemyReservationRepository(ReservationRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def find_by_id(self, id: ULID) -> Reservation | None:
        stmt: Select[tuple[ReservationAlchemyEntity]] = select(ReservationAlchemyEntity).where(
            ReservationAlchemyEntity.id == str(id)
        )
        entity: ReservationAlchemyEntity | None = (await self.session.execute(stmt)).scalar_one_or_none()
        if entity is None:
            return None
        return ReservationMapper.to_domain_entity(alchemy_entity=entity)

    async def find_all(
        self,
        status: ReservationStatus | None = None,
        space_id: ULID | None = None,
    ) -> list[Reservation]:
        stmt: Select[tuple[ReservationAlchemyEntity]] = select(ReservationAlchemyEntity)
        if status is not None:
            stmt = stmt.where(ReservationAlchemyEntity.status == status)
        if space_id is not None:
            stmt = stmt.where(ReservationAlchemyEntity.space_id == str(space_id))
        stmt = stmt.order_by(ReservationAlchemyEntity.start_at)
        entities: list[ReservationAlchemyEntity] = list((await self.session.execute(stmt)).scalars().all())
        return [ReservationMapper.to_domain_entity(alchemy_entity=entity) for entity in entities]

    async def find_by_user_id(self, user_id: ULID) -> list[Reservation]:
        stmt: Select[tuple[ReservationAlchemyEntity]] = (
            select(ReservationAlchemyEntity)
            .where(ReservationAlchemyEntity.user_id == str(user_id))
            .order_by(ReservationAlchemyEntity.start_at)
        )
        entities: list[ReservationAlchemyEntity] = list((await self.session.execute(stmt)).scalars().all())
        return [ReservationMapper.to_domain_entity(alchemy_entity=entity) for entity in entities]

    async def save(self, entity: Reservation) -> Reservation:
        alchemy_entity: ReservationAlchemyEntity = ReservationMapper.to_alchemy_entity(domain_entity=entity)
        self.session.add(alchemy_entity)
        try:
            await self.session.flush()
        except IntegrityError as error:
            raise ReservationConflictError() from error
        return ReservationMapper.to_domain_entity(alchemy_entity=alchemy_entity)

    async def update(self, entity: Reservation) -> Reservation:
        stmt = (
            update(ReservationAlchemyEntity)
            .where(ReservationAlchemyEntity.id == str(entity.id))
            .values(
                status=entity.status,
                start_at=entity.start_at,
                end_at=entity.end_at,
                updated_at=entity.updated_at,
            )
        )
        try:
            await self.session.execute(stmt)
            await self.session.flush()
        except IntegrityError as error:
            raise ReservationConflictError() from error
        return entity
