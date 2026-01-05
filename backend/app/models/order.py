from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="orders")

    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    # pending / approved / rejected / finished

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
