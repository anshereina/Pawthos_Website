import warnings
import os
import logging
from typing import Optional, Dict, Any

# Suppress deprecation warnings
warnings.filterwarnings("ignore", category=UserWarning, module="torchvision")

# Import ELD (Ensemble Landmark Detector) processor - This is the only method we use
try:
    from services.enhanced_ai_processor import process_image_with_enhanced_ai
    ENHANCED_AI_AVAILABLE = True
    logging.info("✅ ELD processor imported successfully")
except ImportError as e:
    ENHANCED_AI_AVAILABLE = False
    logging.error(f"❌ ELD processor not available: {e}")
    import traceback
    logging.error(f"Traceback: {traceback.format_exc()}")

class AIService:
    """Service for AI-powered pain assessment using ELD (Ensemble Landmark Detector) model"""
    
    def __init__(self):
        # Simple initialization - we use ELD model for pain assessment
        logging.info("AIService initialized for ELD model processing")
    
    def predict_pain_eld(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        AI-powered pain prediction using ELD (Ensemble Landmark Detector) model
        """
        # Use ELD model for pain assessment
        if ENHANCED_AI_AVAILABLE:
            logging.info("Using ELD model for pain assessment")
            return process_image_with_enhanced_ai(image_bytes)
        else:
            raise ValueError("ELD model is not available. Please check API configuration.")
    
    def predict_pain_basic(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Basic pain prediction - redirects to ELD model
        """
        return self.predict_pain_eld(image_bytes)

# Global instance - wrap in try-except to prevent import failures
# Allow import to succeed even if initialization fails, so router can handle it gracefully
try:
    # Only create AIService if we have ELD model available
    if ENHANCED_AI_AVAILABLE:
        ai_service = AIService()
        logging.info("✅ AI Service initialized successfully with ELD model")
    else:
        logging.error("❌ ELD model not available - AI service disabled")
        ai_service = None
except Exception as e:
    logging.error(f"❌ Failed to initialize AI Service: {e}")
    import traceback
    logging.error(f"Traceback: {traceback.format_exc()}")
    # Set to None so router can detect and return proper error
    ai_service = None
