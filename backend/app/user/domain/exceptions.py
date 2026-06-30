class UserDomainError(Exception):
    pass


class InvalidCredentialsError(UserDomainError):
    def __init__(self) -> None:
        super().__init__("Invalid credentials")


class UserNotFoundError(UserDomainError):
    def __init__(self) -> None:
        super().__init__("User not found")
