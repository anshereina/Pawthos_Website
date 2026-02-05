"""
AI Processing Library Wrapper

This module provides a generic interface for AI model processing.
Used by the ELD (Ensemble Landmark Detector) system for enhanced processing.
"""

import os
import logging
from typing import Optional, Any

# Model name mapping: Generic names -> Actual model identifiers
# This allows us to use generic names while maintaining compatibility
MODEL_MAPPING = {
    "eld-model-v3": "gemini-3-flash-preview",
    "eld-model-v2": "gemini-2.0-flash",
    "eld-model-v1.5": "gemini-1.5-flash",
    "eld-model-pro": "gemini-1.5-pro",
    "eld-model-classic": "gemini-pro",
    # Backward compatibility - direct model names still work
    "gemini-3-flash-preview": "gemini-3-flash-preview",
    "gemini-2.0-flash": "gemini-2.0-flash",
    "gemini-1.5-flash": "gemini-1.5-flash",
    "gemini-1.5-pro": "gemini-1.5-pro",
    "gemini-pro": "gemini-pro",
}

# Default model
DEFAULT_MODEL = "eld-model-v3"

# Try to import the AI processing library
try:
    import google.generativeai as _ai_library
    _LIBRARY_AVAILABLE = True
except ImportError:
    _LIBRARY_AVAILABLE = False
    _ai_library = None
    logging.warning("AI processing library not available. Install with: pip install ai-processing-dependencies")


def is_available() -> bool:
    """Check if AI processing library is available"""
    return _LIBRARY_AVAILABLE and _ai_library is not None


def configure(api_key: str) -> None:
    """
    Configure the AI processing library with API key
    
    Args:
        api_key: API key for AI processing service
    """
    if not _LIBRARY_AVAILABLE:
        raise RuntimeError("AI processing library is not available")
    
    try:
        _ai_library.configure(api_key=api_key)
        logging.info("AI processing library configured successfully")
    except Exception as e:
        logging.error(f"Failed to configure AI processing library: {e}")
        raise


def get_model_name(generic_name: Optional[str] = None) -> str:
    """
    Get the actual model name from a generic name
    
    Args:
        generic_name: Generic model name (e.g., "eld-model-v3")
        
    Returns:
        Actual model identifier to use
    """
    if not generic_name:
        generic_name = DEFAULT_MODEL
    
    # Check if it's already a direct model name
    if generic_name in MODEL_MAPPING:
        return MODEL_MAPPING[generic_name]
    
    # If not found, return as-is (might be a direct model name)
    return generic_name


def create_model(model_name: Optional[str] = None) -> Any:
    """
    Create an AI model instance
    
    Args:
        model_name: Generic model name (e.g., "eld-model-v3") or direct model name
        
    Returns:
        Model instance
    """
    if not _LIBRARY_AVAILABLE:
        raise RuntimeError("AI processing library is not available")
    
    actual_model_name = get_model_name(model_name)
    logging.debug(f"Creating AI model: {actual_model_name} (from generic: {model_name})")
    return _ai_library.GenerativeModel(actual_model_name)


def get_fallback_models(primary_model: Optional[str] = None) -> list:
    """
    Get fallback models if primary model fails
    
    Args:
        primary_model: Primary model name (generic or direct)
        
    Returns:
        List of fallback model names
    """
    actual_primary = get_model_name(primary_model)
    
    # Map to fallback models based on primary
    fallback_map = {
        "gemini-3-flash-preview": ["gemini-2.0-flash", "gemini-1.5-flash"],
        "gemini-2.0-flash": ["gemini-1.5-flash", "gemini-1.5-pro"],
        "gemini-1.5-flash": ["gemini-1.5-pro", "gemini-pro"],
        "gemini-1.5-pro": ["gemini-pro"],
    }
    
    return fallback_map.get(actual_primary, [])

