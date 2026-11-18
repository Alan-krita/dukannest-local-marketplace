import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING, List

from sqlalchemy import (
    Text,
    DateTime,
    ForeignKey,
    Numeric,
    Uuid,
    CheckConstraint,
    text,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.order_item import OrderItem


class Order(Base):
    __tablename__ = "orders"

    __table_args__ = (
        CheckConstraint(
            "status IN ('PLACED','ACCEPTED','PACKED','SHIPPED','DELIVERED','CANCELLED')",
            name="orders_status_check"
        ),
        CheckConstraint(
            "subtotal >= 0",
            name="orders_subtotal_check"
        ),
        CheckConstraint(
            "delivery_fee >= 0",
            name="orders_delivery_fee_check"
        ),
        CheckConstraint(
            "total_amount >= 0",
            name="orders_total_amount_check"
        ),
        CheckConstraint(
            "payment_method IN ('COD','SIMULATED')",
            name="orders_payment_method_check"
        ),
        CheckConstraint(
            "payment_status IN ('PENDING','PAID','FAILED','REFUNDED')",
            name="orders_payment_status_check"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()")
    )

    customer_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False
    )

    order_number: Mapped[str] = mapped_column(
        Text,
        unique=True,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        Text,
        default="PLACED",
        server_default=text("'PLACED'"),
        nullable=False
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    delivery_fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=Decimal("0.00"),
        server_default=text("0"),
        nullable=False
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    delivery_name: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    delivery_phone: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    delivery_address: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    delivery_city: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    delivery_state: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    delivery_pincode: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    payment_method: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    payment_status: Mapped[str] = mapped_column(
        Text,
        default="PENDING",
        server_default=text("'PENDING'"),
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
    customer: Mapped["User"] = relationship(
        "User",
        back_populates="orders"
    )

    items: Mapped[List["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )
