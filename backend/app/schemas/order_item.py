from pydantic import BaseModel, Field, ConfigDict

class OrderItemOutFull(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_id: int
    item_id: int
    quantity: int

class OrderItemUpdate(BaseModel):
    quantity: int = Field(gt=0)
