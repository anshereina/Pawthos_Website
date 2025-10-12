#!/usr/bin/env python3
"""
Database inspection script for Pawthos
This script helps you inspect and clean up your database
"""

import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from core import models

def inspect_admins():
    """Inspect all admins in the database"""
    db = SessionLocal()
    try:
        print("🔍 INSPECTING ADMINS DATABASE")
        print("=" * 50)
        
        # Get all admins
        admins = db.query(models.Admin).all()
        
        if not admins:
            print("❌ No admins found in the database")
            return
        
        print(f"📊 Total admins: {len(admins)}")
        print()
        
        # Summary statistics
        confirmed_count = len([a for a in admins if a.is_confirmed == 1])
        unconfirmed_count = len([a for a in admins if a.is_confirmed == 0])
        with_otp_count = len([a for a in admins if a.otp_code])
        
        print("📈 SUMMARY:")
        print(f"   ✅ Confirmed admins: {confirmed_count}")
        print(f"   ⏳ Unconfirmed admins: {unconfirmed_count}")
        print(f"   🔐 Admins with OTP: {with_otp_count}")
        print()
        
        # Detailed admin information
        print("👥 DETAILED ADMIN LIST:")
        print("-" * 80)
        print(f"{'ID':<4} {'Name':<20} {'Email':<30} {'Status':<12} {'Created':<20}")
        print("-" * 80)
        
        for admin in admins:
            status = "✅ Confirmed" if admin.is_confirmed == 1 else "⏳ Unconfirmed"
            created = admin.created_at.strftime("%Y-%m-%d %H:%M") if admin.created_at else "Unknown"
            print(f"{admin.id:<4} {admin.name:<20} {admin.email:<30} {status:<12} {created:<20}")
        
        print()
        
        # Recommendations for cleanup
        print("🧹 CLEANUP RECOMMENDATIONS:")
        print("-" * 40)
        
        if unconfirmed_count > 0:
            print(f"⚠️  Found {unconfirmed_count} unconfirmed admins that can be deleted:")
            for admin in admins:
                if admin.is_confirmed == 0:
                    print(f"   - ID {admin.id}: {admin.name} ({admin.email})")
            print()
        
        # Check for old OTP codes
        old_otp_count = 0
        for admin in admins:
            if admin.otp_code and admin.otp_expires_at:
                if admin.otp_expires_at < datetime.now():
                    old_otp_count += 1
        
        if old_otp_count > 0:
            print(f"⚠️  Found {old_otp_count} admins with expired OTP codes")
            print()
        
        # Show what can be safely deleted
        print("🗑️  SAFE TO DELETE:")
        print("-" * 20)
        
        safe_to_delete = []
        for admin in admins:
            if admin.is_confirmed == 0:
                safe_to_delete.append(admin)
        
        if safe_to_delete:
            print("Unconfirmed admins (is_confirmed = 0):")
            for admin in safe_to_delete:
                print(f"   - ID {admin.id}: {admin.name} ({admin.email})")
        else:
            print("No unconfirmed admins found - all admins are confirmed")
        
        print()
        print("💡 TIP: Use the API endpoints to delete specific admins:")
        print("   GET  /users/inspect/admins - View all admins")
        print("   DELETE /users/inspect/admins/{id} - Delete specific admin")
        print("   DELETE /users/inspect/admins/cleanup/unconfirmed - Delete all unconfirmed")
        
    except Exception as e:
        print(f"❌ Error inspecting database: {str(e)}")
    finally:
        db.close()

def cleanup_unconfirmed():
    """Clean up unconfirmed admins"""
    db = SessionLocal()
    try:
        print("🧹 CLEANING UP UNCONFIRMED ADMINS")
        print("=" * 40)
        
        unconfirmed_admins = db.query(models.Admin).filter(models.Admin.is_confirmed == 0).all()
        
        if not unconfirmed_admins:
            print("✅ No unconfirmed admins found")
            return
        
        print(f"Found {len(unconfirmed_admins)} unconfirmed admins:")
        for admin in unconfirmed_admins:
            print(f"   - ID {admin.id}: {admin.name} ({admin.email})")
        
        print()
        response = input("Do you want to delete these admins? (y/N): ")
        
        if response.lower() == 'y':
            for admin in unconfirmed_admins:
                print(f"Deleting admin ID {admin.id}: {admin.name}")
                db.delete(admin)
            
            db.commit()
            print(f"✅ Successfully deleted {len(unconfirmed_admins)} unconfirmed admins")
        else:
            print("❌ Cleanup cancelled")
            
    except Exception as e:
        print(f"❌ Error during cleanup: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🐾 Pawthos Database Inspector")
    print("=" * 30)
    print()
    
    if len(sys.argv) > 1 and sys.argv[1] == "cleanup":
        cleanup_unconfirmed()
    else:
        inspect_admins()
        print()
        print("To clean up unconfirmed admins, run:")
        print("python inspect_database.py cleanup")
