from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category
from app.schemas.category import CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get(
    "",
    response_model=List[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="List all active categories"
)
def list_categories(
    db: Session = Depends(get_db)
):
    """
    Public endpoint to list categories for product filtering and selection.
    """
    return db.query(Category).filter(Category.is_active.is_(True)).order_by(Category.name.asc()).all()
