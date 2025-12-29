"""
Script to delete all vaccination records from the database.
WARNING: This will permanently delete ALL vaccination records!
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:QxUrGJVknLmgjmaAtXDPfZwSiMFrJNEu@shuttle.proxy.rlwy.net:43936/railway")

print(f"🔧 Connecting to database...")
print(f"📋 Database URL: {DATABASE_URL[:30]}...")

try:
    # Create engine and session
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    # First, count how many records exist
    result = db.execute(text("SELECT COUNT(*) FROM vaccination_records"))
    count = result.scalar()
    
    print(f"📊 Found {count} vaccination record(s) in the database")
    
    if count == 0:
        print("✅ No records to delete.")
        db.close()
        exit(0)
    
    # Ask for confirmation
    print("\n⚠️  WARNING: This will delete ALL vaccination records!")
    confirmation = input("Type 'DELETE ALL' to confirm: ")
    
    if confirmation != "DELETE ALL":
        print("❌ Deletion cancelled.")
        db.close()
        exit(0)
    
    # Delete all records
    print("\n🗑️  Deleting all vaccination records...")
    db.execute(text("DELETE FROM vaccination_records"))
    db.commit()
    
    # Verify deletion
    result = db.execute(text("SELECT COUNT(*) FROM vaccination_records"))
    remaining = result.scalar()
    
    if remaining == 0:
        print(f"✅ Successfully deleted {count} vaccination record(s)!")
    else:
        print(f"⚠️  Warning: {remaining} record(s) still remain.")
    
    db.close()
    print("✅ Done!")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)


