from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.item import Item

def get_order(db: Session, order_id: int) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Pedido não encontrado.")
    return order

def list_orders_all(db: Session) -> list[Order]:
    return list(db.scalars(select(Order)))

def list_orders_for_user(db: Session, user_id: int) -> list[Order]:
    return list(db.scalars(select(Order).where(Order.user_id == user_id)))

def create_order(db: Session, user_id: int, items: list[dict]) -> Order:
    if not items:
        raise HTTPException(400, "O pedido precisa ter ao menos 1 item.")

    order = Order(user_id=user_id, status="pending")
    db.add(order)
    db.flush()  # cria order.id sem commit

    # valida e debita estoque
    for oi in items:
        item = db.get(Item, oi["item_id"])
        if not item:
            raise HTTPException(400, f"Item {oi['item_id']} não encontrado.")
        if oi["quantity"] <= 0:
            raise HTTPException(400, "Quantidade inválida.")
        if oi["quantity"] > item.stock:
            raise HTTPException(400, f"Estoque insuficiente para '{item.name}'.")
        item.stock -= oi["quantity"]
        db.add(OrderItem(order_id=order.id, item_id=item.id, quantity=oi["quantity"]))

    db.commit()
    db.refresh(order)
    return order

def set_status(db: Session, order_id: int, new_status: str, only_if: str | None = None, restore_stock_on_reject: bool = True) -> Order:
    order = get_order(db, order_id)
    if only_if and order.status != only_if:
        raise HTTPException(400, f"Só é possível mudar status quando estiver '{only_if}'.")

    # Se rejeitar e quiser restaurar estoque
    if new_status == "rejected" and restore_stock_on_reject:
        if order.status != "pending":
            raise HTTPException(400, "Só é possível rejeitar pedidos pendentes.")
        for oi in order.items:
            item = db.get(Item, oi.item_id)
            if item:
                item.stock += oi.quantity

    order.status = new_status
    db.commit()
    db.refresh(order)
    return order

def delete_order(db: Session, order_id: int):
    order = get_order(db, order_id)
    if order.status != "pending":
        raise HTTPException(400, "Só é possível excluir pedidos pendentes.")

    # restaurar estoque
    for oi in order.items:
        item = db.get(Item, oi.item_id)
        if item:
            item.stock += oi.quantity

    db.delete(order)
    db.commit()
