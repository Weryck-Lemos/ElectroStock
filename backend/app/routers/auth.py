from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.security import create_access_token
from app.schemas.auth import RegisterRequest, LoginJSONRequest, TokenResponse
from app.schemas.user import UserOut
from app.services.user_service import create_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user = create_user(db, name=req.name, email=req.email, password=req.password, role="user")
    return user

# Login compatível com Swagger "Authorize" (form-data)
@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, email=form.username, password=form.password)
    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token)

# Login por JSON (igual seu estilo antigo)
@router.post("/login-json", response_model=TokenResponse)
def login_json(req: LoginJSONRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, email=req.email, password=req.password)
    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token)
