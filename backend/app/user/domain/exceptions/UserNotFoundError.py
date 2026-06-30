from app.user.domain.exceptions.UserDomainError import UserDomainError


class UserNotFoundError(UserDomainError):
    def __init__(self) -> None:
        super().__init__("User not found")
