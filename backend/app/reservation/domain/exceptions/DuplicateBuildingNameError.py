from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class DuplicateBuildingNameError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Building name already exists")
