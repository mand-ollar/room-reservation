from pydantic import BaseModel

from app.user.application.outbound.repositories.UserRepository import UserRepository
from app.user.application.use_cases.token_pair import TokenPair
from app.user.domain.entities.User import User
from app.user.domain.exceptions import InvalidCredentialsError
from core.security.jwt import create_access_token, create_refresh_token
from core.security.roles import AuthRole


class UserLoginCommand(BaseModel):
    name: str
    phone: str


class UserLoginUseCase:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository: UserRepository = user_repository

    async def execute(self, command: UserLoginCommand) -> TokenPair:
        user: User | None = await self.user_repository.find_by_phone(phone=command.phone)
        if user is None:
            user = await self.user_repository.save(entity=User.create(name=command.name, phone=command.phone))
        elif user.name != command.name:
            raise InvalidCredentialsError()

        return TokenPair(
            access_token=create_access_token(subject=str(user.id), role=AuthRole.USER),
            refresh_token=create_refresh_token(subject=str(user.id), role=AuthRole.USER),
        )
