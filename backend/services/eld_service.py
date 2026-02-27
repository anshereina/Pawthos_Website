import warnings
import os
import logging
from typing import Optional, Dict, Any

# Suppress deprecation warnings
warnings.filterwarnings("ignore", category=UserWarning, module="torchvision")

# Import ELD (Ensemble Landmark Detector) processor - This is the only method we use
try:
    from services.enhanced_eld_processor import process_image_with_enhanced_eld
    ENHANCED_ELD_AVAILABLE = True
    logging.info("✅ ELD processor imported successfully")
except ImportError as e:
    ENHANCED_ELD_AVAILABLE = False
    logging.error(f"❌ ELD processor not available: {e}")
    import traceback
    logging.error(f"Traceback: {traceback.format_exc()}")

class ELDService:
    """Service for ELD-powered pain assessment using ELD (Ensemble Landmark Detector) model"""
    
    def __init__(self):
        # Simple initialization - we use ELD model for pain assessment
        logging.info("ELDService initialized for ELD model processing")
    
    def predict_pain_eld(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        ELD-powered pain prediction using ELD (Ensemble Landmark Detector) model
        """
        # Use ELD model for pain assessment
        if ENHANCED_ELD_AVAILABLE:
            logging.info("Using ELD model for pain assessment")
            return process_image_with_enhanced_eld(image_bytes)
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
    # Only create ELDService if we have ELD model available
    if ENHANCED_ELD_AVAILABLE:
        eld_service = ELDService()
        logging.info("✅ ELD Service initialized successfully with ELD model")
    else:
        logging.error("❌ ELD model not available - ELD service disabled")
        eld_service = None
except Exception as e:
    logging.error(f"❌ Failed to initialize ELD Service: {e}")
    import traceback
    logging.error(f"Traceback: {traceback.format_exc()}")
    # Set to None so router can detect and return proper error
    eld_service = None
