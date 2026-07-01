from ulid import ULID

from app.reservation.domain.entities import Building
from app.reservation.domain.value_objects import LocalizedNames
from app.reservation.infrastructure.outbound.repositories.building.BuildingAlchemyEntity import BuildingAlchemyEntity


class BuildingMapper:
    @staticmethod
    def to_domain_entity(alchemy_entity: BuildingAlchemyEntity) -> Building:
        return Building(
            id=ULID.from_str(alchemy_entity.id),
            names=LocalizedNames.from_dict(data=alchemy_entity.names),
            created_at=alchemy_entity.created_at,
        )

    @staticmethod
    def to_alchemy_entity(domain_entity: Building) -> BuildingAlchemyEntity:
        return BuildingAlchemyEntity(
            id=str(domain_entity.id),
            names=domain_entity.names.to_dict(),
            created_at=domain_entity.created_at,
        )
