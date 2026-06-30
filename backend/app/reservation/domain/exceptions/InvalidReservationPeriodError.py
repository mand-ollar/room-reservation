from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class InvalidReservationPeriodError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation start must be before end")
