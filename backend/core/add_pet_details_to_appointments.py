"""
Migration script to add pet details columns to appointments table
"""
from sqlalchemy import create_engine, text
import os

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:pawthos@localhost/cityvet_db")

def add_pet_details_columns():
    """Add pet details columns to appointments table"""
    engine = create_engine(DATABASE_URL)
    
    columns_to_add = [
        ("pet_name", "VARCHAR(255)"),
        ("pet_species", "VARCHAR(255)"),
        ("pet_breed", "VARCHAR(255)"),
        ("pet_age", "VARCHAR(50)"),
        ("pet_gender", "VARCHAR(50)"),
        ("pet_weight", "VARCHAR(50)"),
        ("owner_name", "VARCHAR(255)"),
    ]
    
    with engine.connect() as conn:
        for column_name, column_type in columns_to_add:
            try:
                # Check if column exists
                check_query = text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='appointments' 
                    AND column_name='{column_name}'
                """)
                result = conn.execute(check_query)
                exists = result.fetchone() is not None
                
                if not exists:
                    # Add column
                    alter_query = text(f"""
                        ALTER TABLE appointments 
                        ADD COLUMN {column_name} {column_type}
                    """)
                    conn.execute(alter_query)
                    conn.commit()
                    print(f"✅ Added column: {column_name}")
                else:
                    print(f"⏭️  Column already exists: {column_name}")
                    
            except Exception as e:
                print(f"❌ Error adding column {column_name}: {e}")
                conn.rollback()
    
    print("\n🎉 Migration completed!")

if __name__ == "__main__":
    print("Adding pet details columns to appointments table...")
    add_pet_details_columns()

