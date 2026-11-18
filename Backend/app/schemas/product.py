import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product title")
    description: Optional[str] = Field(None, description="Detailed product description")
    price: Decimal = Field(..., gt=0, decimal_places=2, description="Price in currency units, must be > 0")
    stock_quantity: int = Field(default=0, ge=0, description="Available inventory stock, >= 0")
    sku: Optional[str] = Field(None, max_length=100, description="Stock keeping unit identifier")
    image_url: Optional[str] = Field(None, description="Product image URL")


class ProductCreate(ProductBase):
    category_id: Optional[uuid.UUID] = Field(None, description="Optional foreign key to categories table")


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)
    sku: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    shop_id: uuid.UUID
    category_id: Optional[uuid.UUID] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    # Location and shop metadata for locality-based discovery
    shop_name: Optional[str] = None
    shop_locality: Optional[str] = None
    shop_city: Optional[str] = None
    shop_pincode: Optional[str] = None


class ProductPaginationResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int
    pages: int
