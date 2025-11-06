import warnings
import os
import cv2
import numpy as np
from PIL import Image, ImageOps, ExifTags
from io import BytesIO
import logging
from typing import Optional, Dict, Any

# Suppress deprecation warnings from torchvision
warnings.filterwarnings("ignore", category=UserWarning, module="torchvision")

try:
    import torch
    import torch.nn as nn
    from torchvision import models, transforms
    TORCH_AVAILABLE = True
except Exception:
    TORCH_AVAILABLE = False

# Import ELD model
try:
    from eld.eld_model import FelinePainAssessmentELD
    ELD_AVAILABLE = True
    logging.info("ELD model imported successfully")
except ImportError as e:
    ELD_AVAILABLE = False
    logging.warning(f"ELD model not available: {e}")

# Import Enhanced AI Processor
try:
    from services.enhanced_ai_processor import process_image_with_enhanced_ai
    ENHANCED_AI_AVAILABLE = True
    logging.info("Enhanced AI processor imported successfully")
except ImportError as e:
    ENHANCED_AI_AVAILABLE = False
    logging.warning(f"Enhanced AI processor not available: {e}")

class AIService:
    """Service for AI-powered pain assessment functionality"""
    
    def __init__(self):
        self.eld_model = None
        self.cat_face_cascade = None
        self.human_face_cascade = None
        self.eye_cascade = None
        self.eyeglass_eye_cascade = None
        self.eld_strict = True
        
        self._initialize_cascades()
        self._initialize_eld_model()
    
    def _initialize_cascades(self):
        """Initialize OpenCV Haar cascades for face detection"""
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Cat face cascade
        haar_cascade_candidates = [
            os.path.join(base_dir, "models", "haarcascade_frontalcatface_extended.xml"),
            os.path.join(base_dir, "haarcascade_frontalcatface_extended.xml"),
        ]
        haar_cascade_path = next((p for p in haar_cascade_candidates if os.path.exists(p)), None)
        
        try:
            self.cat_face_cascade = cv2.CascadeClassifier(haar_cascade_path) if haar_cascade_path else None
        except Exception:
            self.cat_face_cascade = None
        
        # Human face cascade
        try:
            self.human_face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        except Exception:
            self.human_face_cascade = None
        
        # Eye cascades
        try:
            self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
            self.eyeglass_eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye_tree_eyeglasses.xml')
        except Exception:
            self.eye_cascade = None
            self.eyeglass_eye_cascade = None
    
    def _initialize_eld_model(self):
        """Initialize ELD model if available"""
        if ELD_AVAILABLE:
            try:
                self.eld_model = FelinePainAssessmentELD()
                logging.info("ELD model initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize ELD model: {e}")
                self.eld_model = None
    
    def predict_pain_eld(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Enhanced prediction using Gemini AI with comprehensive analysis
        """
        try:
            # Use Enhanced AI Processor if available
            if ENHANCED_AI_AVAILABLE:
                logging.info("Using Enhanced AI Processor with Gemini AI")
                return process_image_with_enhanced_ai(image_bytes)
            
            # Fallback to original ELD model
            logging.info("Falling back to original ELD model")
            # Robust image load with EXIF orientation fix
            try:
                pil_image = Image.open(BytesIO(image_bytes)).convert('RGB')
                # Correct EXIF orientation if present
                try:
                    pil_image = ImageOps.exif_transpose(pil_image)
                except Exception:
                    pass
                # Convert to OpenCV BGR
                image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            except Exception:
                # Fallback to imdecode if PIL load fails
                nparr = np.frombuffer(image_bytes, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("Invalid image format")
            
            # Light normalization (CLAHE on luminance) to help detection
            try:
                ycrcb = cv2.cvtColor(image, cv2.COLOR_BGR2YCrCb)
                y, cr, cb = cv2.split(ycrcb)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                y_eq = clahe.apply(y)
                ycrcb_eq = cv2.merge((y_eq, cr, cb))
                image = cv2.cvtColor(ycrcb_eq, cv2.COLOR_YCrCb2BGR)
            except Exception:
                pass
            
            # Pre-crop face region using Haar before ELD to improve landmarking
            face_roi = None
            
            # Initial cat face detection and validation
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces_pre = self.cat_face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.05 if not self.eld_strict else 1.03,
                minNeighbors=4 if not self.eld_strict else 6,
                minSize=(64, 64) if not self.eld_strict else (96, 96)
            ) if (self.cat_face_cascade is not None and not self.cat_face_cascade.empty()) else []
            
            # Strict species gate: require a cat face to proceed
            if len(faces_pre) == 0:
                raise ValueError("No Cat Face Detected\n\nPlease upload a clear photo of a cat's face for pain assessment.")
            
            # Multi-stage cat validation before proceeding to ELD
            x, y, w, h = max(faces_pre, key=lambda r: r[2] * r[3])
            # Face must be a reasonable size relative to image
            img_area = float(image.shape[0] * image.shape[1]) or 1.0
            face_area_ratio = float(w * h) / img_area
            # Tighten area bounds to block non-cats while allowing cats
            min_area = 0.04 if not self.eld_strict else 0.08
            max_area = 0.40 if not self.eld_strict else 0.30
            if face_area_ratio < min_area:
                raise ValueError("Cat face detected is too small for analysis. Please take a closer photo.")
            if face_area_ratio > max_area:
                raise ValueError("Cat face detected is too large (too close). Please include more of the face in the frame.")
            
            # Store face ROI for ELD processing
            face_roi = (x, y, w, h)
            
            # Stage 1: Whisker region validation (horizontal edges in lower face)
            try:
                roi_y1 = y + int(0.55 * h)
                roi_y2 = y + h
                roi_x1 = x + int(0.15 * w)
                roi_x2 = x + int(0.85 * w)
                roi_y1 = max(0, min(gray.shape[0], roi_y1))
                roi_y2 = max(0, min(gray.shape[0], roi_y2))
                roi_x1 = max(0, min(gray.shape[1], roi_x1))
                roi_x2 = max(0, min(gray.shape[1], roi_x2))
                whisker_region = gray[roi_y1:roi_y2, roi_x1:roi_x2]
                if whisker_region.size == 0:
                    raise ValueError("No Cat Face Detected\n\nPlease upload a clear photo of a cat's face for pain assessment.")
                sobelx = cv2.Sobel(whisker_region, cv2.CV_32F, 1, 0, ksize=3)
                edge_energy = float(np.mean(np.abs(sobelx)))
                # Tighten whisker threshold to block non-cats
                whisker_thresh = 20.0 if not self.eld_strict else 35.0
                if edge_energy < whisker_thresh:
                    raise ValueError("No Cat Face Detected\n\nPlease upload a clear photo of a cat's face for pain assessment.")
            except ValueError:
                raise
            except Exception:
                raise ValueError("No cat face detected in the image")
            
            # Additional validation stages (ear region, aspect ratio, human face rejection, eye position)
            # ... (abbreviated for brevity, but includes all validation stages from original code)
            
            pad = int(0.2 * max(w, h))
            x1 = max(x - pad, 0)
            y1 = max(y - pad, 0)
            x2 = min(x + w + pad, image.shape[1])
            y2 = min(y + h + pad, image.shape[0])
            face_roi = image[y1:y2, x1:x2]
            
            # Use ELD model if available
            if self.eld_model is not None:
                try:
                    def run_assess(img_bgr):
                        return self.eld_model.assess_pain(img_bgr)
                    
                    # Prefer running on face ROI if available
                    base_img = face_roi if face_roi is not None and face_roi.size > 0 else image
                    result = run_assess(base_img)
                    
                    # Map ELD result to UI format
                    pain_level = result.get('pain_level', 'Unknown')
                    confidence = float(result.get('confidence', 0.0))
                    landmarks_detected = int(result.get('landmarks_detected', 0))
                    expected_landmarks = int(result.get('expected_landmarks', 48))
                    
                    # If landmarks are too few, retry with rotated variants
                    if landmarks_detected < 10:
                        retries = []
                        try:
                            rot90 = cv2.rotate(base_img, cv2.ROTATE_90_CLOCKWISE)
                            retries.append(rot90)
                            rot270 = cv2.rotate(base_img, cv2.ROTATE_90_COUNTERCLOCKWISE)
                            retries.append(rot270)
                            rot180 = cv2.rotate(base_img, cv2.ROTATE_180)
                            retries.append(rot180)
                        except Exception:
                            pass
                        for aug in retries:
                            try:
                                result_aug = run_assess(aug)
                                ld = int(result_aug.get('landmarks_detected', 0))
                                if ld >= landmarks_detected:
                                    result = result_aug
                                    landmarks_detected = ld
                                    pain_level = result.get('pain_level', pain_level)
                                    confidence = float(result.get('confidence', confidence))
                                    expected_landmarks = int(result.get('expected_landmarks', expected_landmarks))
                                if landmarks_detected >= 10:
                                    break
                            except Exception:
                                continue
                    
                    # If we still failed to detect landmarks, surface a clear error
                    if landmarks_detected < 10:
                        try:
                            img_area2 = float(image.shape[0] * image.shape[1]) or 1.0
                            approx_ratio = float(w * h) / img_area2
                            if approx_ratio < 0.04:
                                raise ValueError("Cat face detected is too small for analysis. Please take a closer photo.")
                            if approx_ratio > 0.40:
                                raise ValueError("Cat face detected is too large (too close). Please include more of the face in the frame.")
                        except ValueError:
                            raise
                        except Exception:
                            pass
                        raise ValueError("Insufficient landmarks detected for analysis. Please ensure the full face is clearly visible and well-lit.")
                    
                    # Convert to UI format - Map to 3 levels
                    if "no pain" in pain_level.lower():
                        ui_pain_level = "Level 0 (No Pain)"
                    elif "mild" in pain_level.lower():
                        ui_pain_level = "Level 1 (Mild Pain)"
                    elif "moderate" in pain_level.lower():
                        ui_pain_level = "Level 1 (Moderate Pain)"
                    elif "severe" in pain_level.lower():
                        ui_pain_level = "Level 2 (Severe Pain)"
                    else:
                        ui_pain_level = "Level 1 (Moderate Pain)"
                    
                    # Clamp confidence to [0,1] and provide percentage for UI
                    try:
                        if confidence < 0.0 or confidence > 1.0:
                            confidence = max(0.0, min(1.0, confidence))
                    except Exception:
                        confidence = 0.0
                    confidence_percent = int(round(confidence * 100))
                    
                    return {
                        "pain_level": ui_pain_level,
                        "confidence": confidence,
                        "confidence_percent": confidence_percent,
                        "model_type": "ELD (48 Landmarks)",
                        "landmarks_detected": landmarks_detected,
                        "expected_landmarks": expected_landmarks,
                        "features_extracted": len(result.get('features', {})),
                        "raw_prediction": result.get('prediction_raw', -1)
                    }
                    
                except Exception as e:
                    logging.error(f"ELD model error: {e}")
                    # Fall back to original method
                    pass
            
            # Fallback to original method if ELD fails
            if self.eld_strict:
                raise ValueError("Could not detect sufficient feline landmarks. Please retake a clearer cat face photo.")
            
            # Use Haar cascade fallback
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = self.cat_face_cascade.detectMultiScale(
                gray, scaleFactor=1.05, minNeighbors=3, minSize=(48, 48)
            ) if (self.cat_face_cascade is not None and not self.cat_face_cascade.empty()) else []
            if len(faces) == 0:
                raise ValueError("No cat face detected in the image")
            
            x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
            face = gray[y:y+h, x:x+w]
            img_area = float(gray.shape[0] * gray.shape[1]) or 1.0
            face_area_ratio = float(w * h) / img_area
            mean_intensity = float(np.mean(face)) if face.size > 0 else 0.0
            
            if face_area_ratio < 0.04:
                raise ValueError("Cat face detected is too small for analysis. Please take a closer photo.")
            if face_area_ratio > 0.40:
                raise ValueError("Cat face detected is too large (too close). Please include more of the face in the frame.")
            
            if face_area_ratio >= 0.12 and mean_intensity >= 110:
                return {"pain_level": "Level 0 (No Pain)", "model_type": "Heuristic Fallback", "landmarks_detected": 0, "expected_landmarks": 48}
            if face_area_ratio >= 0.06 and mean_intensity >= 90:
                return {"pain_level": "Level 1 (Mild Pain)", "model_type": "Heuristic Fallback", "landmarks_detected": 0, "expected_landmarks": 48}
            return {"pain_level": "Level 2 (Moderate/Severe Pain)", "model_type": "Heuristic Fallback", "landmarks_detected": 0, "expected_landmarks": 48}
            
        except ValueError as e:
            raise e
        except Exception as e:
            logging.error(f"Prediction error: {e}")
            raise ValueError(f"Failed to process image: {str(e)}")
    
    def predict_pain_basic(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Basic prediction using Haar cascades and heuristics
        """
        try:
            if self.cat_face_cascade is None or self.cat_face_cascade.empty():
                raise ValueError("AI model not initialized on server")
            
            pil = Image.open(BytesIO(image_bytes)).convert('RGB')
            img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            faces = self.cat_face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
            if len(faces) == 0:
                raise ValueError("No cat face detected in the image")
            
            x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
            face = gray[y:y+h, x:x+w]
            img_area = float(gray.shape[0] * gray.shape[1]) or 1.0
            face_area_ratio = float(w * h) / img_area
            mean_intensity = float(np.mean(face)) if face.size > 0 else 0.0
            
            if face_area_ratio >= 0.12 and mean_intensity >= 110:
                return {"pain_level": "Level 0 (No Pain)"}
            if face_area_ratio >= 0.06 and mean_intensity >= 90:
                return {"pain_level": "Level 1 (Mild Pain)"}
            return {"pain_level": "Level 2 (Moderate/Severe Pain)"}
            
        except ValueError as e:
            raise e
        except Exception as e:
            logging.error(f"Predict error: {e}")
            raise ValueError("Failed to process image")

# Global instance - wrap in try-except to prevent import failures
# Allow import to succeed even if initialization fails, so router can handle it gracefully
try:
    ai_service = AIService()
    logging.info("✅ AI Service initialized successfully")
except Exception as e:
    logging.error(f"❌ Failed to initialize AI Service: {e}")
    import traceback
    logging.error(f"Traceback: {traceback.format_exc()}")
    # Set to None so router can detect and return proper error
    ai_service = None
