from pydantic import BaseModel, Field, ConfigDict

class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)

class CategoryUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=120)

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
