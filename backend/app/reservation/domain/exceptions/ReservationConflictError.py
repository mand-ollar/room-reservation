from app.reservation.domain.exceptions.ReservationDomainError import ReservationDomainError


class ReservationConflictError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation time overlaps an existing reservation for this space")
