#!/usr/bin/env python3
"""
Setup Enhanced AI Processing
This script helps set up the enhanced AI processing capabilities.
"""

import os
import sys
import subprocess
from pathlib import Path

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing enhanced AI dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai==0.3.2"])
        print("✅ Enhanced AI dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_api_key():
    """Check if API key is configured"""
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "your_gemini_api_key_here":
        print("✅ GEMINI_API_KEY is configured")
        return True
    else:
        print("⚠️  GEMINI_API_KEY not configured")
        print("📝 To configure:")
        print("   1. Get API key from: https://makersuite.google.com/app/apikey")
        print("   2. Set environment variable: GEMINI_API_KEY=your_key_here")
        print("   3. Or add to .env file: GEMINI_API_KEY=your_key_here")
        return False

def test_import():
    """Test if enhanced AI can be imported"""
    try:
        from alembic.versions.enhanced_ai_processor import enhanced_ai_assessment, is_enhanced_ai_available
        print("✅ Enhanced AI module imported successfully")
        return True
    except ImportError as e:
        print(f"❌ Failed to import enhanced AI module: {e}")
        return False

def test_ai_service():
    """Test AI service integration"""
    try:
        from services.ai_service import ai_service, ENHANCED_AI_AVAILABLE
        print(f"✅ AI service integration: {ENHANCED_AI_AVAILABLE}")
        return True
    except Exception as e:
        print(f"❌ AI service integration failed: {e}")
        return False

def main():
    """Run setup process"""
    print("🚀 Setting up Enhanced AI Processing")
    print("=" * 50)
    
    steps = [
        ("Install Dependencies", install_dependencies),
        ("Check API Key", check_api_key),
        ("Test Import", test_import),
        ("Test AI Service", test_ai_service),
    ]
    
    results = []
    
    for step_name, step_func in steps:
        print(f"\n🔧 {step_name}")
        print("-" * 30)
        try:
            result = step_func()
            results.append((step_name, result))
        except Exception as e:
            print(f"❌ Step failed: {e}")
            results.append((step_name, False))
    
    print("\n" + "=" * 50)
    print("📊 Setup Results")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for step_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {step_name}")
    
    print(f"\n🎯 Overall: {passed}/{total} steps completed")
    
    if passed == total:
        print("🎉 Enhanced AI processing is ready!")
        print("\n📝 Next steps:")
        print("1. Set GEMINI_API_KEY environment variable")
        print("2. Restart your backend server")
        print("3. Test with: python test_enhanced_processing.py")
    else:
        print("⚠️  Some setup steps failed. Check the errors above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
