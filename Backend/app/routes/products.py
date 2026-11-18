import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductPaginationResponse
)
from app.services.product_service import ProductService
from app.core.dependencies import get_current_seller

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "",
    response_model=ProductPaginationResponse,
    status_code=status.HTTP_200_OK,
    summary="Browse and search products"
)
def list_products(
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category UUID"),
    city: Optional[str] = Query(None, description="Filter by seller city"),
    locality: Optional[str] = Query(None, description="Filter by seller locality/neighborhood"),
    pincode: Optional[str] = Query(None, description="Filter by seller pincode"),
    shop_id: Optional[uuid.UUID] = Query(None, description="Filter by shop UUID"),
    page: int = Query(1, ge=1, description="Page number, minimum 1"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (1-100)"),
    db: Session = Depends(get_db)
):
    """
    Public catalog endpoint to search, filter and paginate active marketplace products from active shops.
    """
    if not isinstance(search, str):
        search = None
    if not isinstance(city, str):
        city = None
    if not isinstance(locality, str):
        locality = None
    if not isinstance(pincode, str):
        pincode = None
    if not isinstance(category_id, uuid.UUID):
        category_id = None
    if not isinstance(shop_id, uuid.UUID):
        shop_id = None
    if not isinstance(page, int):
        page = 1
    if not isinstance(limit, int):
        limit = 20

    return ProductService.list_products(
        db=db,
        search=search,
        category_id=category_id,
        city=city,
        locality=locality,
        pincode=pincode,
        shop_id=shop_id,
        include_inactive=False,
        page=page,
        limit=limit
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single product details by ID"
)
def get_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to view full details of a specific product.
    """
    return ProductService.get_product_by_id(db=db, product_id=product_id)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new product (Sellers only)"
)
def create_product(
    product_in: ProductCreate,
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Authenticated sellers can add products to their own shop.
    - Price must be greater than zero.
    - Stock quantity cannot be negative.
    """
    return ProductService.create_product(db=db, seller=current_seller, product_in=product_in)


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Update product details (Owning seller only)"
)
def update_product(
    product_id: uuid.UUID,
    product_in: ProductUpdate,
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Update product title, description, category, price, or inventory stock.
    Sellers can only modify products belonging to their own shop.
    """
    return ProductService.update_product(
        db=db,
        seller=current_seller,
        product_id=product_id,
        product_in=product_in
    )


@router.delete(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Archive product (Owning seller only)"
)
def archive_product(
    product_id: uuid.UUID,
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Soft-delete / archive a product by setting is_active=False.
    Preserves historical references in past orders and carts.
    """
    return ProductService.archive_product(
        db=db,
        seller=current_seller,
        product_id=product_id
    )
