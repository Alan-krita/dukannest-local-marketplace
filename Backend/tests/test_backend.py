import sys
import unittest
import uuid
from decimal import Decimal
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
import app.models  # load all models
from app.models.user import User
from app.models.shop import Shop
from app.models.category import Category
from app.models.product import Product
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.order import Order
from app.models.order_item import OrderItem

from app.schemas.user import UserRegister, UserLogin, UserRole
from app.schemas.shop import ShopCreate, ShopUpdate, ShopStatus
from app.schemas.product import ProductCreate, ProductUpdate
from app.schemas.cart import CartItemAdd, CartItemUpdate
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderStatus, PaymentMethod
from app.services.auth_service import AuthService
from app.services.shop_service import ShopService
from app.services.product_service import ProductService
from app.services.cart_service import CartService
from app.services.order_service import OrderService
from app.services.dashboard_service import DashboardService
from app.core.security import verify_password, decode_access_token


class LocalSellerMarketplaceTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create an in-memory SQLite database with single connection pool for transaction testing
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

    def test_01_user_registration_and_authentication(self):
        """Test registration of Customer and Seller, duplicate checks, and login."""
        # 1. Register Customer
        cust_in = UserRegister(
            full_name="Alice Customer",
            email="alice@example.com",
            password="securepassword123",
            phone="9876543210",
            role=UserRole.CUSTOMER
        )
        customer = AuthService.register_user(self.db, cust_in)
        self.assertIsNotNone(customer.id)
        self.assertEqual(customer.role, "CUSTOMER")
        self.assertTrue(customer.is_active)
        self.assertTrue(verify_password("securepassword123", customer.password_hash))

        # Check cart auto-created
        cart = self.db.query(Cart).filter(Cart.customer_user_id == customer.id).first()
        self.assertIsNotNone(cart)

        # 2. Register Seller
        seller_in = UserRegister(
            full_name="Bob Seller",
            email="bob@example.com",
            password="sellerpassword123",
            phone="9876543211",
            role=UserRole.SELLER
        )
        seller = AuthService.register_user(self.db, seller_in)
        self.assertIsNotNone(seller.id)
        self.assertEqual(seller.role, "SELLER")

        # 3. Duplicate email check
        with self.assertRaises(HTTPException) as ctx:
            AuthService.register_user(self.db, cust_in)
        self.assertEqual(ctx.exception.status_code, 409)

        # 4. Successful login
        login_in = UserLogin(email="alice@example.com", password="securepassword123")
        auth_cust = AuthService.authenticate_user(self.db, login_in)
        self.assertEqual(auth_cust.id, customer.id)

        token_resp = AuthService.create_token_response(auth_cust)
        self.assertIsNotNone(token_resp.access_token)
        payload = decode_access_token(token_resp.access_token)
        self.assertEqual(payload["sub"], str(customer.id))
        self.assertEqual(payload["role"], "CUSTOMER")

        # 5. Bad password login
        bad_login = UserLogin(email="alice@example.com", password="wrongpassword")
        with self.assertRaises(HTTPException) as ctx:
            AuthService.authenticate_user(self.db, bad_login)
        self.assertEqual(ctx.exception.status_code, 401)

    def test_02_shop_management(self):
        """Test shop creation, one shop per seller rule, and updates."""
        seller = self.db.query(User).filter(User.email == "bob@example.com").first()

        shop_in = ShopCreate(
            shop_name="Bob's Organic Bakery",
            description="Freshly baked artisan breads and treats",
            locality="Downtown",
            city="Springfield",
            state="Illinois",
            pincode="62701",
            address="123 Main St",
            status=ShopStatus.ACTIVE
        )
        shop = ShopService.create_shop(self.db, seller, shop_in)
        self.assertIsNotNone(shop.id)
        self.assertEqual(shop.status, "ACTIVE")
        self.assertEqual(shop.owner_user_id, seller.id)

        # Rule: One seller can own only one shop
        with self.assertRaises(HTTPException) as ctx:
            ShopService.create_shop(self.db, seller, shop_in)
        self.assertEqual(ctx.exception.status_code, 409)

        # Update shop
        update_in = ShopUpdate(description="Updated bakery description")
        updated_shop = ShopService.update_seller_shop(self.db, seller, update_in)
        self.assertEqual(updated_shop.description, "Updated bakery description")

    def test_03_product_management(self):
        """Test product creation, filtering, update ownership, and archiving."""
        seller = self.db.query(User).filter(User.email == "bob@example.com").first()

        # Create category
        category = Category(name="Bakery", slug="bakery", is_active=True)
        self.db.add(category)
        self.db.commit()

        # Create Product
        prod_in = ProductCreate(
            name="Sourdough Bread",
            description="Rustic naturally leavened sourdough loaf",
            price=Decimal("45.50"),
            stock_quantity=15,
            sku="BREAD-001",
            category_id=category.id
        )
        product = ProductService.create_product(self.db, seller, prod_in)
        self.assertIsNotNone(product.id)
        self.assertEqual(product.price, Decimal("45.50"))
        self.assertEqual(product.stock_quantity, 15)

        # List products
        catalog = ProductService.list_products(self.db, search="sourdough")
        self.assertEqual(catalog.total, 1)
        self.assertEqual(catalog.items[0].name, "Sourdough Bread")

        # Another seller trying to update Bob's product should be forbidden
        seller2_in = UserRegister(
            full_name="Charlie Seller",
            email="charlie@example.com",
            password="password123",
            role=UserRole.SELLER
        )
        seller2 = AuthService.register_user(self.db, seller2_in)
        shop2 = ShopService.create_shop(self.db, seller2, ShopCreate(shop_name="Charlie's Cafe"))

        with self.assertRaises(HTTPException) as ctx:
            ProductService.update_product(
                self.db, seller2, product.id,
                ProductUpdate(name="Hacked Name")
            )
        self.assertEqual(ctx.exception.status_code, 403)

        # Archive product (DELETE)
        archived = ProductService.archive_product(self.db, seller, product.id)
        self.assertFalse(archived.is_active)

        # Restore product active for cart & order tests
        archived.is_active = True
        self.db.commit()

    def test_04_cart_operations(self):
        """Test adding items, stock constraints, quantity updates, and subtotal."""
        customer = self.db.query(User).filter(User.email == "alice@example.com").first()
        product = self.db.query(Product).filter(Product.name == "Sourdough Bread").first()

        # Add item to cart
        cart_resp = CartService.add_item_to_cart(
            self.db, customer,
            CartItemAdd(product_id=product.id, quantity=2)
        )
        self.assertEqual(cart_resp.total_items, 2)
        self.assertEqual(cart_resp.subtotal, Decimal("91.00"))

        # Add more: quantity exceeds available stock (15)
        with self.assertRaises(HTTPException) as ctx:
            CartService.add_item_to_cart(
                self.db, customer,
                CartItemAdd(product_id=product.id, quantity=20)
            )
        self.assertEqual(ctx.exception.status_code, 400)

        # Update cart item quantity
        item_id = cart_resp.items[0].id
        updated_cart = CartService.update_cart_item(
            self.db, customer, item_id,
            CartItemUpdate(quantity=3)
        )
        self.assertEqual(updated_cart.total_items, 3)
        self.assertEqual(updated_cart.subtotal, Decimal("136.50"))

    def test_05_checkout_and_order_lifecycle(self):
        """Test atomic checkout, stock reduction, order tracking, and lifecycle status transitions."""
        customer = self.db.query(User).filter(User.email == "alice@example.com").first()
        seller = self.db.query(User).filter(User.email == "bob@example.com").first()
        product = self.db.query(Product).filter(Product.name == "Sourdough Bread").first()

        initial_stock = product.stock_quantity  # 15
        cart_quantity = 3

        order_in = OrderCreate(
            delivery_name="Alice Customer",
            delivery_phone="9876543210",
            delivery_address="456 Elm Street, Apt 2B",
            delivery_city="Springfield",
            delivery_state="Illinois",
            delivery_pincode="62701",
            payment_method=PaymentMethod.COD
        )

        order = OrderService.checkout(self.db, customer, order_in)
        self.assertIsNotNone(order.id)
        self.assertEqual(order.status, "PLACED")
        self.assertEqual(order.subtotal, Decimal("136.50"))
        self.assertEqual(order.total_amount, Decimal("136.50"))
        self.assertTrue(order.order_number.startswith("ORD-"))

        # Check stock reduced safely
        self.db.refresh(product)
        self.assertEqual(product.stock_quantity, initial_stock - cart_quantity)  # 12

        # Check customer cart cleared
        cart = CartService.get_cart_details(self.db, customer)
        self.assertEqual(cart.total_items, 0)

        # Seller views incoming orders
        seller_orders = OrderService.get_seller_orders(self.db, seller)
        self.assertTrue(any(o.id == order.id for o in seller_orders))

        # Lifecycle Status Transitions:
        # PLACED -> ACCEPTED
        order = OrderService.update_order_status(
            self.db, seller, order.id,
            OrderStatusUpdate(status=OrderStatus.ACCEPTED)
        )
        self.assertEqual(order.status, "ACCEPTED")

        # ACCEPTED -> PACKED
        order = OrderService.update_order_status(
            self.db, seller, order.id,
            OrderStatusUpdate(status=OrderStatus.PACKED)
        )
        self.assertEqual(order.status, "PACKED")

        # Invalid Transition (PACKED -> DELIVERED directly without SHIPPED)
        with self.assertRaises(HTTPException) as ctx:
            OrderService.update_order_status(
                self.db, seller, order.id,
                OrderStatusUpdate(status=OrderStatus.DELIVERED)
            )
        self.assertEqual(ctx.exception.status_code, 400)

        # PACKED -> SHIPPED
        order = OrderService.update_order_status(
            self.db, seller, order.id,
            OrderStatusUpdate(status=OrderStatus.SHIPPED)
        )
        self.assertEqual(order.status, "SHIPPED")

        # SHIPPED -> DELIVERED
        order = OrderService.update_order_status(
            self.db, seller, order.id,
            OrderStatusUpdate(status=OrderStatus.DELIVERED)
        )
        self.assertEqual(order.status, "DELIVERED")
        self.assertEqual(order.payment_status, "PAID")  # COD marked PAID on delivery

    def test_06_seller_dashboard_metrics(self):
        """Test seller dashboard metrics calculation."""
        seller = self.db.query(User).filter(User.email == "bob@example.com").first()
        metrics = DashboardService.get_seller_metrics(self.db, seller)

        self.assertEqual(metrics.total_products, 1)
        self.assertEqual(metrics.active_products, 1)
        self.assertEqual(metrics.total_orders, 1)
        self.assertEqual(metrics.delivered_orders, 1)
        self.assertEqual(metrics.pending_orders, 0)
        self.assertEqual(metrics.total_sales, Decimal("136.50"))


if __name__ == "__main__":
    unittest.main()
