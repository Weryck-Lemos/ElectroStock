from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_admin
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.services.category_service import list_categories, get_category, create_category, update_category, delete_category

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("", response_model=list[CategoryOut])
def list_all(db: Session = Depends(get_db)):
    return list_categories(db)

@router.get("/{category_id}", response_model=CategoryOut)
def get_one(category_id: int, db: Session = Depends(get_db)):
    return get_category(db, category_id)

@router.post("", response_model=CategoryOut, dependencies=[Depends(require_admin)])
def create(req: CategoryCreate, db: Session = Depends(get_db)):
    return create_category(db, req.name)

@router.put("/{category_id}", response_model=CategoryOut, dependencies=[Depends(require_admin)])
def update(category_id: int, req: CategoryUpdate, db: Session = Depends(get_db)):
    return update_category(db, category_id, req.name)

@router.delete("/{category_id}", dependencies=[Depends(require_admin)])
def delete(category_id: int, db: Session = Depends(get_db)):
    delete_category(db, category_id)
    return {"message": "Categoria removida."}
