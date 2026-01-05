from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_admin
from app.schemas.item import ItemCreate, ItemUpdate, ItemOut
from app.services.item_service import list_items, get_item, create_item, update_item, delete_item

router = APIRouter(prefix="/items", tags=["items"])

@router.get("", response_model=list[ItemOut])
def get_items(db: Session = Depends(get_db)):
    return list_items(db)

@router.get("/{item_id}", response_model=ItemOut)
def get_item_by_id(item_id: int, db: Session = Depends(get_db)):
    return get_item(db, item_id)

@router.post("", response_model=ItemOut, dependencies=[Depends(require_admin)])
def create(req: ItemCreate, db: Session = Depends(get_db)):
    return create_item(db, name=req.name, description=req.description, stock=req.stock, category_id=req.category_id)

@router.put("/{item_id}", response_model=ItemOut, dependencies=[Depends(require_admin)])
def update(item_id: int, req: ItemUpdate, db: Session = Depends(get_db)):
    return update_item(db, item_id, name=req.name, description=req.description, stock=req.stock, category_id=req.category_id)

@router.delete("/{item_id}", dependencies=[Depends(require_admin)])
def delete(item_id: int, db: Session = Depends(get_db)):
    delete_item(db, item_id)
    return {"message": "Item removido."}
