from ulid import ULID

from app.reservation.domain.entities import Building
from app.reservation.infrastructure.outbound.repositories.building.BuildingAlchemyEntity import BuildingAlchemyEntity


class BuildingMapper:
    @staticmethod
    def to_domain_entity(alchemy_entity: BuildingAlchemyEntity) -> Building:
        return Building(
            id=ULID.from_str(alchemy_entity.id),
            name_ko=alchemy_entity.name_ko,
            name_en=alchemy_entity.name_en,
            created_at=alchemy_entity.created_at,
        )

    @staticmethod
    def to_alchemy_entity(domain_entity: Building) -> BuildingAlchemyEntity:
        return BuildingAlchemyEntity(
            id=str(domain_entity.id),
            name_ko=domain_entity.name_ko,
            name_en=domain_entity.name_en,
            created_at=domain_entity.created_at,
        )
