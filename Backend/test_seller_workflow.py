import sys
import uuid
import time
from pathlib import Path
from decimal import Decimal

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from fastapi import HTTPException
from app.db.session import SessionLocal
from app.models.user import User
from app.models.shop import Shop
from app.models.category import Category
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem

from app.schemas.user import UserRegister, UserLogin, UserRole
from app.schemas.shop import ShopCreate, ShopUpdate, ShopStatus
from app.schemas.product import ProductCreate, ProductUpdate
from app.schemas.cart import CartItemAdd
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderStatus, PaymentMethod

from app.routes.auth import register, login, get_current_user_profile
from app.routes.shops import create_shop, get_my_shop, update_my_shop, get_shop_by_id
from app.routes.products import create_product, list_products, get_product, update_product, archive_product
from app.routes.cart import add_cart_item
from app.routes.orders import checkout, get_my_orders, get_seller_orders, update_order_status
from app.routes.dashboard import get_seller_dashboard


def run_seller_workflow_test():
    print("=" * 75)
    print("LOCALMART END-TO-END SELLER WORKFLOW & SECURITY VERIFICATION")
    print("=" * 75)

    db = SessionLocal()
    results = {
        "passed": [],
        "failed": [],
        "bugs": []
    }

    try:
        ts = int(time.time())

        # =====================================================================
        # 1. SELLER REGISTRATION AND LOGIN
        # =====================================================================
        print("\n--- 1. SELLER REGISTRATION AND LOGIN ---")
        seller_email = f"seller_flow_{ts}@example.com"
        seller_pwd = "SellerSecure123!"
        seller_phone = f"+91981{str(ts)[-7:]}"

        # 1.1 Register seller account
        try:
            seller_reg = UserRegister(
                full_name=f"Mathura Craft Artisan {ts}",
                email=seller_email,
                password=seller_pwd,
                phone=seller_phone,
                role=UserRole.SELLER
            )
            seller_user = register(user_in=seller_reg, db=db)
            assert seller_user.id is not None
            assert seller_user.role == "SELLER", f"Expected SELLER role, got {seller_user.role}"
            print(f"  [PASS] 1.1 Seller registered: ID={seller_user.id}, role={seller_user.role}")
            results["passed"].append("1.1 Seller Registration (role=SELLER)")
        except Exception as e:
            print(f"  [FAIL] 1.1 Seller registration failed: {e}")
            results["failed"].append(f"1.1 Seller Registration: {e}")
            return results

        # 1.2 Login and verify JWT
        try:
            login_data = login(user_in=UserLogin(email=seller_email, password=seller_pwd), db=db)
            assert login_data.access_token, "No access token"
            assert login_data.token_type.lower() == "bearer"
            assert login_data.user.role == "SELLER"
            print(f"  [PASS] 1.2 Seller login successful. JWT Bearer token issued ({len(login_data.access_token)} chars)")
            results["passed"].append("1.2 Seller Login & JWT Token Verification")
        except Exception as e:
            print(f"  [FAIL] 1.2 Seller login failed: {e}")
            results["failed"].append(f"1.2 Seller Login: {e}")

        # 1.3 Verify seller profile through API
        try:
            profile = get_current_user_profile(current_user=seller_user)
            assert profile.email == seller_email
            assert profile.role == "SELLER"
            print(f"  [PASS] 1.3 Profile API verified: name='{profile.full_name}', email='{profile.email}'")
            results["passed"].append("1.3 Seller Profile API (GET /auth/me)")
        except Exception as e:
            print(f"  [FAIL] 1.3 Profile API failed: {e}")
            results["failed"].append(f"1.3 Seller Profile API: {e}")

        # =====================================================================
        # 2. SHOP MANAGEMENT
        # =====================================================================
        print("\n--- 2. SHOP MANAGEMENT ---")
        shop_name = f"Aura Crafts {ts}"
        shop_desc = "Handmade artisanal soy candles & earthenware pottery"

        # 2.1 Create a seller shop
        try:
            shop_in = ShopCreate(
                shop_name=shop_name,
                description=shop_desc,
                category="Handmade",
                locality="Crafts Enclave",
                city="Mathura",
                state="Uttar Pradesh",
                pincode="281001",
                address="Plot 10, Crafts Enclave, Mathura",
                status=ShopStatus.ACTIVE
            )
            created_shop = create_shop(shop_in=shop_in, current_seller=seller_user, db=db)
            assert created_shop.id is not None
            assert created_shop.owner_user_id == seller_user.id
            assert created_shop.shop_name == shop_name
            assert created_shop.status == "ACTIVE"
            print(f"  [PASS] 2.1 Shop created: ID={created_shop.id}, name='{created_shop.shop_name}', status={created_shop.status}")
            results["passed"].append("2.1 Shop Creation (POST /shops)")
        except Exception as e:
            print(f"  [FAIL] 2.1 Shop creation failed: {e}")
            results["failed"].append(f"2.1 Shop Creation: {e}")
            return results

        # 2.2 Verify duplicate shop creation is prevented
        try:
            dup_shop_in = ShopCreate(shop_name="Second Shop", status=ShopStatus.ACTIVE)
            create_shop(shop_in=dup_shop_in, current_seller=seller_user, db=db)
            print("  [FAIL] 2.2 Seller allowed to create a second shop!")
            results["failed"].append("2.2 Duplicate shop check failed (allowed second shop)")
        except HTTPException as e:
            assert e.status_code == 409
            print(f"  [PASS] 2.2 Multiple shops per seller prevented (409 Conflict): '{e.detail}'")
            results["passed"].append("2.2 Single-shop restriction enforced (409)")

        # 2.3 Retrieve seller's own shop
        try:
            my_shop = get_my_shop(current_seller=seller_user, db=db)
            assert my_shop.id == created_shop.id
            assert my_shop.owner_user_id == seller_user.id
            print(f"  [PASS] 2.3 Retrieved own shop via GET /shops/mine: '{my_shop.shop_name}'")
            results["passed"].append("2.3 Get Own Shop (GET /shops/mine)")
        except Exception as e:
            print(f"  [FAIL] 2.3 Get own shop failed: {e}")
            results["failed"].append(f"2.3 Get Own Shop: {e}")

        # 2.4 Edit seller's own shop
        try:
            updated_desc = "Updated description: Certified local organic candle studio"
            shop_patch = ShopUpdate(description=updated_desc, city="Mathura Cantt")
            updated_shop = update_my_shop(shop_in=shop_patch, current_seller=seller_user, db=db)
            assert updated_shop.description == updated_desc
            assert updated_shop.city == "Mathura Cantt"
            print(f"  [PASS] 2.4 Updated shop via PATCH /shops/mine: city='{updated_shop.city}'")
            results["passed"].append("2.4 Update Own Shop (PATCH /shops/mine)")
        except Exception as e:
            print(f"  [FAIL] 2.4 Update shop failed: {e}")
            results["failed"].append(f"2.4 Update Own Shop: {e}")

        # 2.5 Verify public shop view
        try:
            pub_shop = get_shop_by_id(shop_id=created_shop.id, db=db)
            assert pub_shop.id == created_shop.id
            print(f"  [PASS] 2.5 Public shop endpoint verified: GET /shops/{created_shop.id}")
            results["passed"].append("2.5 Public Shop Details (GET /shops/{id})")
        except Exception as e:
            print(f"  [FAIL] 2.5 Public shop endpoint failed: {e}")
            results["failed"].append(f"2.5 Public Shop Details: {e}")

        # =====================================================================
        # 3. PRODUCT MANAGEMENT
        # =====================================================================
        print("\n--- 3. PRODUCT MANAGEMENT ---")
        # Ensure category exists
        cat = db.query(Category).first()
        if not cat:
            cat = Category(name="Handmade", slug="handmade", description="Handcrafted goods")
            db.add(cat)
            db.commit()
            db.refresh(cat)

        # 3.1 Add product
        try:
            prod_in = ProductCreate(
                name=f"Lavender Soy Wax Candle {ts}",
                description="Organic soothing aromatherapy candle poured by local artisans",
                price=Decimal("249.00"),
                stock_quantity=30,
                sku=f"CANDLE-{ts}",
                category_id=cat.id,
                image_url="/images/product_candle.jpg"
            )
            created_prod = create_product(product_in=prod_in, current_seller=seller_user, db=db)
            assert created_prod.id is not None
            assert created_prod.shop_id == created_shop.id, f"Product shop_id ({created_prod.shop_id}) does not match seller shop ({created_shop.id})"
            assert created_prod.stock_quantity == 30
            assert created_prod.price == Decimal("249.00")
            assert created_prod.is_active is True
            print(f"  [PASS] 3.1 Product created: ID={created_prod.id}, name='{created_prod.name}', associated with shop={created_prod.shop_id}")
            results["passed"].append("3.1 Product Creation (POST /products)")
        except Exception as e:
            print(f"  [FAIL] 3.1 Product creation failed: {e}")
            results["failed"].append(f"3.1 Product Creation: {e}")
            return results

        # 3.2 Edit product details and stock
        try:
            prod_patch = ProductUpdate(
                price=Decimal("229.00"),
                stock_quantity=45,
                description="Enhanced description with 40-hour burn time"
            )
            updated_prod = update_product(product_id=created_prod.id, product_in=prod_patch, current_seller=seller_user, db=db)
            assert updated_prod.price == Decimal("229.00")
            assert updated_prod.stock_quantity == 45
            print(f"  [PASS] 3.2 Product updated: new price=₹{updated_prod.price}, new stock={updated_prod.stock_quantity}")
            results["passed"].append("3.2 Product Update (PATCH /products/{id})")
        except Exception as e:
            print(f"  [FAIL] 3.2 Product update failed: {e}")
            results["failed"].append(f"3.2 Product Update: {e}")

        # 3.3 Create a second product to test archiving vs active catalog
        prod2_in = ProductCreate(
            name=f"Temporary Test Candle {ts}",
            description="To be archived",
            price=Decimal("99.00"),
            stock_quantity=10,
            category_id=cat.id
        )
        prod_to_archive = create_product(product_in=prod2_in, current_seller=seller_user, db=db)

        # 3.4 Archive product
        try:
            archived = archive_product(product_id=prod_to_archive.id, current_seller=seller_user, db=db)
            assert archived.is_active is False
            print(f"  [PASS] 3.4 Product archived via DELETE /products/{prod_to_archive.id}: is_active=False")
            results["passed"].append("3.4 Product Archive (DELETE /products/{id})")
        except Exception as e:
            print(f"  [FAIL] 3.4 Product archive failed: {e}")
            results["failed"].append(f"3.4 Product Archive: {e}")

        # 3.5 Verify archived product does NOT appear in public catalog
        try:
            public_catalog = list_products(search=f"Temporary Test Candle {ts}", category_id=None, city=None, shop_id=None, page=1, limit=10, db=db)
            archived_found = any(p.id == prod_to_archive.id for p in public_catalog.items)
            assert not archived_found, "Archived product appeared in public active catalog!"
            print("  [PASS] 3.5 Verified archived product is excluded from public search and catalog listings.")
            results["passed"].append("3.5 Archived products hidden from public catalog")
        except Exception as e:
            print(f"  [FAIL] 3.5 Catalog filter failed: {e}")
            results["failed"].append(f"3.5 Catalog filter: {e}")

        # =====================================================================
        # 4. ORDER MANAGEMENT
        # =====================================================================
        print("\n--- 4. ORDER MANAGEMENT ---")
        # 4.1 Place a real order as a customer for the seller's product
        customer_email = f"cust_order_{ts}@example.com"
        cust_reg = UserRegister(
            full_name="Rajesh Customer",
            email=customer_email,
            password="CustomerPassword123!",
            phone=f"+91982{str(ts)[-7:]}",
            role=UserRole.CUSTOMER
        )
        buyer_user = register(user_in=cust_reg, db=db)

        # Add 2 items of the seller's product to buyer's cart
        add_cart_item(item_in=CartItemAdd(product_id=created_prod.id, quantity=2), current_customer=buyer_user, db=db)

        # Checkout
        checkout_in = OrderCreate(
            delivery_name="Rajesh Customer",
            delivery_phone=cust_reg.phone,
            delivery_address="456 Civil Lines",
            delivery_city="Mathura",
            delivery_state="Uttar Pradesh",
            delivery_pincode="281001",
            payment_method=PaymentMethod.COD
        )
        placed_order = checkout(checkout_in=checkout_in, current_customer=buyer_user, db=db)
        print(f"  [i] Placed test order #{placed_order.order_number} (ID: {placed_order.id}) for seller's shop.")

        # 4.2 Verify seller can see the incoming order
        try:
            seller_orders = get_seller_orders(current_seller=seller_user, db=db)
            assert len(seller_orders) >= 1
            found_order = next((o for o in seller_orders if o.id == placed_order.id), None)
            assert found_order is not None, "Order not found in seller's incoming orders"
            print(f"  [PASS] 4.2 Seller received incoming order #{found_order.order_number} via GET /seller/orders")
            results["passed"].append("4.2 View Incoming Orders (GET /seller/orders)")
        except Exception as e:
            print(f"  [FAIL] 4.2 View incoming orders failed: {e}")
            results["failed"].append(f"4.2 View Incoming Orders: {e}")

        # 4.3 Verify order details & product snapshots
        try:
            assert len(found_order.items) >= 1
            first_item = found_order.items[0]
            assert first_item.product_name_snapshot == created_prod.name
            assert first_item.unit_price == Decimal("229.00")
            assert first_item.quantity == 2
            assert first_item.line_total == Decimal("458.00")
            print(f"  [PASS] 4.3 Order details & snapshot verified: '{first_item.product_name_snapshot}', Qty: {first_item.quantity}, Subtotal: ₹{first_item.line_total}")
            results["passed"].append("4.3 Order Item Snapshot Verification")
        except Exception as e:
            print(f"  [FAIL] 4.3 Order details verification failed: {e}")
            results["failed"].append(f"4.3 Order details verification: {e}")

        # 4.4 Update order status through allowed workflow: PLACED -> ACCEPTED -> PACKED -> SHIPPED -> DELIVERED
        try:
            # Step A: PLACED -> ACCEPTED
            ord_accepted = update_order_status(
                order_id=placed_order.id,
                status_in=OrderStatusUpdate(status=OrderStatus.ACCEPTED),
                current_seller=seller_user,
                db=db
            )
            assert ord_accepted.status == "ACCEPTED"

            # Step B: ACCEPTED -> PACKED
            ord_packed = update_order_status(
                order_id=placed_order.id,
                status_in=OrderStatusUpdate(status=OrderStatus.PACKED),
                current_seller=seller_user,
                db=db
            )
            assert ord_packed.status == "PACKED"

            # Step C: PACKED -> SHIPPED
            ord_shipped = update_order_status(
                order_id=placed_order.id,
                status_in=OrderStatusUpdate(status=OrderStatus.SHIPPED),
                current_seller=seller_user,
                db=db
            )
            assert ord_shipped.status == "SHIPPED"

            # Step D: SHIPPED -> DELIVERED
            ord_delivered = update_order_status(
                order_id=placed_order.id,
                status_in=OrderStatusUpdate(status=OrderStatus.DELIVERED),
                current_seller=seller_user,
                db=db
            )
            assert ord_delivered.status == "DELIVERED"
            # Since COD was chosen, DELIVERED automatically marks payment_status as PAID
            assert ord_delivered.payment_status == "PAID"
            print("  [PASS] 4.4 Full order status lifecycle verified: PLACED -> ACCEPTED -> PACKED -> SHIPPED -> DELIVERED (PaymentStatus: PAID)")
            results["passed"].append("4.4 Full Order Lifecycle Transitions")
        except Exception as e:
            print(f"  [FAIL] 4.4 Order status lifecycle failed: {e}")
            results["failed"].append(f"4.4 Order status lifecycle: {e}")

        # 4.5 Verify invalid lifecycle transition is blocked
        try:
            # DELIVERED cannot transition to ACCEPTED
            update_order_status(
                order_id=placed_order.id,
                status_in=OrderStatusUpdate(status=OrderStatus.ACCEPTED),
                current_seller=seller_user,
                db=db
            )
            print("  [FAIL] 4.5 Invalid transition allowed from DELIVERED to ACCEPTED!")
            results["failed"].append("4.5 Invalid order transition not blocked")
        except HTTPException as e:
            assert e.status_code == 400
            print(f"  [PASS] 4.5 Invalid transition blocked (400 Bad Request): '{e.detail}'")
            results["passed"].append("4.5 Invalid order transition blocked (400)")

        # 4.6 Verify updated status is reflected in customer order history
        try:
            buyer_orders = get_my_orders(current_customer=buyer_user, db=db)
            buyer_view = next((o for o in buyer_orders if o.id == placed_order.id), None)
            assert buyer_view is not None
            assert buyer_view.status == "DELIVERED"
            print(f"  [PASS] 4.6 Customer view reflects updated status: #{buyer_view.order_number} is '{buyer_view.status}'")
            results["passed"].append("4.6 Customer order history sync")
        except Exception as e:
            print(f"  [FAIL] 4.6 Customer history sync failed: {e}")
            results["failed"].append(f"4.6 Customer history sync: {e}")

        # =====================================================================
        # 5. SELLER DASHBOARD
        # =====================================================================
        print("\n--- 5. SELLER DASHBOARD ---")
        try:
            dash = get_seller_dashboard(current_seller=seller_user, db=db)
            assert dash.shop.id == created_shop.id
            assert dash.total_products >= 2  # created_prod and prod_to_archive
            assert dash.active_products >= 1  # created_prod is active, prod_to_archive is archived
            assert dash.total_orders >= 1
            assert dash.delivered_orders >= 1
            assert dash.total_sales >= Decimal("458.00")
            print(f"  [PASS] 5.1 Dashboard analytics verified from live DB:")
            print(f"      - Shop: {dash.shop.shop_name}")
            print(f"      - Total Products: {dash.total_products} (Active: {dash.active_products})")
            print(f"      - Total Orders: {dash.total_orders} (Delivered: {dash.delivered_orders}, Pending: {dash.pending_orders})")
            print(f"      - Total Sales Revenue: ₹{dash.total_sales}")
            results["passed"].append("5.1 Seller Dashboard Analytics (GET /seller/dashboard)")
        except Exception as e:
            print(f"  [FAIL] 5.1 Seller dashboard failed: {e}")
            results["failed"].append(f"5.1 Seller Dashboard: {e}")

        # =====================================================================
        # 6. SECURITY & MULTI-TENANCY CHECKS
        # =====================================================================
        print("\n--- 6. SECURITY & MULTI-TENANCY CHECKS ---")
        # 6.1 Register Seller B
        seller_b_reg = UserRegister(
            full_name="Rival Seller B",
            email=f"seller_b_{ts}@example.com",
            password="RivalPassword123!",
            phone=f"+91983{str(ts)[-7:]}",
            role=UserRole.SELLER
        )
        seller_b = register(user_in=seller_b_reg, db=db)

        shop_b_in = ShopCreate(
            shop_name=f"Rival Shop B {ts}",
            description="Competing store",
            status=ShopStatus.ACTIVE
        )
        shop_b = create_shop(shop_in=shop_b_in, current_seller=seller_b, db=db)

        # 6.2 Security Check: Seller B cannot update Seller A's product
        try:
            update_product(
                product_id=created_prod.id,
                product_in=ProductUpdate(price=Decimal("1.00")),
                current_seller=seller_b,
                db=db
            )
            print("  [FAIL] 6.2 Security breach: Seller B was able to modify Seller A's product!")
            results["failed"].append("6.2 Cross-seller product modification allowed!")
        except HTTPException as e:
            assert e.status_code == 403
            print(f"  [PASS] 6.2 Cross-seller product update blocked (403 Forbidden): '{e.detail}'")
            results["passed"].append("6.2 Cross-seller product update blocked (403)")

        # 6.3 Security Check: Seller B cannot archive Seller A's product
        try:
            archive_product(product_id=created_prod.id, current_seller=seller_b, db=db)
            print("  [FAIL] 6.3 Security breach: Seller B was able to archive Seller A's product!")
            results["failed"].append("6.3 Cross-seller product archive allowed!")
        except HTTPException as e:
            assert e.status_code == 403
            print(f"  [PASS] 6.3 Cross-seller product archive blocked (403 Forbidden): '{e.detail}'")
            results["passed"].append("6.3 Cross-seller product archive blocked (403)")

        # 6.4 Security Check: Seller B does not see Seller A's orders
        try:
            b_orders = get_seller_orders(current_seller=seller_b, db=db)
            leak = any(o.id == placed_order.id for o in b_orders)
            assert not leak, "Seller B can see Seller A's customer orders!"
            print(f"  [PASS] 6.4 Cross-seller order isolation verified (Seller B sees {len(b_orders)} orders, zero leaked from Seller A).")
            results["passed"].append("6.4 Order isolation between sellers verified")
        except Exception as e:
            print(f"  [FAIL] 6.4 Order isolation failed: {e}")
            results["failed"].append(f"6.4 Order isolation: {e}")

        # 6.5 Security Check: Seller B cannot update Seller A's order status
        try:
            update_order_status(
                order_id=placed_order.id,
                status_in=OrderStatusUpdate(status=OrderStatus.CANCELLED),
                current_seller=seller_b,
                db=db
            )
            print("  [FAIL] 6.5 Security breach: Seller B was able to update Seller A's order status!")
            results["failed"].append("6.5 Cross-seller order status update allowed!")
        except HTTPException as e:
            assert e.status_code == 403
            print(f"  [PASS] 6.5 Cross-seller order status update blocked (403 Forbidden): '{e.detail}'")
            results["passed"].append("6.5 Cross-seller order status update blocked (403)")

        # 6.6 Security Check: Customer role cannot access seller endpoints (RBAC)
        try:
            from app.core.dependencies import get_current_seller, get_current_user
            get_current_seller(current_user=buyer_user)
            print("  [FAIL] 6.6 Customer was able to pass seller authorization!")
            results["failed"].append("6.6 Customer role can pass seller authorization")
        except HTTPException as e:
            assert e.status_code == 403
            print(f"  [PASS] 6.6 Customer role blocked from seller endpoints (403 Forbidden): '{e.detail}'")
            results["passed"].append("6.6 Role-based restriction: Customer blocked from seller endpoints (403)")

        # 6.7 Security Check: Invalid token handling
        try:
            from fastapi.security import HTTPAuthorizationCredentials
            fake_cred = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid.jwt.token.signature")
            get_current_user(credentials=fake_cred, db=db)
            print("  [FAIL] 6.7 Invalid token was accepted!")
            results["failed"].append("6.7 Invalid token accepted")
        except HTTPException as e:
            assert e.status_code == 401
            print(f"  [PASS] 6.7 Invalid token rejected with 401 Unauthorized: '{e.detail}'")
            results["passed"].append("6.7 Invalid token rejected with 401")

        # =====================================================================
        # SUMMARY
        # =====================================================================
        print("\n" + "=" * 75)
        print(f"VERIFICATION SUMMARY: {len(results['passed'])} PASSED, {len(results['failed'])} FAILED")
        print("=" * 75)

    finally:
        db.close()

    return results


if __name__ == "__main__":
    run_seller_workflow_test()
