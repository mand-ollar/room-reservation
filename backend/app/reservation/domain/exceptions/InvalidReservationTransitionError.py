from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class InvalidReservationTransitionError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation status transition is not allowed")
