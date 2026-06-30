class ReservationDomainError(Exception):
    pass


class BuildingNotFoundError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Building not found")


class DuplicateBuildingNameError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Building name already exists")


class BuildingInUseError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Building has spaces and cannot be deleted")


class SpaceNotFoundError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Space not found")


class DuplicateSpaceNameError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Space name already exists in this building")


class SpaceInUseError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Space has reservations and cannot be deleted")


class ReservationNotFoundError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation not found")


class ReservationConflictError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation time overlaps an existing reservation for this space")


class InvalidReservationPeriodError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation start must be before end")


class InvalidReservationTransitionError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation status transition is not allowed")


class ReservationAccessDeniedError(ReservationDomainError):
    def __init__(self) -> None:
        super().__init__("Reservation does not belong to the current user")
