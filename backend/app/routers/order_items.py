from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_admin
from app.schemas.order_item import OrderItemOutFull, OrderItemUpdate
from app.services.order_item_service import list_order_items, get_order_item, update_order_item_quantity, delete_order_item

router = APIRouter(prefix="/order-items", tags=["order-items"], dependencies=[Depends(require_admin)])

@router.get("", response_model=list[OrderItemOutFull])
def list_all(db: Session = Depends(get_db)):
    return list_order_items(db)

@router.get("/{order_item_id}", response_model=OrderItemOutFull)
def detail(order_item_id: int, db: Session = Depends(get_db)):
    return get_order_item(db, order_item_id)

@router.put("/{order_item_id}", response_model=OrderItemOutFull)
def update(order_item_id: int, req: OrderItemUpdate, db: Session = Depends(get_db)):
    return update_order_item_quantity(db, order_item_id, req.quantity)

@router.delete("/{order_item_id}")
def delete(order_item_id: int, db: Session = Depends(get_db)):
    delete_order_item(db, order_item_id)
    return {"message": "OrderItem removido e estoque restaurado (se pedido pendente)."}
