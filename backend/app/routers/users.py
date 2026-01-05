from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, require_admin
from app.core.config import settings
from app.schemas.user import UserOut, UpdateProfileRequest, AdminUserUpdate
from app.services.user_service import list_users, get_user, update_profile, admin_update_user, delete_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(req: UpdateProfileRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user = update_profile(db, current_user, req.new_email, req.new_password, settings.ADMIN_EMAIL)
    return user

# Admin CRUD de usuários (conta como entidade com CRUD)
@router.get("", response_model=list[UserOut], dependencies=[Depends(require_admin)])
def admin_list(db: Session = Depends(get_db)):
    return list_users(db)

@router.get("/{user_id}", response_model=UserOut, dependencies=[Depends(require_admin)])
def admin_get(user_id: int, db: Session = Depends(get_db)):
    return get_user(db, user_id)

@router.put("/{user_id}", response_model=UserOut, dependencies=[Depends(require_admin)])
def admin_update(user_id: int, req: AdminUserUpdate, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    return admin_update_user(
        db, user,
        name=req.name,
        email=req.email,
        role=req.role,
        admin_email_reserved=settings.ADMIN_EMAIL,
    )

@router.delete("/{user_id}", dependencies=[Depends(require_admin)])
def admin_delete(user_id: int, db: Session = Depends(get_db)):
    delete_user(db, user_id, settings.ADMIN_EMAIL)
    return {"message": "Usuário removido."}
