from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class DuplicateSpaceNameError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Space name already exists in this building")
