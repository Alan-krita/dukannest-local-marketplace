import time
import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.shop import Shop
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderStatus, PaymentMethod, PaymentStatus

# Allowed state transitions as specified in the project requirements:
# PLACED -> ACCEPTED or CANCELLED
# ACCEPTED -> PACKED or CANCELLED
# PACKED -> SHIPPED
# SHIPPED -> DELIVERED
VALID_TRANSITIONS = {
    OrderStatus.PLACED.value: [OrderStatus.ACCEPTED.value, OrderStatus.CANCELLED.value],
    OrderStatus.ACCEPTED.value: [OrderStatus.PACKED.value, OrderStatus.CANCELLED.value],
    OrderStatus.PACKED.value: [OrderStatus.SHIPPED.value],
    OrderStatus.SHIPPED.value: [OrderStatus.DELIVERED.value],
    OrderStatus.DELIVERED.value: [],
    OrderStatus.CANCELLED.value: [],
}


class OrderService:
    @staticmethod
    def _generate_order_number() -> str:
        """Generate a clean, unique order number."""
        timestamp_part = int(time.time() * 1000)
        random_part = uuid.uuid4().hex[:6].upper()
        return f"ORD-{timestamp_part}-{random_part}"

    @staticmethod
    def checkout(db: Session, customer: User, checkout_in: OrderCreate) -> Order:
        """
        Execute an atomic checkout transaction:
        - Locks product rows with FOR UPDATE to prevent race conditions & overselling
        - Enforces single-seller checkout rule for MVP
        - Validates stock and active status
        - Calculates Decimal subtotal and total
        - Records snapshots in order_items
        - Decrements stock
        - Clears cart
        - Rolls back fully on any error
        """
        # 1. Fetch customer's cart
        cart = db.query(Cart).filter(Cart.customer_user_id == customer.id).first()
        if not cart:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your cart is empty. Add products before placing an order."
            )

        cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your cart is empty. Add products before placing an order."
            )

        # 2. Lock products row-by-row using SELECT ... FOR UPDATE to prevent concurrency overselling
        product_ids = [ci.product_id for ci in cart_items]
        # Query and lock products
        locked_products = {
            p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).with_for_update().all()
        }

        # 3. Validate single-seller shop requirement for MVP
        shop_ids = set()
        for ci in cart_items:
            product = locked_products.get(ci.product_id)
            if not product or not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{product.name if product else ci.product_id}' is no longer available"
                )
            shop_ids.add(product.shop_id)

        if len(shop_ids) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Single-seller checkout: Your cart contains items from multiple shops. Please checkout items from one shop at a time."
            )

        seller_shop_id = list(shop_ids)[0]
        shop = db.query(Shop).filter(Shop.id == seller_shop_id).first()
        if not shop or shop.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The shop selling these items is currently inactive"
            )

        # 4. Recheck prices, validate stock, and calculate subtotal using Decimal
        subtotal = Decimal("0.00")
        items_to_create = []

        for ci in cart_items:
            product = locked_products[ci.product_id]

            if ci.quantity > product.stock_quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product.name}'. Requested: {ci.quantity}, Available: {product.stock_quantity}"
                )

            line_total = (product.price * Decimal(ci.quantity)).quantize(Decimal("0.01"))
            subtotal += line_total

            items_to_create.append({
                "product": product,
                "quantity": ci.quantity,
                "unit_price": product.price,
                "line_total": line_total,
                "product_name_snapshot": product.name,
                "seller_shop_id": product.shop_id
            })

        subtotal = subtotal.quantize(Decimal("0.01"))
        delivery_fee = Decimal("0.00")
        total_amount = (subtotal + delivery_fee).quantize(Decimal("0.01"))

        # Determine initial payment status
        payment_status = (
            PaymentStatus.PAID.value if checkout_in.payment_method == PaymentMethod.SIMULATED
            else PaymentStatus.PENDING.value
        )

        try:
            # 5. Create Order
            order = Order(
                customer_user_id=customer.id,
                order_number=OrderService._generate_order_number(),
                status=OrderStatus.PLACED.value,
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total_amount=total_amount,
                delivery_name=checkout_in.delivery_name.strip(),
                delivery_phone=checkout_in.delivery_phone.strip(),
                delivery_address=checkout_in.delivery_address.strip(),
                delivery_city=checkout_in.delivery_city.strip(),
                delivery_state=checkout_in.delivery_state.strip(),
                delivery_pincode=checkout_in.delivery_pincode.strip(),
                payment_method=checkout_in.payment_method.value,
                payment_status=payment_status
            )
            db.add(order)
            db.flush()

            # 6. Create OrderItems & Safely decrement stock
            for item_data in items_to_create:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item_data["product"].id,
                    seller_shop_id=item_data["seller_shop_id"],
                    product_name_snapshot=item_data["product_name_snapshot"],
                    unit_price=item_data["unit_price"],
                    quantity=item_data["quantity"],
                    line_total=item_data["line_total"]
                )
                db.add(order_item)

                # Safely reduce product stock
                item_data["product"].stock_quantity -= item_data["quantity"]

            # 7. Clear customer cart
            db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

            db.commit()
            db.refresh(order)
            return order

        except Exception as exc:
            db.rollback()
            if isinstance(exc, HTTPException):
                raise exc
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process checkout transaction"
            ) from exc

    @staticmethod
    def get_customer_orders(db: Session, customer: User) -> List[Order]:
        """Fetch all orders placed by the customer, ordered newest first."""
        return (
            db.query(Order)
            .filter(Order.customer_user_id == customer.id)
            .options(joinedload(Order.items))
            .order_by(Order.created_at.desc())
            .all()
        )

    @staticmethod
    def get_seller_orders(db: Session, seller: User) -> List[Order]:
        """Fetch all incoming orders for the seller's shop."""
        shop = db.query(Shop).filter(Shop.owner_user_id == seller.id).first()
        if not shop:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You do not own a shop"
            )

        # Get distinct order IDs that contain items belonging to this seller's shop
        order_ids_subquery = (
            db.query(OrderItem.order_id)
            .filter(OrderItem.seller_shop_id == shop.id)
            .distinct()
            .scalar_subquery()
        )

        orders = (
            db.query(Order)
            .filter(Order.id.in_(order_ids_subquery))
            .options(joinedload(Order.items))
            .order_by(Order.created_at.desc())
            .all()
        )
        return orders

    @staticmethod
    def update_order_status(db: Session, seller: User, order_id: uuid.UUID, status_in: OrderStatusUpdate) -> Order:
        """
        Update the status of an order for a seller's shop.
        Validates ownership and verifies allowed lifecycle status transitions.
        If order is cancelled, restores stock.
        """
        shop = db.query(Shop).filter(Shop.owner_user_id == seller.id).first()
        if not shop:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You do not own a shop"
            )

        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # Verify this order has items belonging to this seller's shop
        seller_items = (
            db.query(OrderItem)
            .filter(OrderItem.order_id == order.id, OrderItem.seller_shop_id == shop.id)
            .all()
        )
        if not seller_items:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to manage this order"
            )

        current_status = order.status
        target_status = status_in.status.value

        # Check valid state transitions
        allowed_targets = VALID_TRANSITIONS.get(current_status, [])
        if target_status not in allowed_targets:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid order status transition from '{current_status}' to '{target_status}'. Allowed transitions: {allowed_targets}"
            )

        # If transitioning to CANCELLED, restore product stock
        if target_status == OrderStatus.CANCELLED.value:
            for item in seller_items:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    product.stock_quantity += item.quantity

        order.status = target_status

        # If delivered, and payment method was COD, mark as PAID
        if target_status == OrderStatus.DELIVERED.value and order.payment_method == "COD":
            order.payment_status = PaymentStatus.PAID.value

        db.commit()
        db.refresh(order)
        return order
