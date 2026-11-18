import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text, inspect
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
import app.models


def verify_database_connection():
    print("=" * 60)
    print("SUPABASE POSTGRESQL CONNECTION VERIFICATION")
    print("=" * 60)

    # 1. Check if DATABASE_URL is set and not the default placeholder
    db_url = settings.DATABASE_URL
    if not db_url or "postgres:postgres@localhost" in db_url or "[YOUR-" in db_url:
        print("[STATUS] MISSING CREDENTIALS")
        print("DATABASE_URL is not configured in Backend/.env.")
        print("Please configure your Supabase connection string in Backend/.env:")
        print("DATABASE_URL=postgresql+psycopg://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require")
        return False

    print("[INFO] Attempting connection to configured database...")
    try:
        # 2. Test SELECT 1
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            if result == 1:
                print("[SUCCESS] Live connection verified: SELECT 1 succeeded!")
            else:
                print(f"[ERROR] Unexpected result from SELECT 1: {result}")
                return False

        # 3. Inspect existing tables
        inspector = inspect(engine)
        schema_name = "public" if "postgresql" in engine.dialect.name else None
        existing_tables = set(inspector.get_table_names(schema=schema_name))
        print(f"\n[INFO] Dialect: {engine.dialect.name}. Found {len(existing_tables)} tables: {sorted(list(existing_tables))}")

        required_tables = {'users', 'shops', 'categories', 'products', 'carts', 'cart_items', 'orders', 'order_items'}
        missing_tables = required_tables - existing_tables

        if missing_tables:
            print(f"[WARNING] Missing required tables in database: {missing_tables}")
            return False
        else:
            print("[SUCCESS] All 8 required tables exist in database!")

        # 4. Inspect columns for each table and compare with SQLAlchemy models
        model_tables = Base.metadata.tables
        mismatches = []

        print("\n--- TABLE SCHEMA COMPARISON ---")
        for table_name in sorted(list(required_tables)):
            db_columns = {col["name"]: str(col["type"]) for col in inspector.get_columns(table_name, schema=schema_name)}
            model_cols = {col.name: str(col.type) for col in model_tables[table_name].columns}

            missing_cols = set(model_cols.keys()) - set(db_columns.keys())
            extra_cols = set(db_columns.keys()) - set(model_cols.keys())

            if missing_cols or extra_cols:
                mismatches.append((table_name, missing_cols, extra_cols))
                print(f"[-] {table_name}: MISMATCH! Missing in DB: {missing_cols}, Extra in DB: {extra_cols}")
            else:
                print(f"[+] {table_name}: Matches perfectly ({len(model_cols)} columns verified).")


        if mismatches:
            print(f"\n[WARNING] Found {len(mismatches)} table mismatches.")
            return False

        print("\n[SUCCESS] All table structures match SQLAlchemy models 100%!")
        return True

    except Exception as exc:
        print(f"[ERROR] Database connection failed: {exc.__class__.__name__}: {exc}")
        return False


if __name__ == "__main__":
    success = verify_database_connection()
    sys.exit(0 if success else 1)
