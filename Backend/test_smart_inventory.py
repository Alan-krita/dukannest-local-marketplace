import sys
import time
import uuid
from decimal import Decimal
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from fastapi import HTTPException
from app.db.session import SessionLocal
from app.models.user import User
from app.models.shop import Shop
from app.models.category import Category
from app.models.product import Product

from app.schemas.user import UserRegister, UserLogin, UserRole
from app.schemas.shop import ShopCreate
from app.schemas.product import ProductCreate, ProductUpdate

from app.routes.auth import register, login
from app.routes.shops import create_shop, get_my_shop
from app.routes.products import create_product, update_product
from app.routes.dashboard import get_seller_dashboard


def run_inventory_verification():
    print("=" * 80)
    print("LOCALMART SMART INVENTORY & LOW-STOCK ALERTS VERIFICATION TEST SUITE")
    print("=" * 80)

    db = SessionLocal()
    tests_passed = 0
    tests_total = 0

    def assert_test(condition, test_name, detail=""):
        nonlocal tests_passed, tests_total
        tests_total += 1
        if condition:
            tests_passed += 1
            print(f"  [PASS] {test_name} {detail}")
        else:
            print(f"  [FAIL] {test_name} {detail}")
            raise AssertionError(f"Test failed: {test_name} - {detail}")

    try:
        ts = int(time.time())

        # -------------------------------------------------------------
        # STEP 1: Setup Seller A and Seller Shop A
        # -------------------------------------------------------------
        print("\n--- 1. Setting up Seller A & Shop A ---")
        seller_a_email = f"seller_inv_a_{ts}@example.com"
        seller_a_reg = UserRegister(
            full_name=f"Artisan Inventory Tester A {ts}",
            email=seller_a_email,
            password="SecurePassword123!",
            phone=f"+91981{str(ts)[-7:]}",
            role=UserRole.SELLER,
        )
        user_a_resp = register(seller_a_reg, db=db)
        seller_a = db.query(User).filter(User.id == user_a_resp.id).first()
        assert_test(seller_a is not None, "Seller A registered in DB")

        shop_a_create = ShopCreate(
            shop_name=f"Mathura Brass & Decor {ts}",
            description="Traditional handcrafted brass lamps and decor.",
            category="Home & Decor",
            locality="Holi Gate",
            city="Mathura",
            state="Uttar Pradesh",
            pincode="281001",
            address="108 Temple Road",
        )
        shop_a_resp = create_shop(shop_a_create, current_seller=seller_a, db=db)
        assert_test(shop_a_resp is not None, f"Shop A created: {shop_a_resp.shop_name}")

        category = db.query(Category).first()
        cat_id = category.id if category else None

        # -------------------------------------------------------------
        # STEP 2: Create Test Products with Stock 0, 1, 5, and 10
        # -------------------------------------------------------------
        print("\n--- 2. Creating Products with Stock 0, 1, 5, 10 ---")
        p0 = create_product(
            ProductCreate(
                name="Brass Bell - Out of Stock",
                price=Decimal("150.00"),
                stock_quantity=0,
                category_id=cat_id,
                sku=f"SKU-0-{ts}"
            ),
            current_seller=seller_a,
            db=db
        )
        assert_test(p0.stock_quantity == 0, "Created Product with stock = 0 (Expected: Out of Stock)")

        p1 = create_product(
            ProductCreate(
                name="Brass Diya - Single Unit",
                price=Decimal("250.00"),
                stock_quantity=1,
                category_id=cat_id,
                sku=f"SKU-1-{ts}"
            ),
            current_seller=seller_a,
            db=db
        )
        assert_test(p1.stock_quantity == 1, "Created Product with stock = 1 (Expected: Low Stock)")

        p5 = create_product(
            ProductCreate(
                name="Handcrafted Idol - Boundary Unit",
                price=Decimal("550.00"),
                stock_quantity=5,
                category_id=cat_id,
                sku=f"SKU-5-{ts}"
            ),
            current_seller=seller_a,
            db=db
        )
        assert_test(p5.stock_quantity == 5, "Created Product with stock = 5 (Expected: Low Stock at Threshold)")

        p10 = create_product(
            ProductCreate(
                name="Aroma Incense Holder - Well Stocked",
                price=Decimal("199.00"),
                stock_quantity=10,
                category_id=cat_id,
                sku=f"SKU-10-{ts}"
            ),
            current_seller=seller_a,
            db=db
        )
        assert_test(p10.stock_quantity == 10, "Created Product with stock = 10 (Expected: In Stock)")

        # -------------------------------------------------------------
        # STEP 3: Verify Inventory Metrics & Alerts at Default Threshold (5)
        # -------------------------------------------------------------
        print("\n--- 3. Verifying Inventory Classification at Default Threshold (5) ---")
        dash_default = get_seller_dashboard(
            low_stock_threshold=5,
            current_seller=seller_a,
            db=db
        )

        assert_test(dash_default.total_products == 4, "Total products count is 4", f"(Got: {dash_default.total_products})")
        assert_test(dash_default.in_stock_products == 1, "In Stock count (>5 units) is 1", f"(Got: {dash_default.in_stock_products})")
        assert_test(dash_default.low_stock_products == 2, "Low Stock count (1-5 units) is 2", f"(Got: {dash_default.low_stock_products})")
        assert_test(dash_default.out_of_stock_products == 1, "Out of Stock count (0 units) is 1", f"(Got: {dash_default.out_of_stock_products})")
        assert_test(dash_default.low_stock_threshold == 5, "Default threshold is 5", f"(Got: {dash_default.low_stock_threshold})")

        # Verify low_stock_items list
        alert_ids = [str(item.id) for item in dash_default.low_stock_items]
        assert_test(len(alert_ids) == 3, "Low Stock alerted items count is 3", f"(Got: {len(alert_ids)})")
        assert_test(str(p0.id) == alert_ids[0], "Product with 0 stock appears first in alerts list")
        assert_test(str(p1.id) in alert_ids, "Product with 1 stock is included in alerts")
        assert_test(str(p5.id) in alert_ids, "Product with 5 stock (boundary) is included in alerts")
        assert_test(str(p10.id) not in alert_ids, "Product with 10 stock is NOT in alerts list")

        # -------------------------------------------------------------
        # STEP 4: Verify Dynamic Threshold Configuration (1 and 10)
        # -------------------------------------------------------------
        print("\n--- 4. Verifying Dynamic Threshold Configuration ---")
        # Threshold = 1: only stock <= 1 flagged
        dash_t1 = get_seller_dashboard(
            low_stock_threshold=1,
            current_seller=seller_a,
            db=db
        )
        assert_test(dash_t1.low_stock_threshold == 1, "Threshold 1 applied")
        assert_test(dash_t1.in_stock_products == 2, "In Stock products (>1) is 2 (stock 5, 10)", f"(Got: {dash_t1.in_stock_products})")
        assert_test(dash_t1.low_stock_products == 1, "Low Stock products (==1) is 1 (stock 1)", f"(Got: {dash_t1.low_stock_products})")
        assert_test(dash_t1.out_of_stock_products == 1, "Out of Stock products is 1 (stock 0)", f"(Got: {dash_t1.out_of_stock_products})")
        assert_test(len(dash_t1.low_stock_items) == 2, "Alerted items at threshold 1 has 2 items", f"(Got: {len(dash_t1.low_stock_items)})")

        # Threshold = 10: stock 0, 1, 5, 10 all flagged
        dash_t10 = get_seller_dashboard(
            low_stock_threshold=10,
            current_seller=seller_a,
            db=db
        )
        assert_test(dash_t10.low_stock_threshold == 10, "Threshold 10 applied")
        assert_test(dash_t10.in_stock_products == 0, "In Stock products (>10) is 0", f"(Got: {dash_t10.in_stock_products})")
        assert_test(dash_t10.low_stock_products == 3, "Low Stock products (1-10) is 3", f"(Got: {dash_t10.low_stock_products})")
        assert_test(dash_t10.out_of_stock_products == 1, "Out of Stock products is 1", f"(Got: {dash_t10.out_of_stock_products})")
        assert_test(len(dash_t10.low_stock_items) == 4, "Alerted items at threshold 10 has 4 items", f"(Got: {len(dash_t10.low_stock_items)})")

        # -------------------------------------------------------------
        # STEP 5: Verify Stock Updates Reflect Immediately in Dashboard
        # -------------------------------------------------------------
        print("\n--- 5. Verifying Stock Update Immediate Reflection ---")
        # Restock p0 (0 -> 25)
        update_product(
            product_id=p0.id,
            product_in=ProductUpdate(stock_quantity=25),
            current_seller=seller_a,
            db=db
        )
        dash_after_restock = get_seller_dashboard(
            low_stock_threshold=5,
            current_seller=seller_a,
            db=db
        )
        assert_test(dash_after_restock.out_of_stock_products == 0, "Out of stock products dropped from 1 to 0 after restock")
        assert_test(dash_after_restock.in_stock_products == 2, "In stock products increased from 1 to 2 (stock 25, 10)")
        new_alert_ids = [str(item.id) for item in dash_after_restock.low_stock_items]
        assert_test(str(p0.id) not in new_alert_ids, "Restocked product p0 removed from low stock alerts list")

        # Deplete p10 (10 -> 0)
        update_product(
            product_id=p10.id,
            product_in=ProductUpdate(stock_quantity=0),
            current_seller=seller_a,
            db=db
        )
        dash_after_deplete = get_seller_dashboard(
            low_stock_threshold=5,
            current_seller=seller_a,
            db=db
        )
        assert_test(dash_after_deplete.out_of_stock_products == 1, "Out of stock products increased to 1 after depletion")
        depleted_alert_ids = [str(item.id) for item in dash_after_deplete.low_stock_items]
        assert_test(str(p10.id) == depleted_alert_ids[0], "Depleted product p10 is now first in alerts list")

        # -------------------------------------------------------------
        # STEP 6: Multi-Tenant Cross-Seller Inventory Isolation
        # -------------------------------------------------------------
        print("\n--- 6. Verifying Multi-Tenant Cross-Seller Isolation ---")
        seller_b_email = f"seller_inv_b_{ts}@example.com"
        seller_b_reg = UserRegister(
            full_name=f"Seller B Isolated Tester {ts}",
            email=seller_b_email,
            password="SecurePassword123!",
            phone=f"+91982{str(ts)[-7:]}",
            role=UserRole.SELLER,
        )
        user_b_resp = register(seller_b_reg, db=db)
        seller_b = db.query(User).filter(User.id == user_b_resp.id).first()

        shop_b_create = ShopCreate(
            shop_name=f"Seller B Unique Shop {ts}",
            description="Seller B goods.",
            category="Handmade",
            locality="Chowk",
            city="Varanasi",
            state="Uttar Pradesh",
            pincode="221001",
            address="12 Silk Street",
        )
        create_shop(shop_b_create, current_seller=seller_b, db=db)

        # Seller B adds 1 product with stock 0
        pb0 = create_product(
            ProductCreate(
                name="Seller B Silk Scarf - Out of Stock",
                price=Decimal("999.00"),
                stock_quantity=0,
                category_id=cat_id,
                sku=f"SKU-B0-{ts}"
            ),
            current_seller=seller_b,
            db=db
        )

        # Check Seller B dashboard
        dash_b = get_seller_dashboard(
            low_stock_threshold=5,
            current_seller=seller_b,
            db=db
        )
        assert_test(dash_b.total_products == 1, "Seller B sees only their 1 product", f"(Got: {dash_b.total_products})")
        assert_test(dash_b.out_of_stock_products == 1, "Seller B sees only their 1 out-of-stock product")
        assert_test(len(dash_b.low_stock_items) == 1, "Seller B alert list contains exactly 1 product")
        assert_test(str(dash_b.low_stock_items[0].id) == str(pb0.id), "Seller B alert item is pb0")

        # Check Seller A dashboard does NOT contain pb0
        dash_a_check = get_seller_dashboard(
            low_stock_threshold=5,
            current_seller=seller_a,
            db=db
        )
        alert_a_ids = [str(item.id) for item in dash_a_check.low_stock_items]
        assert_test(str(pb0.id) not in alert_a_ids, "Seller B's product pb0 is NOT present in Seller A's alerts")
        assert_test(dash_a_check.total_products == 4, "Seller A total products unchanged at 4")

        # Seller B attempting to edit Seller A's product must be denied (403 Forbidden)
        try:
            update_product(
                product_id=p5.id,
                product_in=ProductUpdate(stock_quantity=99),
                current_seller=seller_b,
                db=db
            )
            assert_test(False, "Unauthorized stock update prevented (Expected 403 HTTPException)")
        except HTTPException as e:
            assert_test(e.status_code == 403, f"Unauthorized stock update blocked with HTTP {e.status_code} ({e.detail})")

        print("\n" + "=" * 80)
        print(f"ALL {tests_passed}/{tests_total} VERIFICATION CHECKS PASSED SUCCESSFULLY!")
        print("=" * 80)

    finally:
        db.close()


if __name__ == "__main__":
    run_inventory_verification()
