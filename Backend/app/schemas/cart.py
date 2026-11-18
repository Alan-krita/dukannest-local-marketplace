import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.product import ProductResponse


class CartItemAdd(BaseModel):
    product_id: uuid.UUID = Field(..., description="ID of the product to add to cart")
    quantity: int = Field(default=1, ge=1, description="Quantity to add, minimum 1")


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, description="Updated quantity, minimum 1")


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cart_id: uuid.UUID
    product_id: uuid.UUID
    quantity: int
    created_at: datetime
    updated_at: datetime
    product: Optional[ProductResponse] = None


class CartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    customer_user_id: uuid.UUID
    items: List[CartItemResponse] = []
    total_items: int = 0
    subtotal: Decimal = Decimal("0.00")
    created_at: datetime
    updated_at: datetime
