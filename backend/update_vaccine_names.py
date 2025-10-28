#!/usr/bin/env python3
"""
Database migration script to update existing vaccination records with old vaccine names.
This script updates:
- '5in1 (Anti-Parvo)' -> '5in1'
- '8in1 (All Viruses)' -> '8in1'
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from core.database import DATABASE_URL
from core.models import Base, VaccinationRecord
from sqlalchemy.orm import sessionmaker

def update_vaccine_names():
    """Update existing vaccination records with new vaccine names."""
    
    # Create database connection
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    try:
        db = SessionLocal()
        
        # Count records that need updating
        old_5in1_count = db.query(VaccinationRecord).filter(
            VaccinationRecord.vaccine_name == '5in1 (Anti-Parvo)'
        ).count()
        
        old_8in1_count = db.query(VaccinationRecord).filter(
            VaccinationRecord.vaccine_name == '8in1 (All Viruses)'
        ).count()
        
        print(f"Found {old_5in1_count} records with '5in1 (Anti-Parvo)'")
        print(f"Found {old_8in1_count} records with '8in1 (All Viruses)'")
        
        if old_5in1_count == 0 and old_8in1_count == 0:
            print("No records need updating.")
            return
        
        # Update 5in1 (Anti-Parvo) to 5in1
        if old_5in1_count > 0:
            db.query(VaccinationRecord).filter(
                VaccinationRecord.vaccine_name == '5in1 (Anti-Parvo)'
            ).update({VaccinationRecord.vaccine_name: '5in1'})
            print(f"Updated {old_5in1_count} records: '5in1 (Anti-Parvo)' -> '5in1'")
        
        # Update 8in1 (All Viruses) to 8in1
        if old_8in1_count > 0:
            db.query(VaccinationRecord).filter(
                VaccinationRecord.vaccine_name == '8in1 (All Viruses)'
            ).update({VaccinationRecord.vaccine_name: '8in1'})
            print(f"Updated {old_8in1_count} records: '8in1 (All Viruses)' -> '8in1'")
        
        # Commit changes
        db.commit()
        print("✅ Database update completed successfully!")
        
    except Exception as e:
        print(f"❌ Error updating database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Updating vaccination record vaccine names...")
    update_vaccine_names()
    print("✅ Migration completed!")
