import uuid
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.shop import ShopCreate, ShopUpdate, ShopResponse
from app.services.shop_service import ShopService
from app.core.dependencies import get_current_seller

router = APIRouter(prefix="/shops", tags=["Shops"])


@router.post(
    "",
    response_model=ShopResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new shop for the authenticated seller"
)
def create_shop(
    shop_in: ShopCreate,
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Sellers can create exactly one shop.
    Initial status can be DRAFT or ACTIVE (defaults to DRAFT).
    """
    return ShopService.create_shop(db=db, seller=current_seller, shop_in=shop_in)


@router.get(
    "/mine",
    response_model=ShopResponse,
    status_code=status.HTTP_200_OK,
    summary="Get shop belonging to the authenticated seller"
)
def get_my_shop(
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Retrieve the shop owned by the currently logged-in seller.
    """
    shop = ShopService.get_seller_shop(db=db, seller_id=current_seller.id)
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You have not created a shop yet"
        )
    return shop


@router.patch(
    "/mine",
    response_model=ShopResponse,
    status_code=status.HTTP_200_OK,
    summary="Update shop details for the authenticated seller"
)
def update_my_shop(
    shop_in: ShopUpdate,
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Update details (name, locality, city, status, etc.) of the seller's own shop.
    """
    return ShopService.update_seller_shop(db=db, seller=current_seller, shop_in=shop_in)


@router.get(
    "/{shop_id}",
    response_model=ShopResponse,
    status_code=status.HTTP_200_OK,
    summary="Get public details of a shop by ID"
)
def get_shop_by_id(
    shop_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to view information about any registered shop.
    """
    return ShopService.get_shop_by_id(db=db, shop_id=shop_id)
