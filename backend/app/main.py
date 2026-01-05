from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.core.config import settings

from app.models.user import User
from app.models.category import Category
from app.models.item import Item
from app.models.order import Order
from app.models.order_item import OrderItem

from app.core.security import hash_password
from app.services.user_service import get_user_by_email, create_user
from app.services.category_service import create_category
from app.services.item_service import create_item

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.categories import router as categories_router
from app.routers.items import router as items_router
from app.routers.orders import router as orders_router
from app.routers.order_items import router as order_items_router

def create_app() -> FastAPI:
    app = FastAPI(title="ElectroStock API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    def root():
        return {"message": "API do ElectroStock rodando"}

    Base.metadata.create_all(bind=engine)

    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(categories_router)
    app.include_router(items_router)
    app.include_router(orders_router)
    app.include_router(order_items_router)

    @app.on_event("startup")
    def seed():
        db: Session = SessionLocal()
        try:
            admin = get_user_by_email(db, settings.ADMIN_EMAIL)
            if not admin:
                create_user(
                    db,
                    name="Admin",
                    email=settings.ADMIN_EMAIL,
                    password=settings.ADMIN_PASSWORD,
                    role="admin",
                )

            has_any_category = db.query(Category).first() is not None
            if not has_any_category:
                cat1 = create_category(db, "Componentes")
                cat2 = create_category(db, "Placas")

                create_item(db, name="Resistor 220Ω", description="Kit de resistores 220 ohms", stock=500, category_id=cat1.id)
                create_item(db, name="LED 5mm vermelho", description="LED vermelho padrão 5mm", stock=300, category_id=cat1.id)
                create_item(db, name="Protoboard 830 pontos", description="Protoboard grande", stock=50, category_id=cat1.id)
                create_item(db, name="Jumpers macho-macho", description="Kit com 40 jumpers", stock=100, category_id=cat1.id)
                create_item(db, name="Arduino UNO", description="Placa Arduino UNO compatível", stock=20, category_id=cat2.id)
                create_item(db, name="ESP32 DevKit", description="Placa ESP32 para IoT", stock=15, category_id=cat2.id)

        finally:
            db.close()

    return app

app = create_app()
