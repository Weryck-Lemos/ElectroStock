from pydantic import BaseModel, Field, ConfigDict

class ItemCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str | None = None
    stock: int = Field(ge=0)
    category_id: int = Field(gt=0)

class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    description: str | None = None
    stock: int | None = Field(default=None, ge=0)
    category_id: int | None = Field(default=None, gt=0)

class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str | None
    stock: int
    category_id: int
