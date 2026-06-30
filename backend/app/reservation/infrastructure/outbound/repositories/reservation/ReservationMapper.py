from ulid import ULID

from app.reservation.domain.entities.Reservation import Reservation
from app.reservation.infrastructure.outbound.repositories.reservation.ReservationAlchemyEntity import (
    ReservationAlchemyEntity,
)


class ReservationMapper:
    @staticmethod
    def to_domain_entity(alchemy_entity: ReservationAlchemyEntity) -> Reservation:
        return Reservation(
            id=ULID.from_str(alchemy_entity.id),
            user_id=ULID.from_str(alchemy_entity.user_id),
            space_id=ULID.from_str(alchemy_entity.space_id),
            status=alchemy_entity.status,
            start_at=alchemy_entity.start_at,
            end_at=alchemy_entity.end_at,
            created_at=alchemy_entity.created_at,
            updated_at=alchemy_entity.updated_at,
        )

    @staticmethod
    def to_alchemy_entity(domain_entity: Reservation) -> ReservationAlchemyEntity:
        return ReservationAlchemyEntity(
            id=str(domain_entity.id),
            user_id=str(domain_entity.user_id),
            space_id=str(domain_entity.space_id),
            status=domain_entity.status,
            start_at=domain_entity.start_at,
            end_at=domain_entity.end_at,
            created_at=domain_entity.created_at,
            updated_at=domain_entity.updated_at,
        )
