#!/usr/bin/env python3
"""
Test script to verify Enhanced AI Processor is working
"""
import os
import sys

def test_enhanced_ai():
    """Test if Enhanced AI Processor is available and working"""
    print("🔍 Testing Enhanced AI Processor...")
    
    # Check environment variables
    ai_key = os.getenv("AI_API_KEY")
    if ai_key:
        print(f"✅ AI_API_KEY is set: {ai_key[:10]}...")
    else:
        print("❌ AI_API_KEY is not set")
        return False
    
    # Test import
    try:
        from services.enhanced_ai_processor import is_enhanced_ai_available, process_image_with_enhanced_ai
        print("✅ Enhanced AI processor imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import Enhanced AI processor: {e}")
        return False
    
    # Test availability
    try:
        available = is_enhanced_ai_available()
        if available:
            print("✅ Enhanced AI Processor is available and ready")
            return True
        else:
            print("❌ Enhanced AI Processor is not available")
            return False
    except Exception as e:
        print(f"❌ Error checking Enhanced AI availability: {e}")
        return False

def test_ai_service_integration():
    """Test AI service integration"""
    print("\n🔍 Testing AI Service Integration...")
    
    try:
        from services.ai_service import ai_service, ENHANCED_AI_AVAILABLE
        print(f"✅ AI Service imported successfully")
        print(f"✅ ENHANCED_AI_AVAILABLE: {ENHANCED_AI_AVAILABLE}")
        
        if ENHANCED_AI_AVAILABLE:
            print("✅ AI Service will use Enhanced AI Processor (Gemini)")
            return True
        else:
            print("❌ AI Service will fallback to ELD model")
            return False
    except Exception as e:
        print(f"❌ Error testing AI service: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Enhanced AI Processor Test")
    print("=" * 50)
    
    # Test Enhanced AI Processor
    enhanced_ai_works = test_enhanced_ai()
    
    # Test AI Service Integration
    ai_service_works = test_ai_service_integration()
    
    print("\n" + "=" * 50)
    if enhanced_ai_works and ai_service_works:
        print("🎉 SUCCESS: Enhanced AI Processor is working!")
        print("📝 The system will now use Gemini AI for accurate visual landmarks")
    else:
        print("❌ ISSUE: Enhanced AI Processor is not working")
        print("📝 The system will fallback to ELD model (no visual dots)")
    
    print("\n💡 To fix issues:")
    print("1. Make sure AI_API_KEY is set in environment")
    print("2. Install dependencies: pip install google-generativeai")
    print("3. Restart the backend server")




