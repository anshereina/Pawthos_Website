"""
Test Script for Placeholder Account Claiming

This script tests the complete flow of placeholder account creation and claiming.
Run this after applying the database migration.

Requirements:
- Backend server should be running
- Database migration should be applied
- Update API_BASE_URL if different
"""

import requests
import json
from datetime import datetime

API_BASE_URL = "http://localhost:8000"

def print_separator():
    print("\n" + "="*80 + "\n")

def test_placeholder_claiming():
    print("🧪 Starting Placeholder Account Claiming Test")
    print_separator()
    
    # Test 1: Create a placeholder user through vaccination record
    print("TEST 1: Creating a pet with owner (creates placeholder user)")
    print("-" * 80)
    
    test_owner_name = f"Test Owner {datetime.now().strftime('%Y%m%d%H%M%S')}"
    print(f"Owner Name: {test_owner_name}")
    
    # First, we need to authenticate as admin to create records
    # You'll need to update these credentials
    admin_email = "admin@pawthos.com"
    admin_password = "admin123"
    
    print("\n🔐 Logging in as admin...")
    login_response = requests.post(
        f"{API_BASE_URL}/auth/login",
        json={"email": admin_email, "password": admin_password}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Admin login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        print("\n⚠️  Please update admin credentials in the test script")
        return False
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Admin login successful")
    
    # Create a pet (which will auto-create a placeholder user)
    print("\n📝 Creating pet record...")
    pet_data = {
        "name": "Fluffy",
        "owner_name": test_owner_name,
        "species": "feline",
        "date_of_birth": "2023-01-01",
        "color": "white",
        "breed": "Persian",
        "gender": "female",
        "reproductive_status": "spayed"
    }
    
    pet_response = requests.post(
        f"{API_BASE_URL}/pets/",
        json=pet_data,
        headers=headers
    )
    
    if pet_response.status_code not in [200, 201]:
        print(f"❌ Pet creation failed: {pet_response.status_code}")
        print(f"Response: {pet_response.text}")
        return False
    
    pet_id = pet_response.json()["id"]
    print(f"✅ Pet created with ID: {pet_id}")
    
    # Create vaccination record (this triggers placeholder user creation)
    print("\n💉 Creating vaccination record...")
    vacc_data = {
        "pet_id": pet_id,
        "vaccine_name": "Rabies",
        "date_given": datetime.now().strftime("%Y-%m-%d"),
        "next_due_date": "2025-01-01",
        "veterinarian": "Dr. Test",
        "batch_lot_no": "TEST123"
    }
    
    vacc_response = requests.post(
        f"{API_BASE_URL}/vaccination_records/",
        json=vacc_data,
        headers=headers
    )
    
    if vacc_response.status_code not in [200, 201]:
        print(f"❌ Vaccination record creation failed: {vacc_response.status_code}")
        print(f"Response: {vacc_response.text}")
        return False
    
    print(f"✅ Vaccination record created")
    
    # Verify placeholder user was created
    print("\n🔍 Checking for placeholder user...")
    users_response = requests.get(f"{API_BASE_URL}/users/", headers=headers)
    
    if users_response.status_code != 200:
        print(f"❌ Failed to fetch users: {users_response.status_code}")
        return False
    
    users = users_response.json()
    placeholder_user = None
    
    for user in users:
        if user.get("name") == test_owner_name and "@placeholder.local" in user.get("email", ""):
            placeholder_user = user
            break
    
    if not placeholder_user:
        print(f"❌ Placeholder user not found for {test_owner_name}")
        print(f"Expected: is_placeholder=1, email ending with @placeholder.local")
        return False
    
    print(f"✅ Placeholder user found:")
    print(f"   User ID: {placeholder_user['id']}")
    print(f"   Name: {placeholder_user['name']}")
    print(f"   Email: {placeholder_user['email']}")
    print(f"   Is Confirmed: {placeholder_user.get('is_confirmed', 'N/A')}")
    
    placeholder_user_id = placeholder_user['id']
    
    print_separator()
    
    # Test 2: Register with real credentials (should claim placeholder)
    print("TEST 2: Registering with real credentials (claiming placeholder)")
    print("-" * 80)
    
    real_email = f"test.{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
    print(f"Registering with email: {real_email}")
    print(f"Using name: {test_owner_name}")
    
    register_data = {
        "name": test_owner_name,
        "email": real_email,
        "password": "TestPass123!",
        "phone_number": "09123456789",
        "address": "Test Address"
    }
    
    register_response = requests.post(
        f"{API_BASE_URL}/api/register",
        json=register_data
    )
    
    if register_response.status_code not in [200, 201]:
        print(f"❌ Registration failed: {register_response.status_code}")
        print(f"Response: {register_response.text}")
        return False
    
    registered_user = register_response.json()
    print(f"✅ Registration successful!")
    print(f"   User ID: {registered_user['id']}")
    print(f"   Name: {registered_user['name']}")
    print(f"   Email: {registered_user['email']}")
    
    print_separator()
    
    # Test 3: Verify account was claimed (same user_id)
    print("TEST 3: Verifying account claiming")
    print("-" * 80)
    
    if registered_user['id'] == placeholder_user_id:
        print(f"✅ SUCCESS! Placeholder account was claimed!")
        print(f"   Same User ID: {registered_user['id']}")
        print(f"   Old Email: {placeholder_user['email']}")
        print(f"   New Email: {registered_user['email']}")
    else:
        print(f"❌ FAILED! New user account was created instead of claiming")
        print(f"   Placeholder User ID: {placeholder_user_id}")
        print(f"   Registered User ID: {registered_user['id']}")
        return False
    
    print_separator()
    
    # Test 4: Verify user can login with new credentials
    print("TEST 4: Testing login with claimed account")
    print("-" * 80)
    
    login_data = {
        "email": real_email,
        "password": "TestPass123!"
    }
    
    user_login_response = requests.post(
        f"{API_BASE_URL}/api/login",
        json=login_data
    )
    
    if user_login_response.status_code != 200:
        print(f"❌ Login failed: {user_login_response.status_code}")
        print(f"Response: {user_login_response.text}")
        return False
    
    print(f"✅ Login successful!")
    user_token = user_login_response.json()["access_token"]
    print(f"   Access token received: {user_token[:20]}...")
    
    print_separator()
    
    # Test 5: Verify pet records are linked to claimed account
    print("TEST 5: Verifying pet records are linked to claimed account")
    print("-" * 80)
    
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # Get user's pets
    pets_response = requests.get(
        f"{API_BASE_URL}/pets/",
        headers=user_headers
    )
    
    if pets_response.status_code != 200:
        print(f"❌ Failed to fetch pets: {pets_response.status_code}")
        return False
    
    user_pets = pets_response.json()
    found_pet = False
    
    for pet in user_pets:
        if pet.get("id") == pet_id:
            found_pet = True
            print(f"✅ Pet found linked to claimed account!")
            print(f"   Pet ID: {pet['id']}")
            print(f"   Pet Name: {pet['name']}")
            print(f"   Owner Name: {pet['owner_name']}")
            break
    
    if not found_pet:
        print(f"❌ Pet not found in claimed account's pets")
        print(f"   Looking for Pet ID: {pet_id}")
        return False
    
    print_separator()
    
    # All tests passed!
    print("🎉 ALL TESTS PASSED!")
    print("\nSummary:")
    print("✅ Placeholder user created automatically")
    print("✅ Real user signup claimed placeholder account")
    print("✅ Same user_id maintained")
    print("✅ Login works with new credentials")
    print("✅ Pet records remain linked to the account")
    print("\n🎯 Placeholder Account Claiming is working correctly!")
    
    return True

def test_new_user_signup():
    """Test that new users without placeholders still work normally"""
    print("\n\n🧪 Testing new user signup (no placeholder)")
    print_separator()
    
    new_email = f"newuser.{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
    new_name = f"New User {datetime.now().strftime('%H%M%S')}"
    
    register_data = {
        "name": new_name,
        "email": new_email,
        "password": "NewPass123!",
        "phone_number": "09987654321",
        "address": "New Address"
    }
    
    print(f"Registering new user: {new_name}")
    print(f"Email: {new_email}")
    
    register_response = requests.post(
        f"{API_BASE_URL}/api/register",
        json=register_data
    )
    
    if register_response.status_code not in [200, 201]:
        print(f"❌ Registration failed: {register_response.status_code}")
        print(f"Response: {register_response.text}")
        return False
    
    user = register_response.json()
    print(f"✅ New user created successfully!")
    print(f"   User ID: {user['id']}")
    print(f"   Name: {user['name']}")
    print(f"   Email: {user['email']}")
    
    return True

if __name__ == "__main__":
    print("="*80)
    print("PLACEHOLDER ACCOUNT CLAIMING - INTEGRATION TEST")
    print("="*80)
    print(f"\nAPI Base URL: {API_BASE_URL}")
    print(f"Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Test placeholder claiming
        success = test_placeholder_claiming()
        
        if success:
            # Test normal signup
            success = test_new_user_signup()
        
        print("\n" + "="*80)
        if success:
            print("✅ ALL INTEGRATION TESTS PASSED!")
        else:
            print("❌ SOME TESTS FAILED")
        print("="*80)
        
    except Exception as e:
        print(f"\n❌ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()

