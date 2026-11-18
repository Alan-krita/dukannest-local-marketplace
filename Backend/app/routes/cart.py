import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartResponse
from app.services.cart_service import CartService
from app.core.dependencies import get_current_customer

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get(
    "",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Get customer shopping cart"
)
def get_cart(
    current_customer: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Retrieve the current authenticated customer's shopping cart with all items, quantities, and subtotal.
    """
    return CartService.get_cart_details(db=db, customer=current_customer)


@router.post(
    "/items",
    response_model=CartResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add an item to the shopping cart"
)
def add_cart_item(
    item_in: CartItemAdd,
    current_customer: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Add a product to the cart with the specified quantity (min 1).
    Validates product stock and shop status.
    If the product is already in the cart, increments quantity.
    """
    return CartService.add_item_to_cart(db=db, customer=current_customer, item_in=item_in)


@router.patch(
    "/items/{item_id}",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Update quantity of a cart item"
)
def update_cart_item(
    item_id: uuid.UUID,
    item_in: CartItemUpdate,
    current_customer: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Update item quantity in customer's cart. Quantity must be at least 1 and within available stock.
    """
    return CartService.update_cart_item(
        db=db,
        customer=current_customer,
        item_id=item_id,
        item_in=item_in
    )


@router.delete(
    "/items/{item_id}",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Remove an item from the cart"
)
def remove_cart_item(
    item_id: uuid.UUID,
    current_customer: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """
    Remove an item from customer's shopping cart.
    """
    return CartService.remove_cart_item(
        db=db,
        customer=current_customer,
        item_id=item_id
    )
