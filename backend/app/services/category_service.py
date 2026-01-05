from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.category import Category

def list_categories(db: Session) -> list[Category]:
    return list(db.scalars(select(Category)))

def get_category(db: Session, category_id: int) -> Category:
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(404, "Categoria não encontrada.")
    return cat

def create_category(db: Session, name: str) -> Category:
    existing = db.scalar(select(Category).where(Category.name == name))
    if existing:
        raise HTTPException(400, "Já existe categoria com esse nome.")
    cat = Category(name=name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

def update_category(db: Session, category_id: int, name: str) -> Category:
    cat = get_category(db, category_id)
    existing = db.scalar(select(Category).where(Category.name == name))
    if existing and existing.id != cat.id:
        raise HTTPException(400, "Já existe categoria com esse nome.")
    cat.name = name
    db.commit()
    db.refresh(cat)
    return cat

def delete_category(db: Session, category_id: int) -> None:
    cat = get_category(db, category_id)
    if cat.items:
        raise HTTPException(400, "Não é possível remover categoria com itens associados.")
    db.delete(cat)
    db.commit()
