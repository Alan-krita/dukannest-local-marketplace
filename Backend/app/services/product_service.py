import math
import uuid
from typing import Optional
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.shop import Shop
from app.models.category import Category
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate, ProductPaginationResponse, ProductResponse


class ProductService:
    @staticmethod
    def list_products(
        db: Session,
        search: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        city: Optional[str] = None,
        locality: Optional[str] = None,
        pincode: Optional[str] = None,
        shop_id: Optional[uuid.UUID] = None,
        include_inactive: bool = False,
        page: int = 1,
        limit: int = 20
    ) -> ProductPaginationResponse:
        """
        List products with filtering and pagination.
        By default, only active products from active shops are returned for public browsing.
        """
        query = db.query(Product).join(Shop, Product.shop_id == Shop.id)

        if not include_inactive:
            query = query.filter(Product.is_active.is_(True), Shop.status == "ACTIVE")

        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_pattern),
                    Product.description.ilike(search_pattern)
                )
            )

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if city:
            query = query.filter(Shop.city.ilike(f"%{city.strip()}%"))

        if locality:
            query = query.filter(Shop.locality.ilike(f"%{locality.strip()}%"))

        if pincode:
            query = query.filter(Shop.pincode.ilike(f"%{pincode.strip()}%"))

        if shop_id:
            query = query.filter(Product.shop_id == shop_id)

        total = query.count()
        pages = math.ceil(total / limit) if total > 0 else 1
        offset = (page - 1) * limit

        products = query.order_by(Product.created_at.desc()).offset(offset).limit(limit).all()

        return ProductPaginationResponse(
            items=[ProductResponse.model_validate(p) for p in products],
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )

    @staticmethod
    def get_product_by_id(db: Session, product_id: uuid.UUID) -> Product:
        """Get product by ID or raise 404."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product

    @staticmethod
    def create_product(db: Session, seller: User, product_in: ProductCreate) -> Product:
        """Create a product in the seller's shop."""
        shop = db.query(Shop).filter(Shop.owner_user_id == seller.id).first()
        if not shop:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must create a shop before adding products"
            )

        # Validate category_id if provided
        if product_in.category_id:
            category = db.query(Category).filter(
                Category.id == product_in.category_id,
                Category.is_active.is_(True)
            ).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or inactive category specified"
                )

        product = Product(
            shop_id=shop.id,
            category_id=product_in.category_id,
            name=product_in.name.strip(),
            description=product_in.description,
            price=product_in.price,
            stock_quantity=product_in.stock_quantity,
            sku=product_in.sku,
            image_url=product_in.image_url,
            is_active=True
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update_product(db: Session, seller: User, product_id: uuid.UUID, product_in: ProductUpdate) -> Product:
        """Update an existing product. Only the owning seller can modify it."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        shop = db.query(Shop).filter(Shop.id == product.shop_id).first()
        if not shop or shop.owner_user_id != seller.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify products belonging to another shop"
            )

        update_data = product_in.model_dump(exclude_unset=True)

        if "category_id" in update_data and update_data["category_id"] is not None:
            category = db.query(Category).filter(
                Category.id == update_data["category_id"],
                Category.is_active.is_(True)
            ).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or inactive category specified"
                )

        for field, value in update_data.items():
            setattr(product, field, value)

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def archive_product(db: Session, seller: User, product_id: uuid.UUID) -> Product:
        """Soft-delete / archive a product by setting is_active=False."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        shop = db.query(Shop).filter(Shop.id == product.shop_id).first()
        if not shop or shop.owner_user_id != seller.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to archive products from another shop"
            )

        product.is_active = False
        db.commit()
        db.refresh(product)
        return product
