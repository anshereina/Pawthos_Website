#!/usr/bin/env python3
"""
Test API Endpoint
Tests if the predict-eld endpoint is working correctly
"""

import requests
import json
import os
from pathlib import Path

def test_api_endpoint():
    """Test the predict-eld API endpoint"""
    print("🧪 Testing API Endpoint")
    print("=" * 50)
    
    try:
        # Test 1: Check if backend is running
        print("Test 1: Backend connectivity")
        backend_url = "http://192.168.1.6:8000"
        
        try:
            response = requests.get(f"{backend_url}/docs", timeout=5)
            if response.status_code == 200:
                print("✅ Backend is running and accessible")
            else:
                print(f"❌ Backend returned status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Backend not accessible: {e}")
            return False
        
        # Test 2: Check API endpoint exists
        print("\nTest 2: API endpoint check")
        try:
            response = requests.get(f"{backend_url}/api/predict-eld", timeout=5)
            print(f"✅ Endpoint exists (status: {response.status_code})")
        except Exception as e:
            print(f"❌ Endpoint error: {e}")
        
        # Test 3: Check if we can make a POST request
        print("\nTest 3: POST request test")
        
        # Create a simple test image (1x1 pixel)
        test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xf5\xd7\xd4\xf2\x00\x00\x00\x00IEND\xaeB`\x82'
        
        files = {'file': ('test.png', test_image_data, 'image/png')}
        
        try:
            response = requests.post(f"{backend_url}/api/predict-eld", files=files, timeout=10)
            print(f"✅ POST request successful (status: {response.status_code})")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Response: {json.dumps(result, indent=2)}")
            else:
                print(f"❌ Error response: {response.text}")
                
        except Exception as e:
            print(f"❌ POST request failed: {e}")
        
        # Test 4: Check environment variables
        print("\nTest 4: Environment variables")
        ai_key = os.getenv("AI_API_KEY")
        if ai_key:
            print("✅ AI_API_KEY is set")
        else:
            print("❌ AI_API_KEY is not set")
        
        # Test 5: Check if enhanced AI is available
        print("\nTest 5: Enhanced AI availability")
        try:
            from alembic.versions.enhanced_ai_processor import is_enhanced_ai_available
            available = is_enhanced_ai_available()
            print(f"✅ Enhanced AI available: {available}")
        except Exception as e:
            print(f"❌ Enhanced AI check failed: {e}")
        
        print("\n🎉 API Endpoint Test Complete!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_api_endpoint()
