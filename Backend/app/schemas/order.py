import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class OrderStatus(str, Enum):
    PLACED = "PLACED"
    ACCEPTED = "ACCEPTED"
    PACKED = "PACKED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PaymentMethod(str, Enum):
    COD = "COD"
    SIMULATED = "SIMULATED"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class OrderCreate(BaseModel):
    delivery_name: str = Field(..., min_length=2, max_length=150, description="Recipient full name")
    delivery_phone: str = Field(..., min_length=7, max_length=20, description="Contact phone number")
    delivery_address: str = Field(..., min_length=5, description="Street address and premises")
    delivery_city: str = Field(..., min_length=2, max_length=100, description="City")
    delivery_state: str = Field(..., min_length=2, max_length=100, description="State / Province")
    delivery_pincode: str = Field(..., min_length=3, max_length=20, description="Postal pincode")
    payment_method: PaymentMethod = Field(default=PaymentMethod.COD, description="Payment method: COD or SIMULATED")


class OrderStatusUpdate(BaseModel):
    status: OrderStatus = Field(..., description="Target order status")


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    order_id: uuid.UUID
    product_id: uuid.UUID
    seller_shop_id: uuid.UUID
    product_name_snapshot: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    customer_user_id: uuid.UUID
    order_number: str
    status: str
    subtotal: Decimal
    delivery_fee: Decimal
    total_amount: Decimal
    delivery_name: str
    delivery_phone: str
    delivery_address: str
    delivery_city: str
    delivery_state: str
    delivery_pincode: str
    payment_method: str
    payment_status: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
