from datetime import datetime

from pydantic import ConfigDict, EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    username: str = Field(min_length=1)
    full_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserPublic(SQLModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
