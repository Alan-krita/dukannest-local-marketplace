
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    Uuid,
    CheckConstraint,
    text,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.shop import Shop
    from app.models.category import Category
    from app.models.cart_item import CartItem
    from app.models.order_item import OrderItem


class Product(Base):
    __tablename__ = "products"

    __table_args__ = (
        CheckConstraint(
            "price > 0",
            name="products_price_check"
        ),
        CheckConstraint(
            "stock_quantity >= 0",
            name="products_stock_quantity_check"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()")
    )

    shop_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("shops.id", ondelete="RESTRICT"),
        nullable=False
    )

    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid,
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True
    )

    name: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    stock_quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default=text("0"),
        nullable=False
    )

    sku: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )

    image_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
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
    shop: Mapped["Shop"] = relationship(
        "Shop",
        back_populates="products"
    )

    category: Mapped[Optional["Category"]] = relationship(
        "Category",
        back_populates="products"
    )

    cart_items: Mapped[List["CartItem"]] = relationship(
        "CartItem",
        back_populates="product"
    )

    order_items: Mapped[List["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="product"
    )

    @property
    def shop_name(self) -> Optional[str]:
        return self.shop.shop_name if self.shop else None

    @property
    def shop_locality(self) -> Optional[str]:
        return self.shop.locality if self.shop else None

    @property
    def shop_city(self) -> Optional[str]:
        return self.shop.city if self.shop else None

    @property
    def shop_pincode(self) -> Optional[str]:
        return self.shop.pincode if self.shop else None

