"""
Apply Placeholder Account Claiming Migration

This script safely applies the is_placeholder column migration to the database.
It includes rollback capability and verification steps.
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect
from datetime import datetime

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:QxUrGJVknLmgjmaAtXDPfZwSiMFrJNEu@shuttle.proxy.rlwy.net:43936/railway")

def print_header(message):
    print("\n" + "="*80)
    print(f"  {message}")
    print("="*80 + "\n")

def check_column_exists(engine):
    """Check if is_placeholder column already exists"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('users')]
    return 'is_placeholder' in columns

def backup_reminder():
    """Remind user to backup database"""
    print_header("⚠️  BACKUP REMINDER")
    print("Before applying this migration, it's recommended to backup your database.")
    print("\nFor PostgreSQL, you can use:")
    print(f"  pg_dump -d railway -h shuttle.proxy.rlwy.net -p 43936 -U postgres > backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql")
    print("\nHave you created a backup? (yes/no): ", end="")
    response = input().strip().lower()
    if response != 'yes':
        print("\n❌ Migration cancelled. Please create a backup first.")
        sys.exit(0)
    print("\n✅ Proceeding with migration...\n")

def apply_migration(engine):
    """Apply the migration"""
    print_header("🚀 Applying Migration")
    
    # Read the migration file
    migration_file = os.path.join(os.path.dirname(__file__), 'migrations', 'add_is_placeholder_to_users.sql')
    
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    try:
        with engine.connect() as conn:
            # Execute the migration
            conn.execute(text(migration_sql))
            conn.commit()
            print("✅ Migration applied successfully!")
            return True
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

def verify_migration(engine):
    """Verify the migration was applied correctly"""
    print_header("🔍 Verifying Migration")
    
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = 'is_placeholder'
            """))
            column_info = result.fetchone()
            
            if column_info:
                print("✅ Column 'is_placeholder' exists")
                print(f"   Type: {column_info[1]}")
                print(f"   Nullable: {column_info[2]}")
                print(f"   Default: {column_info[3]}")
            else:
                print("❌ Column 'is_placeholder' not found!")
                return False
            
            # Check indexes
            result = conn.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'users' 
                AND indexname IN ('idx_users_is_placeholder', 'idx_users_name')
            """))
            indexes = [row[0] for row in result.fetchall()]
            
            if 'idx_users_is_placeholder' in indexes:
                print("✅ Index 'idx_users_is_placeholder' created")
            else:
                print("⚠️  Index 'idx_users_is_placeholder' not found")
            
            if 'idx_users_name' in indexes:
                print("✅ Index 'idx_users_name' created")
            else:
                print("⚠️  Index 'idx_users_name' not found")
            
            # Count placeholder users
            result = conn.execute(text("""
                SELECT 
                    COUNT(*) FILTER (WHERE is_placeholder = 1) as placeholder_count,
                    COUNT(*) FILTER (WHERE is_placeholder = 0) as real_count
                FROM users
            """))
            counts = result.fetchone()
            
            print(f"\n📊 User Statistics:")
            print(f"   Placeholder users: {counts[0]}")
            print(f"   Real users: {counts[1]}")
            
            return True
            
    except Exception as e:
        print(f"❌ Verification failed: {str(e)}")
        return False

def main():
    print_header("🎯 Placeholder Account Claiming - Database Migration")
    
    print(f"Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'Unknown'}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Test connection
        print("\n🔌 Testing database connection...")
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        
        # Check if already applied
        if check_column_exists(engine):
            print("\n⚠️  Column 'is_placeholder' already exists!")
            print("Migration may have already been applied.")
            print("\nDo you want to continue anyway? (yes/no): ", end="")
            response = input().strip().lower()
            if response != 'yes':
                print("\n❌ Migration cancelled.")
                sys.exit(0)
        
        # Backup reminder
        backup_reminder()
        
        # Apply migration
        success = apply_migration(engine)
        
        if not success:
            print("\n❌ Migration failed. Please check the error above.")
            sys.exit(1)
        
        # Verify migration
        verify_success = verify_migration(engine)
        
        if verify_success:
            print_header("🎉 Migration Completed Successfully!")
            print("Next steps:")
            print("1. Restart your backend server")
            print("2. Test the placeholder claiming functionality")
            print("3. Monitor logs for 🔄 and ✅ messages")
            print("\nSee README_PLACEHOLDER_CLAIMING.md for testing instructions.")
        else:
            print_header("⚠️  Migration Applied but Verification Failed")
            print("Please manually verify the database changes.")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

