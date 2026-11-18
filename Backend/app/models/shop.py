import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Text,
    DateTime,
    ForeignKey,
    Uuid,
    CheckConstraint,
    text,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.product import Product
    from app.models.order_item import OrderItem


class Shop(Base):
    __tablename__ = "shops"

    __table_args__ = (
        CheckConstraint(
            "status IN ('DRAFT', 'ACTIVE')",
            name="shops_status_check"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()")
    )

    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False
    )

    shop_name: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    category: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    locality: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    city: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    state: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    pincode: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    logo_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        Text,
        default="DRAFT",
        server_default=text("'DRAFT'"),
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
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="shop"
    )

    products: Mapped[List["Product"]] = relationship(
        "Product",
        back_populates="shop"
    )

    order_items: Mapped[List["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="seller_shop"
    )
