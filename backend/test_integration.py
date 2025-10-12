#!/usr/bin/env python3
"""
Integration test script for the unified backend
Tests both web and mobile endpoints
"""

import requests
import json
import sys
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def test_endpoint(method: str, endpoint: str, data: Dict[Any, Any] = None, headers: Dict[str, str] = None) -> Dict[Any, Any]:
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            return {"error": f"Unsupported method: {method}"}
        
        return {
            "status_code": response.status_code,
            "response": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text,
            "success": 200 <= response.status_code < 300
        }
    except Exception as e:
        return {"error": str(e), "success": False}

def test_health_endpoints():
    """Test health check endpoints"""
    print("Testing health endpoints...")
    
    # Test main health endpoint
    result = test_endpoint("GET", "/health")
    print(f"Main health: {result}")
    
    # Test AI health endpoint
    result = test_endpoint("GET", "/api/health")
    print(f"AI health: {result}")
    
    # Test CORS endpoint
    result = test_endpoint("GET", "/test-cors")
    print(f"CORS test: {result}")

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("\nTesting authentication endpoints...")
    
    # Test user registration
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123",
        "phone_number": "+1234567890",
        "address": "Test Address"
    }
    
    result = test_endpoint("POST", "/auth/api/register", user_data)
    print(f"User registration: {result}")
    
    if result.get("success"):
        # Test OTP verification (this will fail without actual email setup)
        otp_data = {
            "contactInfo": "test@example.com",
            "otp_code": "123456",
            "otpMethod": "email"
        }
        result = test_endpoint("POST", "/auth/api/verify-otp", otp_data)
        print(f"OTP verification: {result}")
    
    # Test login (will fail without verified user)
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    result = test_endpoint("POST", "/auth/api/login", login_data)
    print(f"User login: {result}")

def test_pet_endpoints():
    """Test pet management endpoints"""
    print("\nTesting pet endpoints...")
    
    # Test getting pets (will fail without auth)
    result = test_endpoint("GET", "/pets/")
    print(f"Get pets: {result}")
    
    # Test creating pet (will fail without auth)
    pet_data = {
        "name": "Test Pet",
        "owner_name": "Test Owner",
        "species": "canine",
        "date_of_birth": "2020-01-01",
        "color": "Brown",
        "breed": "Labrador",
        "gender": "male",
        "reproductive_status": "intact"
    }
    result = test_endpoint("POST", "/pets/", pet_data)
    print(f"Create pet: {result}")

def test_ai_endpoints():
    """Test AI prediction endpoints"""
    print("\nTesting AI endpoints...")
    
    # Test basic prediction endpoint (will fail without image)
    result = test_endpoint("POST", "/api/predict")
    print(f"Basic prediction: {result}")
    
    # Test ELD prediction endpoint (will fail without auth and image)
    result = test_endpoint("POST", "/api/predict-eld")
    print(f"ELD prediction: {result}")

def test_vaccination_endpoints():
    """Test vaccination endpoints"""
    print("\nTesting vaccination endpoints...")
    
    # Test getting scheduled vaccination events
    result = test_endpoint("GET", "/vaccination-events/scheduled")
    print(f"Get scheduled vaccination events: {result}")
    
    # Test getting vaccination records (will fail without auth)
    result = test_endpoint("GET", "/vaccination-records/")
    print(f"Get vaccination records: {result}")

def main():
    """Run all integration tests"""
    print("Starting integration tests for unified backend...")
    print(f"Testing against: {BASE_URL}")
    print("=" * 50)
    
    try:
        test_health_endpoints()
        test_auth_endpoints()
        test_pet_endpoints()
        test_ai_endpoints()
        test_vaccination_endpoints()
        
        print("\n" + "=" * 50)
        print("Integration tests completed!")
        print("Note: Many endpoints will fail without proper authentication or data.")
        print("This is expected behavior for a basic connectivity test.")
        
    except KeyboardInterrupt:
        print("\nTests interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\nTest suite failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
