from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.item import Item
from app.models.category import Category

def list_items(db: Session) -> list[Item]:
    return list(db.scalars(select(Item)))

def get_item(db: Session, item_id: int) -> Item:
    item = db.get(Item, item_id)
    if not item:
        raise HTTPException(404, "Item não encontrado.")
    return item

def create_item(db: Session, *, name: str, description: str | None, stock: int, category_id: int) -> Item:
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(400, "Categoria inválida.")
    item = Item(name=name, description=description, stock=stock, category_id=category_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def update_item(db: Session, item_id: int, *, name: str | None, description: str | None, stock: int | None, category_id: int | None) -> Item:
    item = get_item(db, item_id)
    if category_id is not None:
        cat = db.get(Category, category_id)
        if not cat:
            raise HTTPException(400, "Categoria inválida.")
        item.category_id = category_id
    if name is not None:
        item.name = name
    if description is not None:
        item.description = description
    if stock is not None:
        if stock < 0:
            raise HTTPException(400, "Estoque inválido.")
        item.stock = stock
    db.commit()
    db.refresh(item)
    return item

def delete_item(db: Session, item_id: int) -> None:
    item = get_item(db, item_id)
    if item.order_items:
        raise HTTPException(400, "Não é possível remover item que já apareceu em pedidos.")
    db.delete(item)
    db.commit()
