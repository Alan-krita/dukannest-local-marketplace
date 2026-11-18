import sys
import uuid
import time
from pathlib import Path
from decimal import Decimal

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.shop import Shop
from app.models.category import Category
from app.models.product import Product

from app.schemas.user import UserRegister, UserLogin, UserRole
from app.schemas.shop import ShopCreate
from app.schemas.product import ProductCreate
from app.schemas.cart import CartItemAdd, CartItemUpdate
from app.schemas.order import OrderCreate, PaymentMethod

from app.routes.auth import register, login, get_current_user_profile
from app.routes.shops import create_shop
from app.routes.products import list_products, get_product, create_product
from app.routes.categories import list_categories
from app.routes.cart import get_cart, add_cart_item, update_cart_item, remove_cart_item
from app.routes.orders import checkout, get_my_orders


def run_customer_workflow_test():
    print("=" * 70)
    print("TESTING COMPLETE CUSTOMER WORKFLOW (STEPS 1 TO 7) ON LIVE SUPABASE")
    print("=" * 70)

    db = SessionLocal()
    try:
        unique_suffix = int(time.time())

        # -------------------------------------------------------------
        # 1. Register / Login
        # -------------------------------------------------------------
        print("\n[STEP 1] Register / Login: Customer creates an account & logs in")
        customer_email = f"customer_{unique_suffix}@example.com"
        customer_phone = f"+91987{str(unique_suffix)[-7:]}"
        customer_pwd = "SecurePassword@123"

        # Register
        cust_reg = UserRegister(
            full_name=f"Customer Test {unique_suffix}",
            email=customer_email,
            password=customer_pwd,
            phone=customer_phone,
            role=UserRole.CUSTOMER
        )
        new_customer = register(user_in=cust_reg, db=db)
        assert new_customer.id is not None, "Customer ID is None"
        assert new_customer.role == "CUSTOMER", f"Expected CUSTOMER role, got {new_customer.role}"
        print(f"  [+] Registration successful! Customer ID: {new_customer.id}, Email: {new_customer.email}")

        # Login
        cust_login = UserLogin(email=customer_email, password=customer_pwd)
        token_res = login(user_in=cust_login, db=db)
        assert token_res.access_token, "Access token missing"
        assert token_res.token_type.lower() == "bearer"
        print(f"  [+] Login successful! JWT Access Token generated ({len(token_res.access_token)} chars).")

        # Verify /auth/me
        profile = get_current_user_profile(current_user=new_customer)
        assert profile.email == customer_email
        print(f"  [+] Verified customer profile via /auth/me: '{profile.full_name}'")

        # -------------------------------------------------------------
        # 2. Browse Products
        # -------------------------------------------------------------
        print("\n[STEP 2] Browse Products: Fetching products from Supabase through FastAPI")
        catalog = list_products(search=None, category_id=None, city=None, shop_id=None, page=1, limit=20, db=db)
        print(f"  [+] Initial catalog fetch returned {catalog.total} total product(s) in database.")

        # Ensure we have an active shop and active product in database
        active_prod = None
        for p in catalog.items:
            if p.stock_quantity >= 5:
                active_prod = p
                break

        if not active_prod:
            print("  [i] Seeding a test artisan shop and product for the customer to buy...")
            seller_email = f"seller_{unique_suffix}@example.com"
            seller_reg = UserRegister(
                full_name="Mathura Candle Maker",
                email=seller_email,
                password=customer_pwd,
                phone=f"+91986{str(unique_suffix)[-7:]}",
                role=UserRole.SELLER
            )
            seller_user = register(user_in=seller_reg, db=db)

            # Ensure category exists
            cat = db.query(Category).first()
            if not cat:
                cat = Category(name="Handmade", slug="handmade", description="Handmade creations")
                db.add(cat)
                db.commit()
                db.refresh(cat)

            # Create active shop
            shop = create_shop(
                shop_in=ShopCreate(
                    shop_name="The Candle Co.",
                    description="Handmade aromatic candles & soy wax products",
                    locality="Green Park",
                    city="Mathura",
                    state="Uttar Pradesh",
                    address="12 Green Park Bazaar",
                    pincode="281001",
                    status="ACTIVE"
                ),
                current_seller=seller_user,
                db=db
            )

            # Create active product with stock
            prod = create_product(
                product_in=ProductCreate(
                    name="Handmade Scented Candle",
                    description="Natural lavender soy wax candle hand-poured by artisans",
                    price=Decimal("199.00"),
                    stock_quantity=40,
                    category_id=cat.id if cat else None
                ),
                current_seller=seller_user,
                db=db
            )

            # Refresh catalog
            catalog = list_products(search=None, category_id=None, city=None, shop_id=None, page=1, limit=20, db=db)
            active_prod = next(p for p in catalog.items if p.id == prod.id)
            print(f"  [+] Seeded active product: '{active_prod.name}' with ₹{active_prod.price} and stock {active_prod.stock_quantity}.")

        print(f"  [+] Target product chosen: '{active_prod.name}' (ID: {active_prod.id}, Stock: {active_prod.stock_quantity}, Price: ₹{active_prod.price})")

        # -------------------------------------------------------------
        # 3. Search and Filter
        # -------------------------------------------------------------
        print("\n[STEP 3] Search and Filter: Search products and browse categories")
        # 3.1 Search by title prefix
        prefix = active_prod.name.split()[0]
        search_res = list_products(search=prefix, category_id=None, city=None, shop_id=None, page=1, limit=10, db=db)
        assert any(p.id == active_prod.id for p in search_res.items), f"Search for '{prefix}' failed to find product"
        print(f"  [+] Search query '{prefix}' returned {search_res.total} matching product(s).")

        # 3.2 List categories
        categories = list_categories(db=db)
        assert len(categories) >= 1, "Categories should not be empty"
        print(f"  [+] Listed {len(categories)} available categories.")

        # 3.3 Filter by category
        if active_prod.category_id:
            cat_filtered = list_products(search=None, category_id=active_prod.category_id, city=None, shop_id=None, page=1, limit=10, db=db)
            assert any(p.id == active_prod.id for p in cat_filtered.items), "Category filter failed"
            print(f"  [+] Filter by category '{active_prod.category_id}' returned {cat_filtered.total} item(s).")

        # -------------------------------------------------------------
        # 4. Add to Cart: Add, Change Quantities, and Remove Items
        # -------------------------------------------------------------
        print("\n[STEP 4] Add to Cart: Add products, change quantities and remove items")
        # 4.1 Add 2 items
        add_in = CartItemAdd(product_id=active_prod.id, quantity=2)
        cart_after_add = add_cart_item(item_in=add_in, current_customer=new_customer, db=db)
        assert cart_after_add.total_items == 2, f"Expected 2 total items, got {cart_after_add.total_items}"
        item_obj = next(i for i in cart_after_add.items if i.product_id == active_prod.id)
        cart_item_id = item_obj.id
        print(f"  [+] Added product to cart. Quantity: {item_obj.quantity}, Subtotal: ₹{cart_after_add.subtotal}")

        # 4.2 Change quantity to 3
        up_in = CartItemUpdate(quantity=3)
        cart_after_up = update_cart_item(item_id=cart_item_id, item_in=up_in, current_customer=new_customer, db=db)
        updated_item = next(i for i in cart_after_up.items if i.id == cart_item_id)
        assert updated_item.quantity == 3, f"Expected quantity 3, got {updated_item.quantity}"
        print(f"  [+] Changed quantity to 3. New subtotal: ₹{cart_after_up.subtotal}")

        # 4.3 View Cart
        view_cart = get_cart(current_customer=new_customer, db=db)
        assert view_cart.total_items == 3
        print(f"  [+] Verified cart view: {view_cart.total_items} items in cart.")

        # 4.4 Remove item from cart
        cart_after_del = remove_cart_item(item_id=cart_item_id, current_customer=new_customer, db=db)
        assert not any(i.id == cart_item_id for i in cart_after_del.items), "Item was not removed from cart"
        print(f"  [+] Tested removing item from cart: Cart successfully emptied ({cart_after_del.total_items} items).")

        # 4.5 Re-add 1 unit for checkout
        readd_in = CartItemAdd(product_id=active_prod.id, quantity=1)
        ready_cart = add_cart_item(item_in=readd_in, current_customer=new_customer, db=db)
        assert ready_cart.total_items == 1
        print(f"  [+] Re-added 1 unit to cart ready for checkout.")

        # -------------------------------------------------------------
        # 5 & 6. Checkout & Place Order: Stock Update & Order Storage
        # -------------------------------------------------------------
        print("\n[STEP 5 & 6] Checkout & Place Order: Delivery info, COD / simulated, stock update")
        # Check stock before checkout
        prod_before_order = get_product(product_id=active_prod.id, db=db)
        stock_before = prod_before_order.stock_quantity

        # Create order payload (matches Frontend/src/pages/customer/Checkout.jsx form)
        checkout_in = OrderCreate(
            delivery_name="Customer Test",
            delivery_phone="+919876543210",
            delivery_address="123, Green Park, Mathura",
            delivery_city="Mathura",
            delivery_state="Uttar Pradesh",
            delivery_pincode="281001",
            payment_method=PaymentMethod.COD
        )
        placed_order = checkout(checkout_in=checkout_in, current_customer=new_customer, db=db)
        assert placed_order.id is not None, "Order ID is None"
        assert placed_order.order_number.startswith("ORD-"), f"Invalid order number {placed_order.order_number}"
        assert placed_order.status == "PLACED"
        assert placed_order.payment_method == "COD"
        assert placed_order.payment_status == "PENDING"
        print(f"  [+] Order #{placed_order.order_number} created successfully in database!")
        print(f"      - ID: {placed_order.id}")
        print(f"      - Status: {placed_order.status}")
        print(f"      - Subtotal: ₹{placed_order.subtotal}, Total: ₹{placed_order.total_amount}")
        print(f"      - Recipient: {placed_order.delivery_name}, {placed_order.delivery_address}, {placed_order.delivery_city}")

        # Check stock was decremented in database
        prod_after_order = get_product(product_id=active_prod.id, db=db)
        stock_after = prod_after_order.stock_quantity
        assert stock_after == stock_before - 1, f"Stock decrement failed: before={stock_before}, after={stock_after}"
        print(f"  [+] Stock updated in Supabase: decremented by 1 ({stock_before} -> {stock_after}).")

        # Check cart was cleared
        empty_cart = get_cart(current_customer=new_customer, db=db)
        assert empty_cart.total_items == 0, "Cart was not cleared after order!"
        print(f"  [+] Verified customer cart is now empty after order placement.")

        # -------------------------------------------------------------
        # 7. My Orders: Customer can see order history and status
        # -------------------------------------------------------------
        print("\n[STEP 7] My Orders: Customer can see their order history and status")
        my_orders = get_my_orders(current_customer=new_customer, db=db)
        assert len(my_orders) >= 1, "Order history should contain at least 1 order"
        found = next((o for o in my_orders if o.id == placed_order.id), None)
        assert found is not None, f"Order {placed_order.id} not found in customer history"
        assert found.order_number == placed_order.order_number
        assert found.status == "PLACED"
        assert len(found.items) >= 1, "Order items missing in customer order history"
        first_item = found.items[0]
        print(f"  [+] Found order in customer order history!")
        print(f"      - Order Number: #{found.order_number}")
        print(f"      - Status: {found.status}")
        print(f"      - Date: {found.created_at}")
        print(f"      - Total: ₹{found.total_amount}")
        print(f"      - Item Snapshot: '{first_item.product_name_snapshot}' (Qty: {first_item.quantity}, Price: ₹{first_item.unit_price})")

        print("\n" + "=" * 70)
        print("ALL 7 STEPS OF THE CUSTOMER WORKFLOW TESTED AND PASSED 100%!")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    run_customer_workflow_test()
