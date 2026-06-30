from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class SpaceInUseError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Space has reservations and cannot be deleted")
