from enum import Enum


class AuthRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
