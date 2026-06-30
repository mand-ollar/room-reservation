from ulid import ULID

from app.reservation.domain.entities import Space
from app.reservation.infrastructure.outbound.repositories.space.SpaceAlchemyEntity import SpaceAlchemyEntity


class SpaceMapper:
    @staticmethod
    def to_domain_entity(alchemy_entity: SpaceAlchemyEntity) -> Space:
        return Space(
            id=ULID.from_str(alchemy_entity.id),
            building_id=ULID.from_str(alchemy_entity.building_id),
            name=alchemy_entity.name,
            created_at=alchemy_entity.created_at,
        )

    @staticmethod
    def to_alchemy_entity(domain_entity: Space) -> SpaceAlchemyEntity:
        return SpaceAlchemyEntity(
            id=str(domain_entity.id),
            building_id=str(domain_entity.building_id),
            name=domain_entity.name,
            created_at=domain_entity.created_at,
        )
