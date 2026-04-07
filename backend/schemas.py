from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str | None = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class VerifyEmail(BaseModel):
    email: EmailStr
    code: str


class SendCodeRequest(BaseModel):
    email: EmailStr


class MessageResponse(BaseModel):
    message: str
    code: str | None = None