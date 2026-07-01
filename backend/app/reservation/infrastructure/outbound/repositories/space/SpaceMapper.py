from ulid import ULID

from app.reservation.domain.entities import Space
from app.reservation.infrastructure.outbound.repositories.space.SpaceAlchemyEntity import SpaceAlchemyEntity


class SpaceMapper:
    @staticmethod
    def to_domain_entity(alchemy_entity: SpaceAlchemyEntity) -> Space:
        return Space(
            id=ULID.from_str(alchemy_entity.id),
            building_id=ULID.from_str(alchemy_entity.building_id),
            name_ko=alchemy_entity.name_ko,
            name_en=alchemy_entity.name_en,
            floor=alchemy_entity.floor,
            created_at=alchemy_entity.created_at,
        )

    @staticmethod
    def to_alchemy_entity(domain_entity: Space) -> SpaceAlchemyEntity:
        return SpaceAlchemyEntity(
            id=str(domain_entity.id),
            building_id=str(domain_entity.building_id),
            name_ko=domain_entity.name_ko,
            name_en=domain_entity.name_en,
            floor=domain_entity.floor,
            created_at=domain_entity.created_at,
        )
