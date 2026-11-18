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
from app.schemas.user import UserRegister, UserRole
from app.schemas.shop import ShopCreate, ShopStatus
from app.schemas.product import ProductCreate

from app.routes.auth import register
from app.routes.shops import create_shop, update_my_shop
from app.routes.products import create_product, archive_product, list_products

def run_locality_discovery_tests():
    print("=" * 75)
    print("TESTING LOCALITY-BASED PRODUCT DISCOVERY & FILTERING")
    print("=" * 75)
    db = SessionLocal()
    ts = int(time.time())
    results = {"passed": [], "failed": []}

    try:
        # STEP 1: Seed two distinct locality shops and products
        print("\n--- 1. SEEDING LOCALITY DATA (Goverdhan & Green Park) ---")
        
        # Shop A in Goverdhan
        seller_a_in = UserRegister(
            full_name=f"Goverdhan Artisan {ts}",
            email=f"goverdhan_{ts}@example.com",
            password="ArtisanPassword123!",
            phone=f"+91985{str(ts)[-7:]}",
            role=UserRole.SELLER
        )
        seller_a = register(user_in=seller_a_in, db=db)
        shop_a = create_shop(
            shop_in=ShopCreate(
                shop_name=f"Goverdhan Heritage Pottery {ts}",
                description="Earthen crafts from Goverdhan hills",
                locality="Goverdhan",
                city="Mathura",
                pincode="281502",
                status=ShopStatus.ACTIVE
            ),
            current_seller=seller_a,
            db=db
        )

        cat = db.query(Category).first()
        prod_a = create_product(
            product_in=ProductCreate(
                name=f"Clay Cooking Pot {ts}",
                price=Decimal("450.00"),
                stock_quantity=25,
                category_id=cat.id if cat else None
            ),
            current_seller=seller_a,
            db=db
        )

        # Archived product in Shop A to test exclusion
        archived_prod = create_product(
            product_in=ProductCreate(
                name=f"Broken Clay Toy {ts}",
                price=Decimal("50.00"),
                stock_quantity=5,
                category_id=cat.id if cat else None
            ),
            current_seller=seller_a,
            db=db
        )
        archive_product(product_id=archived_prod.id, current_seller=seller_a, db=db)

        # Shop B in Green Park
        seller_b_in = UserRegister(
            full_name=f"GreenPark CandleMaker {ts}",
            email=f"greenpark_{ts}@example.com",
            password="ArtisanPassword123!",
            phone=f"+91984{str(ts)[-7:]}",
            role=UserRole.SELLER
        )
        seller_b = register(user_in=seller_b_in, db=db)
        shop_b = create_shop(
            shop_in=ShopCreate(
                shop_name=f"GreenPark Natural Scents {ts}",
                description="Organic soy candles in Green Park bazaar",
                locality="Green Park",
                city="Mathura",
                pincode="281001",
                status=ShopStatus.ACTIVE
            ),
            current_seller=seller_b,
            db=db
        )
        prod_b = create_product(
            product_in=ProductCreate(
                name=f"Jasmine Soy Candle {ts}",
                price=Decimal("250.00"),
                stock_quantity=40,
                category_id=cat.id if cat else None
            ),
            current_seller=seller_b,
            db=db
        )

        print(f"  [PASS] Seeded Shop A (Goverdhan, pincode 281502) & Shop B (Green Park, pincode 281001)")
        results["passed"].append("1. Locality & Shop Seeding")

        # STEP 2: Test Locality Filtering
        print("\n--- 2. LOCALITY FILTER VERIFICATION ---")
        gov_res = list_products(locality="Goverdhan", db=db)
        gov_names = [p.name for p in gov_res.items]
        assert prod_a.name in gov_names, f"{prod_a.name} should appear in Goverdhan"
        assert prod_b.name not in gov_names, f"{prod_b.name} must NOT appear in Goverdhan"
        print(f"  [PASS] Locality 'Goverdhan' returned {len(gov_names)} product(s), correctly isolating Goverdhan shops")

        gp_res = list_products(locality="Green Park", db=db)
        gp_names = [p.name for p in gp_res.items]
        assert prod_b.name in gp_names, f"{prod_b.name} should appear in Green Park"
        assert prod_a.name not in gp_names, f"{prod_a.name} must NOT appear in Green Park"
        print(f"  [PASS] Locality 'Green Park' returned {len(gp_names)} product(s), correctly isolating Green Park shops")
        results["passed"].append("2. Locality Filter (Goverdhan & Green Park)")

        # STEP 3: Test City & Pincode Filtering
        print("\n--- 3. CITY & PINCODE FILTER VERIFICATION ---")
        mathura_res = list_products(city="Mathura", db=db)
        mathura_names = [p.name for p in mathura_res.items]
        assert prod_a.name in mathura_names and prod_b.name in mathura_names
        print(f"  [PASS] City 'Mathura' contains products from all Mathura localities ({mathura_res.total} total)")

        pin_res = list_products(pincode="281502", db=db)
        pin_names = [p.name for p in pin_res.items]
        assert prod_a.name in pin_names
        assert prod_b.name not in pin_names
        print(f"  [PASS] Pincode '281502' isolated Goverdhan products ({len(pin_names)} items)")
        results["passed"].append("3. City & Pincode Filter")

        # STEP 4: Seller Location Metadata in Response
        print("\n--- 4. SELLER LOCATION SERIALIZATION IN ProductResponse ---")
        first_gov_prod = next(p for p in gov_res.items if p.id == prod_a.id)
        assert first_gov_prod.shop_locality == "Goverdhan"
        assert first_gov_prod.shop_city == "Mathura"
        assert first_gov_prod.shop_pincode == "281502"
        assert first_gov_prod.shop_name == shop_a.shop_name
        print(f"  [PASS] ProductResponse fields populated:")
        print(f"      - shop_name: '{first_gov_prod.shop_name}'")
        print(f"      - shop_locality: '{first_gov_prod.shop_locality}'")
        print(f"      - shop_city: '{first_gov_prod.shop_city}'")
        print(f"      - shop_pincode: '{first_gov_prod.shop_pincode}'")
        results["passed"].append("4. Location Serialization in ProductResponse")

        # STEP 5: Interaction with Category & Search Filters
        print("\n--- 5. INTERACTION WITH SEARCH & CATEGORY ---")
        # Combined search keyword + locality
        combo_search = list_products(search="Cooking", locality="Goverdhan", db=db)
        assert len(combo_search.items) >= 1
        assert combo_search.items[0].name == prod_a.name
        print(f"  [PASS] Search 'Cooking' + Locality 'Goverdhan' returned: '{combo_search.items[0].name}'")

        # Locality + non-matching search
        miss_search = list_products(search="NonExistentItem999", locality="Goverdhan", db=db)
        assert len(miss_search.items) == 0
        print(f"  [PASS] Locality + non-matching search returned 0 items (clean empty state)")
        results["passed"].append("5. Search & Locality Interaction")

        # STEP 6: Inactive Shops and Archived Products Exclusion
        print("\n--- 6. INACTIVE SHOPS & ARCHIVED PRODUCTS EXCLUSION ---")
        # Ensure archived product is not in Goverdhan listing
        assert archived_prod.name not in gov_names
        print(f"  [PASS] Archived product '{archived_prod.name}' excluded from locality listing")

        # Create a draft shop in Goverdhan to ensure it does not leak
        draft_seller_in = UserRegister(
            full_name=f"Draft Seller {ts}",
            email=f"draft_{ts}@example.com",
            password="DraftPassword123!",
            phone=f"+91980{str(ts)[-7:]}",
            role=UserRole.SELLER
        )
        draft_seller = register(user_in=draft_seller_in, db=db)
        draft_shop = create_shop(
            shop_in=ShopCreate(
                shop_name=f"Hidden Draft Shop {ts}",
                locality="Goverdhan",
                city="Mathura",
                status=ShopStatus.DRAFT
            ),
            current_seller=draft_seller,
            db=db
        )
        draft_prod = create_product(
            product_in=ProductCreate(
                name=f"Draft Clay Pot {ts}",
                price=Decimal("100.00"),
                stock_quantity=10,
                category_id=cat.id if cat else None
            ),
            current_seller=draft_seller,
            db=db
        )
        # Check that draft shop's product does NOT appear in Goverdhan listing
        check_draft = list_products(locality="Goverdhan", db=db)
        assert all(p.id != draft_prod.id for p in check_draft.items)
        print(f"  [PASS] Products from DRAFT shop '{draft_shop.shop_name}' excluded from public locality listing")
        results["passed"].append("6. Inactive Shop & Soft-Archived Exclusion")

        print("\n" + "=" * 75)
        print(f"LOCALITY DISCOVERY VERIFICATION: ALL {len(results['passed'])} TESTS PASSED (0 FAILED)")
        print("=" * 75)

    finally:
        db.close()

    return results

if __name__ == "__main__":
    run_locality_discovery_tests()
