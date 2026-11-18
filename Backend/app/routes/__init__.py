from app.routes.auth import router as auth_router
from app.routes.shops import router as shops_router
from app.routes.products import router as products_router
from app.routes.categories import router as categories_router
from app.routes.cart import router as cart_router
from app.routes.orders import orders_router, seller_orders_router
from app.routes.dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "shops_router",
    "products_router",
    "categories_router",
    "cart_router",
    "orders_router",
    "seller_orders_router",
    "dashboard_router",
]
