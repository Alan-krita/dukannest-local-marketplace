from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductResponse
from app.schemas.shop import ShopResponse


class SellerDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    shop: Optional[ShopResponse] = None
    total_products: int = 0
    active_products: int = 0
    in_stock_products: int = 0
    low_stock_products: int = 0
    out_of_stock_products: int = 0
    low_stock_threshold: int = 5
    low_stock_items: List[ProductResponse] = []
    total_orders: int = 0
    pending_orders: int = 0
    delivered_orders: int = 0
    total_sales: Decimal = Decimal("0.00")

