from dataclasses import dataclass
from datetime import datetime

ADMIN_CREDENTIAL_ID: str = "admin"


@dataclass
class AdminCredential:
    password_hash: str
    updated_at: datetime
