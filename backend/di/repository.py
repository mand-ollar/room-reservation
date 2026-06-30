from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.user.application.outbound.repositories.UserRepository import UserRepository
from app.user.infrastructure.outbound.repositories.user.AlchemyUserRepository import (
    AlchemyUserRepository,
)
from core.db.session import get_session


def get_user_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> UserRepository:
    return AlchemyUserRepository(session=session)
