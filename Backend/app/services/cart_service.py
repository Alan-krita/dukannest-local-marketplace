import uuid
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product import Product
from app.models.shop import Shop
from app.models.user import User
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartResponse, CartItemResponse
from app.schemas.product import ProductResponse


class CartService:
    @staticmethod
    def get_or_create_cart(db: Session, customer: User) -> Cart:
        """Retrieve customer's cart or create a new one if not present."""
        cart = db.query(Cart).filter(Cart.customer_user_id == customer.id).first()
        if not cart:
            cart = Cart(customer_user_id=customer.id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    @staticmethod
    def get_cart_details(db: Session, customer: User) -> CartResponse:
        """Fetch full cart details with items, product info, total items and subtotal."""
        cart = CartService.get_or_create_cart(db, customer)

        # Load cart items joined with product and product shop
        items = (
            db.query(CartItem)
            .filter(CartItem.cart_id == cart.id)
            .options(joinedload(CartItem.product))
            .all()
        )

        item_responses: list[CartItemResponse] = []
        total_items = 0
        subtotal = Decimal("0.00")

        for item in items:
            product = item.product
            prod_resp = ProductResponse.model_validate(product) if product else None
            item_resp = CartItemResponse(
                id=item.id,
                cart_id=item.cart_id,
                product_id=item.product_id,
                quantity=item.quantity,
                created_at=item.created_at,
                updated_at=item.updated_at,
                product=prod_resp
            )
            item_responses.append(item_resp)
            total_items += item.quantity
            if product:
                subtotal += (product.price * Decimal(item.quantity))

        return CartResponse(
            id=cart.id,
            customer_user_id=cart.customer_user_id,
            items=item_responses,
            total_items=total_items,
            subtotal=subtotal.quantize(Decimal("0.01")),
            created_at=cart.created_at,
            updated_at=cart.updated_at
        )

    @staticmethod
    def add_item_to_cart(db: Session, customer: User, item_in: CartItemAdd) -> CartResponse:
        """Add product to cart. If already present, increment quantity while verifying stock."""
        cart = CartService.get_or_create_cart(db, customer)

        # Validate product
        product = db.query(Product).filter(Product.id == item_in.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found or is currently inactive"
            )

        shop = db.query(Shop).filter(Shop.id == product.shop_id).first()
        if not shop or shop.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This product belongs to an inactive shop and cannot be added to cart"
            )

        # Check existing item in cart
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product.id
        ).first()

        new_quantity = item_in.quantity
        if existing_item:
            new_quantity += existing_item.quantity

        if new_quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity ({new_quantity}) exceeds available stock ({product.stock_quantity})"
            )

        if existing_item:
            existing_item.quantity = new_quantity
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=product.id,
                quantity=item_in.quantity
            )
            db.add(new_item)

        db.commit()
        return CartService.get_cart_details(db, customer)

    @staticmethod
    def update_cart_item(db: Session, customer: User, item_id: uuid.UUID, item_in: CartItemUpdate) -> CartResponse:
        """Update quantity of an item in customer's cart."""
        cart = CartService.get_or_create_cart(db, customer)

        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        ).first()

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found in your cart"
            )

        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is no longer available"
            )

        if item_in.quantity > product.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity ({item_in.quantity}) exceeds available stock ({product.stock_quantity})"
            )

        cart_item.quantity = item_in.quantity
        db.commit()
        return CartService.get_cart_details(db, customer)

    @staticmethod
    def remove_cart_item(db: Session, customer: User, item_id: uuid.UUID) -> CartResponse:
        """Remove an item from customer's cart."""
        cart = CartService.get_or_create_cart(db, customer)

        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        ).first()

        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found in your cart"
            )

        db.delete(cart_item)
        db.commit()
        return CartService.get_cart_details(db, customer)
