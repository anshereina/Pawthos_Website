import warnings
import os
import logging
from typing import Optional, Dict, Any

# Suppress deprecation warnings
warnings.filterwarnings("ignore", category=UserWarning, module="torchvision")

# Import Enhanced AI Processor (Gemini) - This is the only method we use
try:
    from services.enhanced_ai_processor import process_image_with_enhanced_ai
    ENHANCED_AI_AVAILABLE = True
    logging.info("✅ Enhanced AI processor (Gemini) imported successfully")
except ImportError as e:
    ENHANCED_AI_AVAILABLE = False
    logging.error(f"❌ Enhanced AI processor not available: {e}")
    import traceback
    logging.error(f"Traceback: {traceback.format_exc()}")

class AIService:
    """Service for AI-powered pain assessment using Gemini AI"""
    
    def __init__(self):
        # Simple initialization - we only use Gemini AI
        logging.info("AIService initialized for Gemini AI processing")
    
    def predict_pain_eld(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        AI-powered pain prediction using Gemini AI
        """
        # Use Gemini AI for pain assessment
        if ENHANCED_AI_AVAILABLE:
            logging.info("Using Gemini AI for pain assessment")
            return process_image_with_enhanced_ai(image_bytes)
        else:
            raise ValueError("Gemini AI is not available. Please check API configuration.")
    
    def predict_pain_basic(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Basic pain prediction - redirects to Gemini AI
        """
        return self.predict_pain_eld(image_bytes)

# Global instance - wrap in try-except to prevent import failures
# Allow import to succeed even if initialization fails, so router can handle it gracefully
try:
    # Only create AIService if we have Enhanced AI (Gemini) available
    if ENHANCED_AI_AVAILABLE:
        ai_service = AIService()
        logging.info("✅ AI Service initialized successfully with Enhanced AI (Gemini)")
    else:
        logging.error("❌ Enhanced AI (Gemini) not available - AI service disabled")
        ai_service = None
except Exception as e:
    logging.error(f"❌ Failed to initialize AI Service: {e}")
    import traceback
    logging.error(f"Traceback: {traceback.format_exc()}")
    # Set to None so router can detect and return proper error
    ai_service = None
