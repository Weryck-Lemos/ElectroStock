from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, require_admin
from app.schemas.order import OrderCreate, OrderOut, OrderItemOut
from app.services.order_service import (
    create_order, list_orders_all, list_orders_for_user, get_order, set_status, delete_order
)

router = APIRouter(prefix="/orders", tags=["orders"])

def to_order_out(order) -> OrderOut:
    return OrderOut(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        items=[OrderItemOut(item_id=oi.item_id, quantity=oi.quantity) for oi in order.items],
    )

@router.post("", response_model=OrderOut)
def create(req: OrderCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = create_order(db, user_id=user.id, items=[i.model_dump() for i in req.items])
    order = get_order(db, order.id)
    return to_order_out(order)

@router.get("/me", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = list_orders_for_user(db, user.id)
    return [to_order_out(o) for o in orders]

@router.get("", response_model=list[OrderOut], dependencies=[Depends(require_admin)])
def list_all(db: Session = Depends(get_db)):
    orders = list_orders_all(db)
    return [to_order_out(o) for o in orders]

@router.get("/{order_id}", response_model=OrderOut)
def detail(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = get_order(db, order_id)
    if user.role != "admin" and order.user_id != user.id:
        # evitar vazar pedido de outros usuários
        from fastapi import HTTPException
        raise HTTPException(403, "Você não pode acessar este pedido.")
    return to_order_out(order)

@router.delete("/{order_id}", dependencies=[Depends(get_current_user)])
def delete_pending(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = get_order(db, order_id)
    if user.role != "admin" and order.user_id != user.id:
        from fastapi import HTTPException
        raise HTTPException(403, "Você não pode excluir este pedido.")
    delete_order(db, order_id)
    return {"message": "Pedido excluído (pendente) e estoque restaurado."}

@router.post("/{order_id}/approve", response_model=OrderOut, dependencies=[Depends(require_admin)])
def approve(order_id: int, db: Session = Depends(get_db)):
    o = set_status(db, order_id, "approved", only_if="pending")
    o = get_order(db, o.id)
    return to_order_out(o)

@router.post("/{order_id}/reject", response_model=OrderOut, dependencies=[Depends(require_admin)])
def reject(order_id: int, db: Session = Depends(get_db)):
    o = set_status(db, order_id, "rejected", only_if="pending", restore_stock_on_reject=True)
    o = get_order(db, o.id)
    return to_order_out(o)

@router.post("/{order_id}/finish", response_model=OrderOut, dependencies=[Depends(require_admin)])
def finish(order_id: int, db: Session = Depends(get_db)):
    o = set_status(db, order_id, "finished", only_if="approved")
    o = get_order(db, o.id)
    return to_order_out(o)
