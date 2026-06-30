from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class ReservationNotFoundError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation not found")
