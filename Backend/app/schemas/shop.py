import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ShopStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"


class ShopBase(BaseModel):
    shop_name: str = Field(..., min_length=2, max_length=150, description="Name of the shop")
    description: Optional[str] = Field(None, description="Shop description")
    category: Optional[str] = Field(None, max_length=100, description="Primary category of the shop")
    locality: Optional[str] = Field(None, max_length=150, description="Locality / neighborhood")
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=100, description="State")
    pincode: Optional[str] = Field(None, max_length=20, description="Postal pincode")
    address: Optional[str] = Field(None, description="Detailed physical address")
    logo_url: Optional[str] = Field(None, description="URL to the shop logo")
    status: ShopStatus = Field(default=ShopStatus.DRAFT, description="Shop status: DRAFT or ACTIVE")


class ShopCreate(ShopBase):
    pass


class ShopUpdate(BaseModel):
    shop_name: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = None
    category: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    status: Optional[ShopStatus] = None


class ShopResponse(ShopBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
