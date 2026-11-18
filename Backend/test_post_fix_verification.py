import os
import sys
import time
import uuid
from decimal import Decimal

project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from app.db.session import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.shop import Shop
from app.models.order import Order
from app.schemas.user import UserRegister, UserRole
from app.schemas.shop import ShopCreate, ShopUpdate, ShopStatus
from app.schemas.product import ProductCreate, ProductUpdate
from app.schemas.cart import CartItemAdd
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderStatus, PaymentMethod

from app.routes.auth import register
from app.routes.shops import create_shop, get_my_shop, update_my_shop
from app.routes.products import create_product, update_product, archive_product, list_products
from app.routes.cart import add_cart_item
from app.routes.orders import checkout, get_my_orders, get_seller_orders, update_order_status
from app.routes.dashboard import get_seller_dashboard

def run_post_fix_verification():
    print("=" * 75)
    print("RUNNING POST-FIX INTEGRATION VERIFICATION")
    print("=" * 75)
    db = SessionLocal()
    ts = int(time.time())
    results = {"passed": [], "failed": []}

    try:
        # STEP 1: Register Seller
        print("\n--- 1. SELLER REGISTRATION & AUTH ---")
        seller_in = UserRegister(
            full_name=f"Verified Artisan {ts}",
            email=f"artisan_{ts}@example.com",
            password="ArtisanPassword123!",
            phone=f"+91987{str(ts)[-7:]}",
            role=UserRole.SELLER
        )
        seller = register(user_in=seller_in, db=db)
        print(f"  [PASS] Seller created: ID={seller.id}")
        results["passed"].append("Seller Registration")

        # STEP 2: Shop Creation with shop_name and ACTIVE/DRAFT status
        print("\n--- 2. SHOP CREATION WITH shop_name & STATUS ---")
        shop_in = ShopCreate(
            shop_name=f"Vrindavan Artifacts {ts}",
            description="Handmade devotional artifacts and candles",
            city="Mathura",
            address="45 Raman Reti, Vrindavan",
            status=ShopStatus.ACTIVE
        )
        shop = create_shop(shop_in=shop_in, current_seller=seller, db=db)
        assert shop.shop_name == f"Vrindavan Artifacts {ts}"
        assert shop.status == "ACTIVE"
        print(f"  [PASS] Shop created with shop_name='{shop.shop_name}', status='{shop.status}'")

        # Test Shop Update to DRAFT and back to ACTIVE
        update_in = ShopUpdate(
            shop_name=f"Vrindavan Artifacts & Crafts {ts}",
            status=ShopStatus.DRAFT
        )
        updated_shop = update_my_shop(shop_in=update_in, current_seller=seller, db=db)
        assert updated_shop.status == "DRAFT"
        assert updated_shop.shop_name == f"Vrindavan Artifacts & Crafts {ts}"
        print(f"  [PASS] Shop updated to DRAFT: '{updated_shop.shop_name}'")

        update_in2 = ShopUpdate(status=ShopStatus.ACTIVE)
        updated_shop2 = update_my_shop(shop_in=update_in2, current_seller=seller, db=db)
        assert updated_shop2.status == "ACTIVE"
        print(f"  [PASS] Shop returned to ACTIVE: '{updated_shop2.status}'")
        results["passed"].append("Shop Creation & Status Management (shop_name, ACTIVE/DRAFT)")

        # STEP 3: Product Creation with UUID Category String
        print("\n--- 3. PRODUCT CREATION WITH UUID CATEGORY ---")
        cat = db.query(Category).first()
        if not cat:
            cat = Category(name="Handmade Decor", slug=f"handmade-decor-{ts}")
            db.add(cat)
            db.commit()
            db.refresh(cat)

        uuid_category_str = str(cat.id)  # Simulates form.category_id as UUID string without parseInt
        print(f"  [INFO] Passing category_id as original UUID string: {uuid_category_str}")
        
        prod_in = ProductCreate(
            name=f"Brass Diya Lamp {ts}",
            description="Hand-carved brass oil lamp with floral engravings",
            price=Decimal("349.00"),
            stock_quantity=60,
            category_id=uuid.UUID(uuid_category_str),
            sku=f"LAMP-{ts}"
        )
        product = create_product(product_in=prod_in, current_seller=seller, db=db)
        assert product.category_id == cat.id
        assert product.name == f"Brass Diya Lamp {ts}"
        assert product.stock_quantity == 60
        print(f"  [PASS] Product created with UUID category: ID={product.id}, Cat={product.category_id}")
        results["passed"].append("Product Creation with UUID Category")

        # STEP 4: Product Editing and Archiving
        print("\n--- 4. PRODUCT EDITING AND ARCHIVING ---")
        edit_in = ProductUpdate(
            price=Decimal("399.00"),
            stock_quantity=55,
            description="Updated: Solid brass engraved lamp with 60-hour burn capacity"
        )
        edited_prod = update_product(product_id=product.id, product_in=edit_in, current_seller=seller, db=db)
        assert edited_prod.price == Decimal("399.00")
        assert edited_prod.stock_quantity == 55
        print(f"  [PASS] Product edited: price=₹{edited_prod.price}, stock={edited_prod.stock_quantity}")

        # Create temporary product to archive
        temp_prod_in = ProductCreate(
            name=f"Seasonal Incense {ts}",
            description="Limited run incense",
            price=Decimal("99.00"),
            stock_quantity=20,
            category_id=cat.id
        )
        temp_prod = create_product(product_in=temp_prod_in, current_seller=seller, db=db)
        archived_prod = archive_product(product_id=temp_prod.id, current_seller=seller, db=db)
        assert archived_prod.is_active is False
        print(f"  [PASS] Product archived: ID={archived_prod.id}, is_active={archived_prod.is_active}")

        # Catalog listing check (archived must not appear)
        catalog = list_products(search=f"Seasonal Incense {ts}", category_id=None, city=None, shop_id=None, page=1, limit=10, db=db)
        assert len(catalog.items) == 0
        print(f"  [PASS] Verified archived product excluded from active customer catalog")
        results["passed"].append("Product Editing & Soft Archiving")

        # STEP 5: Seller Order Listing & Status Updates
        print("\n--- 5. SELLER ORDER LISTING & STATUS UPDATES ---")
        # Register a customer to place an order
        customer_in = UserRegister(
            full_name=f"Vrindavan Devotee {ts}",
            email=f"devotee_{ts}@example.com",
            password="DevoteePassword123!",
            phone=f"+91986{str(ts)[-7:]}",
            role=UserRole.CUSTOMER
        )
        customer = register(user_in=customer_in, db=db)

        # Add 2 items to customer cart and checkout
        add_cart_item(item_in=CartItemAdd(product_id=product.id, quantity=2), current_customer=customer, db=db)

        order_in = OrderCreate(
            delivery_name="Radha Krishna Temple Trust",
            delivery_phone="+919876543210",
            delivery_address="Parikrama Marg, Raman Reti",
            delivery_city="Mathura",
            delivery_state="Uttar Pradesh",
            delivery_pincode="281001",
            payment_method=PaymentMethod.COD
        )
        order = checkout(checkout_in=order_in, current_customer=customer, db=db)
        print(f"  [PASS] Customer placed order #{order.order_number}: Total=₹{order.total_amount}")

        # Seller queries incoming orders
        seller_orders = get_seller_orders(current_seller=seller, db=db)
        assert len(seller_orders) >= 1
        found_order = next((o for o in seller_orders if o.id == order.id), None)
        assert found_order is not None
        print(f"  [PASS] Seller received order #{found_order.order_number}")

        # Verify snapshots
        first_item = found_order.items[0]
        assert first_item.product_name_snapshot == f"Brass Diya Lamp {ts}"
        assert first_item.line_total == Decimal("798.00")
        print(f"  [PASS] Snapshot keys verified: product_name_snapshot='{first_item.product_name_snapshot}', line_total=₹{first_item.line_total}")

        # Cycle status through PLACED -> ACCEPTED -> PACKED -> SHIPPED -> DELIVERED
        lifecycle = [
            OrderStatus.ACCEPTED,
            OrderStatus.PACKED,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED
        ]
        for next_st in lifecycle:
            updated_ord = update_order_status(
                order_id=found_order.id,
                status_in=OrderStatusUpdate(status=next_st),
                current_seller=seller,
                db=db
            )
            assert updated_ord.status == next_st
            print(f"  [PASS] Order transitioned to '{updated_ord.status}'")

        results["passed"].append("Seller Order Listing, Snapshots & Status Lifecycle")

        # STEP 6: Seller Dashboard Live Data & Zero Values
        print("\n--- 6. SELLER DASHBOARD LIVE METRICS ---")
        dash = get_seller_dashboard(current_seller=seller, db=db)
        print(f"  [INFO] Live Dashboard Metrics:")
        print(f"      - total_products: {dash.total_products}")
        print(f"      - active_products: {dash.active_products}")
        print(f"      - total_orders: {dash.total_orders}")
        print(f"      - pending_orders: {dash.pending_orders}")
        print(f"      - total_sales: ₹{dash.total_sales}")
        assert dash.total_products >= 2
        assert dash.active_products >= 1
        assert dash.total_orders >= 1
        assert dash.total_sales >= Decimal("798.00")
        print(f"  [PASS] Dashboard metrics confirmed against live DB data")
        results["passed"].append("Seller Dashboard Live Data Verification")

        # STEP 7: Customer Order History Synchronization
        print("\n--- 7. CUSTOMER ORDER HISTORY VERIFICATION ---")
        customer_orders = get_my_orders(current_customer=customer, db=db)
        cust_order = next((o for o in customer_orders if o.id == order.id), None)
        assert cust_order is not None
        assert cust_order.status == OrderStatus.DELIVERED
        assert cust_order.items[0].product_name_snapshot == f"Brass Diya Lamp {ts}"
        assert cust_order.items[0].line_total == Decimal("798.00")
        print(f"  [PASS] Customer order history verified: #{cust_order.order_number} is '{cust_order.status}'")
        results["passed"].append("Customer Order History Verification")

        print("\n" + "=" * 75)
        print(f"POST-FIX VERIFICATION: ALL {len(results['passed'])} TESTS PASSED (0 FAILED)")
        print("=" * 75)

    finally:
        db.close()

    return results

if __name__ == "__main__":
    run_post_fix_verification()
