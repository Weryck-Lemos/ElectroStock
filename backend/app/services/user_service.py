from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.core.security import hash_password, verify_password

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))

def get_user(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Usuário não encontrado.")
    return user

def list_users(db: Session) -> list[User]:
    return list(db.scalars(select(User)))

def create_user(db: Session, name: str, email: str, password: str, role: str = "user") -> User:
    if get_user_by_email(db, email):
        raise HTTPException(400, "Esse email já está registrado.")
    user = User(name=name, email=email, password_hash=hash_password(password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(401, "Email ou senha inválidos.")
    return user

def update_profile(db: Session, user: User, new_email: str | None, new_password: str | None, admin_email_reserved: str):
    if new_email:
        if new_email == admin_email_reserved and user.email != admin_email_reserved:
            raise HTTPException(400, "Email reservado para o administrador.")
        if new_email != user.email and get_user_by_email(db, new_email):
            raise HTTPException(400, "Já existe usuário com este email.")
        user.email = new_email

    if new_password:
        user.password_hash = hash_password(new_password)

    db.commit()
    db.refresh(user)
    return user

def admin_update_user(db: Session, user: User, *, name: str | None, email: str | None, role: str | None, admin_email_reserved: str):
    if email:
        if email == admin_email_reserved and user.email != admin_email_reserved:
            raise HTTPException(400, "Email reservado para o administrador.")
        existing = get_user_by_email(db, email)
        if existing and existing.id != user.id:
            raise HTTPException(400, "Já existe usuário com este email.")
        user.email = email

    if name:
        user.name = name

    if role:
        user.role = role

    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int, admin_email_reserved: str):
    user = get_user(db, user_id)
    if user.email == admin_email_reserved:
        raise HTTPException(400, "Não é permitido remover o administrador principal.")
    db.delete(user)
    db.commit()
