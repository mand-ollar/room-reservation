from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.user.domain.entities.AdminCredential import ADMIN_CREDENTIAL_ID
from core.db.session import Base


class AdminCredentialAlchemyEntity(Base):
    __tablename__ = "admin_credentials"

    id: Mapped[str] = mapped_column(String(length=26), primary_key=True, default=ADMIN_CREDENTIAL_ID)
    password_hash: Mapped[str] = mapped_column(String(length=255), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
