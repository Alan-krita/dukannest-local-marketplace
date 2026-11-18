import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Text,
    ForeignKey,
    Integer,
    Numeric,
    Uuid,
    CheckConstraint,
    text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.order import Order
    from app.models.product import Product
    from app.models.shop import Shop


class OrderItem(Base):
    __tablename__ = "order_items"

    __table_args__ = (
        CheckConstraint(
            "unit_price >= 0",
            name="order_items_unit_price_check"
        ),
        CheckConstraint(
            "quantity >= 1",
            name="order_items_quantity_check"
        ),
        CheckConstraint(
            "line_total >= 0",
            name="order_items_line_total_check"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()")
    )

    order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("orders.id", ondelete="RESTRICT"),
        nullable=False
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False
    )

    seller_shop_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("shops.id", ondelete="RESTRICT"),
        nullable=False
    )

    product_name_snapshot: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    line_total: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    # NOTE: schema.sql for order_items has NO created_at column.
    # We strictly match schema.sql and do NOT include created_at.

    # Relationships
    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="items"
    )

    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="order_items"
    )

    seller_shop: Mapped["Shop"] = relationship(
        "Shop",
        back_populates="order_items"
    )
