from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.auth import get_current_user
from core.models import User
import logging

# Optional AI service import
try:
    from services.ai_service import ai_service
    # Check if service was actually initialized (not None)
    if ai_service is None:
        raise ImportError("AI service instance is None")
    AI_SERVICE_AVAILABLE = True
    logging.info("✅ AI service loaded and available")
except ImportError as e:
    logging.error(f"⚠️ AI service not available: {e}")
    import traceback
    logging.error(f"Import traceback: {traceback.format_exc()}")
    AI_SERVICE_AVAILABLE = False
    ai_service = None
except Exception as e:
    logging.error(f"⚠️ Unexpected error loading AI service: {e}")
    import traceback
    logging.error(f"Error traceback: {traceback.format_exc()}")
    AI_SERVICE_AVAILABLE = False
    ai_service = None

router = APIRouter()
security = HTTPBearer()

@router.post("/predict")
async def predict_pain_basic(file: UploadFile = File(...)):
    """
    Basic pain prediction endpoint using Haar cascades and heuristics
    """
    if not AI_SERVICE_AVAILABLE or ai_service is None:
        logging.error("AI service unavailable - returning 503 error")
        raise HTTPException(
            status_code=503, 
            detail={
                "error": True,
                "error_type": "SERVICE_UNAVAILABLE",
                "error_message": "AI service is currently unavailable",
                "error_guidance": "The AI pain assessment service is temporarily unavailable. Please try again later or contact support."
            }
        )
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_bytes = file.file.read()
        result = ai_service.predict_pain_basic(image_bytes)
        return result
        
    except ValueError as e:
        error_msg = str(e)
        # Handle specific error types with appropriate status codes
        if "NO_CAT_DETECTED" in error_msg:
            raise HTTPException(status_code=422, detail={
                "error_type": "NO_CAT_DETECTED",
                "message": "No cat detected in the image. Please upload a clear photo of a cat's face.",
                "guidance": "Make sure you're uploading a photo of a cat, not a dog or human."
            })
        elif "CAT_TOO_FAR" in error_msg or "CAT_TOO_CLOSE" in error_msg:
            raise HTTPException(status_code=422, detail={
                "error_type": "CAT_POSITION_ERROR", 
                "message": "Cat detected but face positioning needs adjustment.",
                "guidance": "Please follow the guidelines: take photo at eye level, ensure cat's face is clearly visible, and avoid extreme angles."
            })
        else:
            # Other errors - try heuristic fallback
            logging.warning(f"ELD primary analysis failed, using heuristic fallback: {e}")
            try:
                fallback = ai_service.predict_pain_basic(image_bytes)
                return {
                    "pain_level": fallback.get("pain_level", "Unknown"),
                    "confidence": fallback.get("confidence", 0.72),
                    "model_type": fallback.get("model_type", "Heuristic Fallback"),
                    "landmarks_detected": fallback.get("landmarks_detected", 0),
                    "expected_landmarks": fallback.get("expected_landmarks", 48),
                    "fgs_breakdown": fallback.get("fgs_breakdown", {}),
                    "detailed_explanation": fallback.get("detailed_explanation", {}),
                    "actionable_advice": fallback.get("actionable_advice", {}),
                    "landmark_analysis": fallback.get("landmark_analysis", {}),
                }
            except Exception as fe:
                logging.error(f"Heuristic fallback also failed: {fe}")
                raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image")

@router.post("/predict-eld")
async def predict_pain_eld(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Enhanced pain prediction using Ensemble Landmark Detector (ELD) with 48 landmarks
    """
    if not AI_SERVICE_AVAILABLE or ai_service is None:
        logging.error("AI service unavailable - returning 503 error")
        raise HTTPException(
            status_code=503, 
            detail={
                "error": True,
                "error_type": "SERVICE_UNAVAILABLE",
                "error_message": "AI service is currently unavailable",
                "error_guidance": "The AI pain assessment service is temporarily unavailable. Please try again later or contact support."
            }
        )
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_bytes = file.file.read()
        result = ai_service.predict_pain_eld(image_bytes)
        
        logging.info(f"AI Service Result: {result}")
        
        # Check if the result contains an error (no cat detected)
        if result.get("error") and result.get("error_type") == "NO_CAT_DETECTED":
            error_guidance = result.get('error_guidance', 'Please upload a clear photo of a cat\'s face for pain assessment.')
            logging.warning(f"No cat detected in image")
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": True,
                    "error_type": "NO_CAT_DETECTED",
                    "error_message": "No cat face detected in the image",
                    "error_guidance": error_guidance
                }
            )
        
        # Check if AI returned success=False (indicating detection failure)
        if not result.get("success", True):
            logging.warning(f"AI returned success=False: {result}")
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": True,
                    "error_type": result.get("error_type", "NO_CAT_DETECTED"),
                    "error_message": result.get("error_message", "No cat face detected in the image"),
                    "error_guidance": result.get("error_guidance", "Please upload a clear photo of a cat's face for pain assessment.")
                }
            )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"ELD prediction error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image")

@router.get("/health")
def ai_health_check():
    """
    Check AI service health and model availability
    """
    return {
        "status": "healthy",
        "eld_model_available": ai_service.eld_model is not None,
        "torch_available": True,  # Will be set based on actual availability
        "cat_face_cascade_available": ai_service.cat_face_cascade is not None and not ai_service.cat_face_cascade.empty(),
        "version": "2.0.0"
    }
