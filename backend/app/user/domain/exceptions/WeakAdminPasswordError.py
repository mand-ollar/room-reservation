from app.user.domain.exceptions.UserDomainError import UserDomainError


class WeakAdminPasswordError(UserDomainError):
    def __init__(self) -> None:
        super().__init__("Admin password does not meet requirements")
