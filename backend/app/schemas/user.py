from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    role: str

class UpdateProfileRequest(BaseModel):
    new_email: EmailStr | None = None
    new_password: str | None = Field(default=None, min_length=6, max_length=72)

class AdminUserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None
    role: str | None = Field(default=None, pattern="^(user|admin)$")
