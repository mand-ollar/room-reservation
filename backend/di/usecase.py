from typing import Annotated

from fastapi import Depends

from app.user.application.outbound.repositories.UserRepository import UserRepository
from app.user.application.use_cases.AdminLogin import AdminLoginUseCase
from app.user.application.use_cases.RefreshToken import RefreshTokenUseCase
from app.user.application.use_cases.UserLogin import UserLoginUseCase
from config import settings
from di.repository import get_user_repository


def get_user_login_use_case(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> UserLoginUseCase:
    return UserLoginUseCase(user_repository=user_repository)


def get_admin_login_use_case() -> AdminLoginUseCase:
    return AdminLoginUseCase(admin_password=settings.admin_password)


def get_refresh_token_use_case(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
) -> RefreshTokenUseCase:
    return RefreshTokenUseCase(user_repository=user_repository)
