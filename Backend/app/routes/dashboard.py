from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import SellerDashboardResponse
from app.services.dashboard_service import DashboardService
from app.core.dependencies import get_current_seller

router = APIRouter(prefix="/seller/dashboard", tags=["Seller Dashboard"])


@router.get(
    "",
    response_model=SellerDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Get seller shop metrics and statistics"
)
def get_seller_dashboard(
    low_stock_threshold: int = Query(5, ge=1, description="Threshold for low-stock products"),
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """
    Returns analytics and summary metrics for the logged-in seller:
    - Total products and active products
    - Smart Inventory summary (In Stock, Low Stock, Out of Stock)
    - Low stock alerted products list
    - Total, pending, and completed orders
    - Total revenue generated
    """
    return DashboardService.get_seller_metrics(
        db=db,
        seller=current_seller,
        low_stock_threshold=low_stock_threshold
    )

