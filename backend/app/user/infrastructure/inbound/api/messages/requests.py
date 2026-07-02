from pydantic import BaseModel


class UserLoginRequest(BaseModel):
    name: str
    phone: str


class AdminLoginRequest(BaseModel):
    password: str


class ChangeAdminPasswordRequest(BaseModel):
    current_password: str
    new_password: str


class RefreshRequest(BaseModel):
    refresh_token: str
