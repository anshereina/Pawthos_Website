"""
Simple script to verify Railway deployment is working correctly.
Run this locally to check if your deployed API is responding.

Usage:
    python core/check_deployment.py https://your-app.up.railway.app
"""

import sys
import requests
import json

def check_endpoint(base_url, endpoint, method="GET", description=""):
    """Check if an endpoint is responding"""
    url = f"{base_url}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        else:
            response = requests.post(url, timeout=10)
        
        if response.status_code < 400:
            print(f"✅ {description or endpoint}: OK ({response.status_code})")
            if response.headers.get('content-type') == 'application/json':
                print(f"   Response: {json.dumps(response.json(), indent=2)[:100]}...")
            return True
        else:
            print(f"❌ {description or endpoint}: FAILED ({response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {description or endpoint}: ERROR - {str(e)}")
        return False

def main():
    if len(sys.argv) < 2:
        print("❌ Error: Please provide your Railway app URL")
        print("Usage: python core/check_deployment.py https://your-app.up.railway.app")
        sys.exit(1)
    
    base_url = sys.argv[1].rstrip('/')
    
    print(f"🔍 Checking deployment at: {base_url}\n")
    
    checks = [
        ("/", "Root endpoint"),
        ("/health", "Health check"),
        ("/test-cors", "CORS test"),
        ("/docs", "API documentation"),
    ]
    
    passed = 0
    total = len(checks)
    
    for endpoint, description in checks:
        if check_endpoint(base_url, endpoint, description=description):
            passed += 1
        print()
    
    print(f"\n{'='*50}")
    print(f"Results: {passed}/{total} checks passed")
    
    if passed == total:
        print("🎉 All checks passed! Your deployment is working perfectly!")
    elif passed > 0:
        print("⚠️  Some checks failed. Check the logs above.")
    else:
        print("❌ All checks failed. Your deployment may not be working.")
    print(f"{'='*50}\n")
    
    # Additional info
    print("📝 Next steps:")
    print(f"   1. Visit {base_url}/docs for API documentation")
    print(f"   2. Test authentication endpoints")
    print(f"   3. Update your frontend API URL to: {base_url}")
    print(f"   4. Update your mobile app API URL to: {base_url}")

if __name__ == "__main__":
    main()

