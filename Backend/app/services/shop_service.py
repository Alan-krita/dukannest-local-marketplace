import uuid
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.shop import Shop
from app.models.user import User
from app.schemas.shop import ShopCreate, ShopUpdate


class ShopService:
    @staticmethod
    def create_shop(db: Session, seller: User, shop_in: ShopCreate) -> Shop:
        """Create a shop for the authenticated seller. One seller can own only one shop."""
        existing_shop = db.query(Shop).filter(Shop.owner_user_id == seller.id).first()
        if existing_shop:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Seller already owns a shop. Only one shop per seller is allowed."
            )

        shop = Shop(
            owner_user_id=seller.id,
            shop_name=shop_in.shop_name.strip(),
            description=shop_in.description,
            category=shop_in.category,
            locality=shop_in.locality,
            city=shop_in.city,
            state=shop_in.state,
            pincode=shop_in.pincode,
            address=shop_in.address,
            logo_url=shop_in.logo_url,
            status=shop_in.status.value
        )
        db.add(shop)
        db.commit()
        db.refresh(shop)
        return shop

    @staticmethod
    def get_seller_shop(db: Session, seller_id: uuid.UUID) -> Optional[Shop]:
        """Get the shop owned by the given seller user ID."""
        return db.query(Shop).filter(Shop.owner_user_id == seller_id).first()

    @staticmethod
    def get_shop_by_id(db: Session, shop_id: uuid.UUID) -> Shop:
        """Fetch shop by shop_id or raise 404."""
        shop = db.query(Shop).filter(Shop.id == shop_id).first()
        if not shop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shop not found"
            )
        return shop

    @staticmethod
    def update_seller_shop(db: Session, seller: User, shop_in: ShopUpdate) -> Shop:
        """Update the authenticated seller's shop."""
        shop = db.query(Shop).filter(Shop.owner_user_id == seller.id).first()
        if not shop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="You do not have a shop to update. Please create one first."
            )

        update_data = shop_in.model_dump(exclude_unset=True)
        if "status" in update_data and update_data["status"] is not None:
            update_data["status"] = update_data["status"].value

        for field, value in update_data.items():
            setattr(shop, field, value)

        db.commit()
        db.refresh(shop)
        return shop
