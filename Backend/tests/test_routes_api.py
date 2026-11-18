import sys
import unittest
import uuid
from decimal import Decimal
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
import app.models
from app.models.category import Category

from app.schemas.user import UserRegister, UserLogin, UserRole
from app.schemas.shop import ShopCreate, ShopUpdate, ShopStatus
from app.schemas.product import ProductCreate, ProductUpdate
from app.schemas.cart import CartItemAdd, CartItemUpdate
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderStatus, PaymentMethod

from app.routes.auth import register, login, get_current_user_profile
from app.routes.shops import create_shop, get_my_shop, update_my_shop, get_shop_by_id
from app.routes.categories import list_categories
from app.routes.products import create_product, list_products, get_product, update_product, archive_product
from app.routes.cart import get_cart, add_cart_item, update_cart_item, remove_cart_item
from app.routes.orders import checkout, get_my_orders, get_seller_orders, update_order_status
from app.routes.dashboard import get_seller_dashboard
from app.main import home, health_check


class APIRoutesTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
        Base.metadata.create_all(bind=cls.engine)
        cls.SessionTesting = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

    def setUp(self):
        self.db = self.SessionTesting()

    def tearDown(self):
        self.db.rollback()
        self.db.close()

    def test_01_home_and_health_endpoints(self):
        """Test GET / and GET /health."""
        h = home()
        self.assertEqual(h["docs"], "/docs")
        self.assertEqual(h["api_prefix"], "/api/v1")

        health = health_check()
        self.assertEqual(health["status"], "healthy")
        self.assertIn("database", health)

    def test_02_auth_routes(self):
        """Test auth endpoints: register, login, profile."""
        # 1. Register Seller
        seller_user = register(
            user_in=UserRegister(
                full_name="Sarah Seller",
                email="sarah@example.com",
                password="password123",
                phone="1112223333",
                role=UserRole.SELLER
            ),
            db=self.db
        )
        self.assertEqual(seller_user.role, "SELLER")

        # 2. Register Customer
        customer_user = register(
            user_in=UserRegister(
                full_name="Carl Customer",
                email="carl@example.com",
                password="password123",
                phone="4445556666",
                role=UserRole.CUSTOMER
            ),
            db=self.db
        )
        self.assertEqual(customer_user.role, "CUSTOMER")

        # 3. Login
        token_data = login(
            user_in=UserLogin(email="sarah@example.com", password="password123"),
            db=self.db
        )
        self.assertTrue(hasattr(token_data, "access_token"))
        self.assertEqual(token_data.token_type, "bearer")

        # 4. Profile /me
        profile = get_current_user_profile(current_user=seller_user)
        self.assertEqual(profile.email, "sarah@example.com")

    def test_03_shop_and_category_routes(self):
        """Test shop endpoints: create, mine, update, get by id, and category listing."""
        from app.models.user import User
        seller = self.db.query(User).filter(User.email == "sarah@example.com").first()

        # Seed a test category
        cat = Category(name="Pottery", slug="pottery", is_active=True)
        self.db.add(cat)
        self.db.commit()

        # Test list_categories
        cats = list_categories(db=self.db)
        self.assertTrue(len(cats) >= 1)

        # Create Shop
        shop = create_shop(
            shop_in=ShopCreate(
                shop_name="Sarah's Ceramics",
                locality="Old Town",
                city="Portland",
                state="Oregon",
                pincode="97201",
                address="789 Clay Lane",
                status=ShopStatus.ACTIVE
            ),
            current_seller=seller,
            db=self.db
        )
        self.assertEqual(shop.shop_name, "Sarah's Ceramics")

        # Get my shop
        my_shop = get_my_shop(current_seller=seller, db=self.db)
        self.assertEqual(my_shop.id, shop.id)

        # Update my shop
        updated = update_my_shop(
            shop_in=ShopUpdate(description="Handmade pottery & vases"),
            current_seller=seller,
            db=self.db
        )
        self.assertEqual(updated.description, "Handmade pottery & vases")

        # Get shop by ID (public)
        public_shop = get_shop_by_id(shop_id=shop.id, db=self.db)
        self.assertEqual(public_shop.id, shop.id)

    def test_04_product_routes(self):
        """Test product routes: create, list, get, update, archive."""
        from app.models.user import User
        seller = self.db.query(User).filter(User.email == "sarah@example.com").first()
        cat = self.db.query(Category).first()

        # Create Product
        prod = create_product(
            product_in=ProductCreate(
                name="Ceramic Mug",
                description="Glazed ceramic mug 350ml",
                price=Decimal("25.00"),
                stock_quantity=10,
                category_id=cat.id if cat else None
            ),
            current_seller=seller,
            db=self.db
        )
        self.assertEqual(prod.name, "Ceramic Mug")

        # List Products (public)
        catalog = list_products(
            search="ceramic",
            category_id=None,
            city=None,
            shop_id=None,
            page=1,
            limit=10,
            db=self.db
        )
        self.assertEqual(catalog.total, 1)

        # Get Product by ID (public)
        p = get_product(product_id=prod.id, db=self.db)
        self.assertEqual(p.id, prod.id)

        # Update Product (seller)
        up = update_product(
            product_id=prod.id,
            product_in=ProductUpdate(price=Decimal("28.00")),
            current_seller=seller,
            db=self.db
        )
        self.assertEqual(up.price, Decimal("28.00"))

        # Archive Product (seller)
        arch = archive_product(
            product_id=prod.id,
            current_seller=seller,
            db=self.db
        )
        self.assertFalse(arch.is_active)

        # Reactivate for order testing
        arch.is_active = True
        self.db.commit()

    def test_05_cart_routes(self):
        """Test cart routes: get, add, update, remove."""
        from app.models.user import User
        from app.models.product import Product
        customer = self.db.query(User).filter(User.email == "carl@example.com").first()
        product = self.db.query(Product).first()

        # Add to cart
        c = add_cart_item(
            item_in=CartItemAdd(product_id=product.id, quantity=2),
            current_customer=customer,
            db=self.db
        )
        self.assertEqual(c.total_items, 2)
        self.assertEqual(c.subtotal, Decimal("56.00"))

        # View cart
        cart_view = get_cart(current_customer=customer, db=self.db)
        self.assertEqual(cart_view.total_items, 2)

        # Update quantity
        item_id = cart_view.items[0].id
        c_up = update_cart_item(
            item_id=item_id,
            item_in=CartItemUpdate(quantity=3),
            current_customer=customer,
            db=self.db
        )
        self.assertEqual(c_up.total_items, 3)

    def test_06_order_and_dashboard_routes(self):
        """Test checkout, customer orders, seller orders, order status, and dashboard."""
        from app.models.user import User
        customer = self.db.query(User).filter(User.email == "carl@example.com").first()
        seller = self.db.query(User).filter(User.email == "sarah@example.com").first()

        # Checkout
        ord_res = checkout(
            checkout_in=OrderCreate(
                delivery_name="Carl Customer",
                delivery_phone="4445556666",
                delivery_address="321 Oak St",
                delivery_city="Portland",
                delivery_state="Oregon",
                delivery_pincode="97201",
                payment_method=PaymentMethod.COD
            ),
            current_customer=customer,
            db=self.db
        )
        self.assertEqual(ord_res.status, "PLACED")
        self.assertEqual(ord_res.subtotal, Decimal("84.00"))

        # Customer Order History
        my_ords = get_my_orders(current_customer=customer, db=self.db)
        self.assertEqual(len(my_ords), 1)

        # Seller Incoming Orders
        seller_ords = get_seller_orders(current_seller=seller, db=self.db)
        self.assertEqual(len(seller_ords), 1)

        # Update Order Status (Seller accepts order)
        updated_ord = update_order_status(
            order_id=ord_res.id,
            status_in=OrderStatusUpdate(status=OrderStatus.ACCEPTED),
            current_seller=seller,
            db=self.db
        )
        self.assertEqual(updated_ord.status, "ACCEPTED")

        # Seller Dashboard
        dashboard = get_seller_dashboard(current_seller=seller, db=self.db)
        self.assertEqual(dashboard.total_products, 1)
        self.assertEqual(dashboard.active_products, 1)
        self.assertEqual(dashboard.total_orders, 1)
        self.assertEqual(dashboard.pending_orders, 1)
        self.assertEqual(dashboard.total_sales, Decimal("84.00"))


if __name__ == "__main__":
    unittest.main()
