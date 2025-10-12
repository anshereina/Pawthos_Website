from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.auth import get_current_user
from core.models import User
from services.ai_service import ai_service
import logging

router = APIRouter()
security = HTTPBearer()

@router.post("/predict")
async def predict_pain_basic(file: UploadFile = File(...)):
    """
    Basic pain prediction endpoint using Haar cascades and heuristics
    """
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_bytes = file.file.read()
        result = ai_service.predict_pain_basic(image_bytes)
        return result
        
    except ValueError as e:
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
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_bytes = file.file.read()
        result = ai_service.predict_pain_eld(image_bytes)
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
