from pydantic import BaseModel


class UserLoginRequest(BaseModel):
    name: str
    phone: str


class AdminLoginRequest(BaseModel):
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str
