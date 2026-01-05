from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.order_item import OrderItem
from app.models.order import Order
from app.models.item import Item

def list_order_items(db: Session) -> list[OrderItem]:
    return list(db.scalars(select(OrderItem)))

def get_order_item(db: Session, order_item_id: int) -> OrderItem:
    oi = db.get(OrderItem, order_item_id)
    if not oi:
        raise HTTPException(404, "OrderItem não encontrado.")
    return oi

def update_order_item_quantity(db: Session, order_item_id: int, new_quantity: int) -> OrderItem:
    oi = get_order_item(db, order_item_id)
    order = db.get(Order, oi.order_id)
    if not order:
        raise HTTPException(400, "Pedido inválido.")
    if order.status != "pending":
        raise HTTPException(400, "Só é possível alterar itens de pedidos pendentes.")

    if new_quantity <= 0:
        raise HTTPException(400, "Quantidade inválida.")

    item = db.get(Item, oi.item_id)
    if not item:
        raise HTTPException(400, "Item inválido.")

    # ajustar estoque pela diferença
    diff = new_quantity - oi.quantity
    if diff > 0:
        if diff > item.stock:
            raise HTTPException(400, "Estoque insuficiente para aumentar a quantidade.")
        item.stock -= diff
    elif diff < 0:
        item.stock += (-diff)

    oi.quantity = new_quantity
    db.commit()
    db.refresh(oi)
    return oi

def delete_order_item(db: Session, order_item_id: int) -> None:
    oi = get_order_item(db, order_item_id)
    order = db.get(Order, oi.order_id)
    if not order or order.status != "pending":
        raise HTTPException(400, "Só é possível remover itens de pedidos pendentes.")

    item = db.get(Item, oi.item_id)
    if item:
        item.stock += oi.quantity

    db.delete(oi)
    db.commit()
