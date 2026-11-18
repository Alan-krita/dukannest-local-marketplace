import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.services.order_service import OrderService
from app.core.dependencies import get_current_customer, get_current_seller

# Customer Orders Router (/api/v1/orders)
orders_router = APIRouter(prefix="/orders", tags=["Orders"])

# Seller Orders Router (/api/v1/seller/orders)
seller_orders_router = APIRouter(prefix="/seller/orders", tags=["Seller Orders"])


# --- Customer Endpoints ---

@orders_router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Checkout cart and place an order"
)
def checkout(
    checkout_in: OrderCreate,
    current_customer: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Place an order from items in the customer's cart.
    - Transactional: locks stock with row locks, re-verifies price and stock, and creates order.
    - Enforces single-seller checkout rule for MVP.
    - Clears cart upon successful checkout.
    - Payment method must be COD or SIMULATED.
    """
    return OrderService.checkout(db=db, customer=current_customer, checkout_in=checkout_in)


@orders_router.get(
    "/mine",
    response_model=List[OrderResponse],
    status_code=status.HTTP_200_OK,
    summary="Get customer order history"
)
def get_my_orders(
    current_customer: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    View all orders placed by the authenticated customer, including items and current status.
    """
    return OrderService.get_customer_orders(db=db, customer=current_customer)


# --- Seller Endpoints ---

@seller_orders_router.get(
    "",
    response_model=List[OrderResponse],
    status_code=status.HTTP_200_OK,
    summary="Get incoming orders for the seller's shop"
)
def get_seller_orders(
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    View all incoming customer orders containing items from the authenticated seller's shop.
    """
    return OrderService.get_seller_orders(db=db, seller=current_seller)


@seller_orders_router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Update order fulfillment status (Seller only)"
)
def update_order_status(
    order_id: uuid.UUID,
    status_in: OrderStatusUpdate,
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Advance order status through the allowed lifecycle:
    - PLACED -> ACCEPTED or CANCELLED
    - ACCEPTED -> PACKED or CANCELLED
    - PACKED -> SHIPPED
    - SHIPPED -> DELIVERED
    
    If order is CANCELLED, reserved stock is automatically returned to the seller's inventory.
    """
    return OrderService.update_order_status(
        db=db,
        seller=current_seller,
        order_id=order_id,
        status_in=status_in
    )
