import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Text,
    Boolean,
    DateTime,
    Uuid,
    CheckConstraint,
    text,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.shop import Shop
    from app.models.cart import Cart
    from app.models.order import Order


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "role IN ('CUSTOMER', 'SELLER')",
            name="users_role_check"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()")
    )

    full_name: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        Text,
        unique=True,
        nullable=False,
        index=True
    )

    phone: Mapped[Optional[str]] = mapped_column(
        Text,
        unique=True,
        nullable=True
    )

    password_hash: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="CUSTOMER",
        server_default=text("'CUSTOMER'")
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    shop: Mapped[Optional["Shop"]] = relationship(
        "Shop",
        back_populates="owner",
        uselist=False,
        cascade="all, delete-orphan"
    )

    cart: Mapped[Optional["Cart"]] = relationship(
        "Cart",
        back_populates="customer",
        uselist=False,
        cascade="all, delete-orphan"
    )

    orders: Mapped[List["Order"]] = relationship(
        "Order",
        back_populates="customer"
    )
