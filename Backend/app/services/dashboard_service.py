from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.shop import Shop
from app.models.user import User
from app.schemas.dashboard import SellerDashboardResponse
from app.schemas.product import ProductResponse
from app.schemas.shop import ShopResponse


class DashboardService:
    @staticmethod
    def get_seller_metrics(db: Session, seller: User, low_stock_threshold: int = 5) -> SellerDashboardResponse:
        """Calculate and return key statistics for the authenticated seller's shop."""
        shop = db.query(Shop).filter(Shop.owner_user_id == seller.id).first()
        if not shop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You have not created a shop yet. Create a shop to view your dashboard metrics."
            )

        # 1. Product counts & Smart Inventory classification
        seller_products_query = db.query(Product).filter(Product.shop_id == shop.id)
        total_products = seller_products_query.count()
        active_products = seller_products_query.filter(Product.is_active.is_(True)).count()

        in_stock_products = seller_products_query.filter(
            Product.stock_quantity > low_stock_threshold
        ).count()

        low_stock_products = seller_products_query.filter(
            Product.stock_quantity > 0,
            Product.stock_quantity <= low_stock_threshold
        ).count()

        out_of_stock_products = seller_products_query.filter(
            Product.stock_quantity == 0
        ).count()

        # Fetch low stock and out of stock items for alerts (ordered with 0-stock first)
        alerted_db_products = (
            seller_products_query
            .filter(Product.stock_quantity <= low_stock_threshold)
            .order_by(Product.stock_quantity.asc(), Product.name.asc())
            .all()
        )

        low_stock_items = []
        for p in alerted_db_products:
            p_resp = ProductResponse.model_validate(p)
            p_resp.shop_name = shop.shop_name
            p_resp.shop_locality = shop.locality
            p_resp.shop_city = shop.city
            p_resp.shop_pincode = shop.pincode
            low_stock_items.append(p_resp)

        # 2. Distinct orders containing items from this seller's shop
        orders_query = (
            db.query(Order)
            .join(OrderItem, Order.id == OrderItem.order_id)
            .filter(OrderItem.seller_shop_id == shop.id)
            .distinct()
        )

        total_orders = orders_query.count()

        pending_orders = orders_query.filter(
            Order.status.in_(["PLACED", "ACCEPTED", "PACKED", "SHIPPED"])
        ).count()

        delivered_orders = orders_query.filter(
            Order.status == "DELIVERED"
        ).count()

        # 3. Total sales sum from order_items for this shop (excluding cancelled orders)
        sales_query = (
            db.query(func.coalesce(func.sum(OrderItem.line_total), 0))
            .join(Order, Order.id == OrderItem.order_id)
            .filter(
                OrderItem.seller_shop_id == shop.id,
                Order.status != "CANCELLED"
            )
        )
        total_sales_value = sales_query.scalar() or Decimal("0.00")
        total_sales = Decimal(str(total_sales_value)).quantize(Decimal("0.01"))

        return SellerDashboardResponse(
            shop=ShopResponse.model_validate(shop),
            total_products=total_products,
            active_products=active_products,
            in_stock_products=in_stock_products,
            low_stock_products=low_stock_products,
            out_of_stock_products=out_of_stock_products,
            low_stock_threshold=low_stock_threshold,
            low_stock_items=low_stock_items,
            total_orders=total_orders,
            pending_orders=pending_orders,
            delivered_orders=delivered_orders,
            total_sales=total_sales
        )
