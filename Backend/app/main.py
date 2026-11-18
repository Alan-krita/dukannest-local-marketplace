from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import check_db_connection
from app.routes import (
    auth_router,
    shops_router,
    products_router,
    categories_router,
    cart_router,
    orders_router,
    seller_orders_router,
    dashboard_router,
)

app = FastAPI(
    title="Local Seller Marketplace API",
    description="Production-ready FastAPI backend for the Local Seller Marketplace MVP.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration to allow local HTML/CSS/JS frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def home():
    """Welcome endpoint providing basic API info and Swagger link."""
    return {
        "message": "Welcome to Local Seller Marketplace Backend",
        "docs": "/docs",
        "health": "/health",
        "api_prefix": "/api/v1"
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint verifying application and database reachability.
    Does not expose sensitive credentials.
    """
    db_alive = check_db_connection()
    return {
        "status": "healthy",
        "database": "connected" if db_alive else "disconnected"
    }


# Include API routers under /api/v1
API_V1_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(shops_router, prefix=API_V1_PREFIX)
app.include_router(products_router, prefix=API_V1_PREFIX)
app.include_router(categories_router, prefix=API_V1_PREFIX)
app.include_router(cart_router, prefix=API_V1_PREFIX)
app.include_router(orders_router, prefix=API_V1_PREFIX)
app.include_router(seller_orders_router, prefix=API_V1_PREFIX)
app.include_router(dashboard_router, prefix=API_V1_PREFIX)
