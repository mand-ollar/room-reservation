from app.user.domain.exceptions.UserDomainError import UserDomainError


class InvalidCredentialsError(UserDomainError):
    def __init__(self) -> None:
        super().__init__("Invalid credentials")
