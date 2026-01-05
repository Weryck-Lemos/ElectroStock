from pydantic import BaseModel, Field, ConfigDict

class OrderItemIn(BaseModel):
    item_id: int = Field(gt=0)
    quantity: int = Field(gt=0)

class OrderCreate(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1)

class OrderItemOut(BaseModel):
    item_id: int
    quantity: int

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    status: str
    items: list[OrderItemOut]
