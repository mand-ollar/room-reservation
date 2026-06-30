from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class BuildingInUseError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Building has spaces and cannot be deleted")
