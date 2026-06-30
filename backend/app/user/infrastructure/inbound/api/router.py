from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.user.application.use_cases.AdminLogin import AdminLoginCommand, AdminLoginUseCase
from app.user.application.use_cases.RefreshToken import RefreshTokenUseCase
from app.user.application.use_cases.token_pair import TokenPair
from app.user.application.use_cases.UserLogin import UserLoginCommand, UserLoginUseCase
from app.user.domain.entities import User
from app.user.domain.exceptions import InvalidCredentialsError, UserNotFoundError
from app.user.infrastructure.inbound.api.messages.requests import (
    AdminLoginRequest,
    RefreshRequest,
    UserLoginRequest,
)
from app.user.infrastructure.inbound.api.messages.responses import TokenResponse, UserResponse
from di.auth import get_current_user
from di.usecase import (
    get_admin_login_use_case,
    get_refresh_token_use_case,
    get_user_login_use_case,
)

router: APIRouter = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    request: UserLoginRequest,
    use_case: Annotated[UserLoginUseCase, Depends(get_user_login_use_case)],
):
    try:
        tokens: TokenPair = await use_case.execute(command=UserLoginCommand(name=request.name, phone=request.phone))
    except InvalidCredentialsError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    return TokenResponse.from_pair(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
    )


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(
    request: AdminLoginRequest,
    use_case: Annotated[AdminLoginUseCase, Depends(get_admin_login_use_case)],
):
    try:
        tokens: TokenPair = await use_case.execute(command=AdminLoginCommand(password=request.password))
    except InvalidCredentialsError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    return TokenResponse.from_pair(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: RefreshRequest,
    use_case: Annotated[RefreshTokenUseCase, Depends(get_refresh_token_use_case)],
):
    try:
        tokens: TokenPair = await use_case.execute(refresh_token=request.refresh_token)
    except (InvalidCredentialsError, UserNotFoundError) as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error
    return TokenResponse.from_pair(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return UserResponse.from_entity(user=current_user)
