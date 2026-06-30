from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class BuildingNotFoundError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Building not found")
