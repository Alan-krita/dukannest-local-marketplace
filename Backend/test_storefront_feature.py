import os
import sys
import time
import uuid
from decimal import Decimal

project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from fastapi import HTTPException
from app.db.session import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.shop import Shop
from app.schemas.user import UserRegister, UserRole
from app.schemas.shop import ShopCreate, ShopStatus
from app.schemas.product import ProductCreate
from app.schemas.cart import CartItemAdd

from app.routes.auth import register
from app.routes.shops import create_shop, get_shop_by_id
from app.routes.products import create_product, get_product, archive_product, list_products
from app.routes.cart import add_cart_item, get_cart

def run_storefront_feature_test():
    print("=" * 75)
    print("TESTING INDIVIDUAL SELLER STOREFRONT & PRODUCT DISCOVERY")
    print("=" * 75)
    db = SessionLocal()
    ts = int(time.time())
    results = {"passed": [], "failed": []}

    try:
        # 1. Setup a verified seller and shop
        print("\n--- 1. SELLER & STOREFRONT SETUP ---")
        seller_in = UserRegister(
            full_name=f"Heritage Potter {ts}",
            email=f"potter_{ts}@example.com",
            password="PotterPassword123!",
            phone=f"+91981{str(ts)[-7:]}",
            role=UserRole.SELLER
        )
        seller = register(user_in=seller_in, db=db)

        shop_in = ShopCreate(
            shop_name=f"Kusum Sarovar Terracotta {ts}",
            description="Traditional hand-thrown terracotta kitchenware and planters from Braj artisans.",
            category="Handmade & Pottery",
            locality="Goverdhan",
            city="Mathura",
            state="Uttar Pradesh",
            pincode="281502",
            address="7 Kusum Sarovar Ghat",
            status=ShopStatus.ACTIVE
        )
        shop = create_shop(shop_in=shop_in, current_seller=seller, db=db)
        print(f"  [PASS] Storefront created: '{shop.shop_name}' (ID: {shop.id})")
        results["passed"].append("1. Storefront Creation")

        # 2. Add an active product and an archived product
        print("\n--- 2. STOREFRONT PRODUCT CATALOG MANAGEMENT ---")
        cat = db.query(Category).first()
        active_prod_in = ProductCreate(
            name=f"Terracotta Water Pot {ts}",
            description="Natural cooling earthen clay water pot with handcrafted lid.",
            price=Decimal("299.00"),
            stock_quantity=30,
            category_id=cat.id if cat else None
        )
        active_prod = create_product(product_in=active_prod_in, current_seller=seller, db=db)
        print(f"  [PASS] Active product added: '{active_prod.name}' (Price: ₹{active_prod.price}, Stock: {active_prod.stock_quantity})")

        archived_prod_in = ProductCreate(
            name=f"Seasonal Clay Diya {ts}",
            description="Limited Diwali clay lamps",
            price=Decimal("49.00"),
            stock_quantity=10,
            category_id=cat.id if cat else None
        )
        archived_prod = create_product(product_in=archived_prod_in, current_seller=seller, db=db)
        archive_product(product_id=archived_prod.id, current_seller=seller, db=db)
        print(f"  [PASS] Archived product added: '{archived_prod.name}' (is_active: False)")
        results["passed"].append("2. Storefront Catalog Setup (Active vs Archived)")

        # 3. Public Storefront Retrieval
        print("\n--- 3. PUBLIC STOREFRONT RETRIEVAL ---")
        public_shop = get_shop_by_id(shop_id=shop.id, db=db)
        assert public_shop.shop_name == shop.shop_name
        assert public_shop.description == shop.description
        assert public_shop.city == "Mathura"
        assert public_shop.address == "7 Kusum Sarovar Ghat"
        assert public_shop.status == ShopStatus.ACTIVE
        print(f"  [PASS] Public storefront details retrieved via GET /shops/{shop.id}")
        results["passed"].append("3. Public Storefront Information API (GET /shops/{id})")

        # 4. Storefront Active Products Retrieval (Excludes Archived)
        print("\n--- 4. STOREFRONT PRODUCTS FILTERING ---")
        shop_prods = list_products(
            search=None,
            category_id=None,
            city=None,
            shop_id=shop.id,
            page=1,
            limit=20,
            db=db
        )
        prod_names = [p.name for p in shop_prods.items]
        assert active_prod.name in prod_names, f"Active product {active_prod.name} should be in storefront catalog!"
        assert archived_prod.name not in prod_names, f"Archived product {archived_prod.name} must NOT be in storefront catalog!"
        print(f"  [PASS] Storefront catalog contains {len(shop_prods.items)} active product(s), archived products excluded.")
        results["passed"].append("4. Storefront Active Products Retrieval (GET /products?shop_id={id})")

        # 5. Product Navigation Linkage to Storefront
        print("\n--- 5. PRODUCT DETAILS NAVIGATION LINKAGE ---")
        fetched_prod = get_product(product_id=active_prod.id, db=db)
        assert fetched_prod.shop_id == shop.id
        print(f"  [PASS] Product {fetched_prod.name} links directly to seller shop_id={fetched_prod.shop_id}")
        results["passed"].append("5. Product to Storefront Navigation Linkage")

        # 6. Customer Cart Integration from Storefront
        print("\n--- 6. CUSTOMER CART INTEGRATION FROM STOREFRONT ---")
        cust_in = UserRegister(
            full_name=f"Storefront Shopper {ts}",
            email=f"shopper_{ts}@example.com",
            password="ShopperPassword123!",
            phone=f"+91982{str(ts)[-7:]}",
            role=UserRole.CUSTOMER
        )
        customer = register(user_in=cust_in, db=db)

        # Add 1 item of active product to cart
        cart_item = add_cart_item(
            item_in=CartItemAdd(product_id=active_prod.id, quantity=1),
            current_customer=customer,
            db=db
        )
        cart = get_cart(current_customer=customer, db=db)
        assert len(cart.items) == 1
        assert cart.items[0].product_id == active_prod.id
        assert cart.items[0].quantity == 1
        print(f"  [PASS] Customer successfully added '{active_prod.name}' to cart from storefront (Cart Subtotal: ₹{cart.subtotal})")
        results["passed"].append("6. Cart Integration from Storefront")

        print("\n" + "=" * 75)
        print(f"STOREFRONT VERIFICATION: ALL {len(results['passed'])} TESTS PASSED (0 FAILED)")
        print("=" * 75)

    finally:
        db.close()

    return results

if __name__ == "__main__":
    run_storefront_feature_test()
