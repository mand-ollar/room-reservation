from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class SpaceNotFoundError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Space not found")
