from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class ReservationAccessDeniedError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation does not belong to the current user")
