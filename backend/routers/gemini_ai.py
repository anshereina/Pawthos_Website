"""
Gemini AI Integration for Feline Pain Assessment

This router provides AI-powered pain assessment using Google's Gemini AI.
Replaces the traditional ELD model with multimodal AI analysis.
Matches the existing 3-level pain system: Level 0, Level 1, Level 2
"""

import os
import logging
import base64
import json
from typing import Optional, Dict, Any
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.orm import Session

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("google-generativeai not installed. Install with: pip install google-generativeai")

from core.database import get_db
from core.models import User, PainAssessment
from core.auth import get_current_user

# Initialize router
router = APIRouter(
    prefix="/api",
    tags=["Gemini AI Pain Assessment"]
)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        logging.info("Gemini AI configured successfully")
    except Exception as e:
        logging.error(f"Failed to configure Gemini AI: {e}")
        GEMINI_AVAILABLE = False
else:
    if not GEMINI_API_KEY:
        logging.warning("GEMINI_API_KEY not found in environment variables")
    GEMINI_AVAILABLE = False


# The expert prompt for Gemini AI - Updated to match existing 3-level system
FELINE_PAIN_ASSESSMENT_PROMPT = """
You are a veterinary AI specialist with expertise in feline pain assessment using the Feline Grimace Scale (FGS).

Analyze this cat's facial features for signs of pain or discomfort. Use the Feline Grimace Scale which evaluates:

**1. Ear Position**
- 0 (No Pain): Ears forward, normal position
- 1 (Mild Pain): Ears slightly apart or slightly rotated
- 2 (Severe Pain): Ears rotated outward and/or flattened against head

**2. Orbital Tightening (Eye Area)**
- 0 (No Pain): Eyes wide open, relaxed
- 1 (Mild Pain): Eyes partially closed, slight squinting
- 2 (Severe Pain): Eyes tightly closed or squinting

**3. Muzzle Tension**
- 0 (No Pain): Muzzle relaxed, rounded
- 1 (Mild Pain): Muzzle shows moderate tension
- 2 (Severe Pain): Muzzle tense, elongated

**4. Whisker Position**
- 0 (No Pain): Whiskers loose and forward
- 1 (Mild Pain): Whiskers slightly pulled back
- 2 (Severe Pain): Whiskers pulled back and flat against face

**5. Head Position**
- 0 (No Pain): Head above shoulder line, alert
- 1 (Mild Pain): Head level with shoulders
- 2 (Severe Pain): Head below shoulder line, withdrawn

**IMPORTANT: Map your assessment to the existing 3-level system:**

**Pain Level Classification:**
- **Level 0 (No Pain)**: FGS score 0-2, no signs of discomfort
- **Level 1 (Mild Pain)**: FGS score 3-5, mild to moderate discomfort  
- **Level 2 (Moderate/Severe Pain)**: FGS score 6-10, severe pain requiring attention

Provide your assessment in JSON format:
```json
{
  "pain_level": "Level 0 (No Pain)" | "Level 1 (Mild Pain)" | "Level 2 (Moderate/Severe Pain)",
  "pain_score": 0-10,
  "fgs_total": 0-10,
  "confidence": 0.0-1.0,
  "indicators": {
    "ear_position": {"score": 0-2, "observation": "..."},
    "orbital_tightening": {"score": 0-2, "observation": "..."},
    "muzzle_tension": {"score": 0-2, "observation": "..."},
    "whisker_position": {"score": 0-2, "observation": "..."},
    "head_position": {"score": 0-2, "observation": "..."}
  },
  "overall_analysis": "...",
  "recommendations": ["...", "..."],
  "urgency": "Low" | "Medium" | "High" | "Critical"
}
```

**Critical: Only use these exact pain levels:**
- "Level 0 (No Pain)"
- "Level 1 (Mild Pain)" 
- "Level 2 (Moderate/Severe Pain)"

Do not use any other pain level descriptions.
"""


def parse_gemini_response(text: str) -> Dict[str, Any]:
    """
    Parse Gemini AI response text to extract structured data
    Maps to existing 3-level pain system: Level 0, Level 1, Level 2
    
    Args:
        text: Raw text response from Gemini
        
    Returns:
        Structured dictionary with pain assessment data
    """
    try:
        # Try to extract JSON from response
        # Sometimes Gemini wraps JSON in markdown code blocks
        if "```json" in text:
            start = text.find("```json") + 7
            end = text.find("```", start)
            json_text = text[start:end].strip()
        elif "```" in text:
            start = text.find("```") + 3
            end = text.find("```", start)
            json_text = text[start:end].strip()
        else:
            json_text = text.strip()
        
        # Parse JSON
        data = json.loads(json_text)
        
        # Validate required fields
        required_fields = ["pain_level", "pain_score", "confidence"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")
        
        # Normalize pain_score to 0-10 range
        pain_score = int(data.get("pain_score", 0))
        pain_score = max(0, min(10, pain_score))
        
        # Normalize confidence to 0-1 range
        confidence = float(data.get("confidence", 0.0))
        confidence = max(0.0, min(1.0, confidence))
        
        # Map to existing 3-level system
        pain_level = data.get("pain_level", "Level 1 (Mild Pain)")
        
        # Ensure we use the exact 3-level system
        if "Level 0" in pain_level or "no pain" in pain_level.lower():
            pain_level = "Level 0 (No Pain)"
        elif "Level 1" in pain_level or "mild" in pain_level.lower():
            pain_level = "Level 1 (Mild Pain)"
        elif "Level 2" in pain_level or "moderate" in pain_level.lower() or "severe" in pain_level.lower():
            pain_level = "Level 2 (Moderate/Severe Pain)"
        else:
            # Default to Level 1 if unclear
            pain_level = "Level 1 (Mild Pain)"
        
        return {
            "success": True,
            "pain_level": pain_level,
            "pain_score": pain_score,
            "fgs_total": data.get("fgs_total", pain_score),
            "confidence": confidence,
            "indicators": data.get("indicators", {}),
            "overall_analysis": data.get("overall_analysis", ""),
            "recommendations": data.get("recommendations", []),
            "urgency": data.get("urgency", "Low"),
            "raw_response": text
        }
        
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse Gemini response as JSON: {e}")
        logging.error(f"Response text: {text[:500]}...")
        
        # Fallback: try to extract basic info from text and map to 3-level system
        pain_level = "Level 1 (Mild Pain)"  # Default
        if "no pain" in text.lower() or "level 0" in text.lower():
            pain_level = "Level 0 (No Pain)"
        elif "mild" in text.lower() or "level 1" in text.lower():
            pain_level = "Level 1 (Mild Pain)"
        elif "moderate" in text.lower() or "severe" in text.lower() or "level 2" in text.lower():
            pain_level = "Level 2 (Moderate/Severe Pain)"
        
        return {
            "success": False,
            "pain_level": pain_level,
            "pain_score": 5,
            "confidence": 0.5,
            "overall_analysis": text[:500],
            "recommendations": ["Unable to parse AI response. Please consult a veterinarian."],
            "raw_response": text,
            "error": "Failed to parse structured response"
        }
    except Exception as e:
        logging.error(f"Error parsing Gemini response: {e}")
        return {
            "success": False,
            "pain_level": "Level 1 (Mild Pain)",
            "pain_score": 5,
            "confidence": 0.0,
            "overall_analysis": "Error processing AI response",
            "recommendations": ["Please consult a veterinarian for proper assessment."],
            "raw_response": text,
            "error": str(e)
        }


@router.post("/pain-assessment-gemini")
async def assess_pain_with_gemini(
    file: UploadFile = File(...),
    pet_id: Optional[int] = Form(None),
    additional_context: Optional[str] = Form(None),
    save_to_db: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Assess feline pain using Google's Gemini AI
    
    This endpoint:
    1. Receives an image from the mobile app
    2. Sends it to Gemini AI with a specialized prompt
    3. Receives AI analysis
    4. Parses and formats the response to match existing 3-level system
    5. Optionally saves to database
    6. Returns structured pain assessment
    
    Returns pain levels matching existing system:
    - Level 0 (No Pain)
    - Level 1 (Mild Pain) 
    - Level 2 (Moderate/Severe Pain)
    
    Args:
        file: Image file (JPG/PNG)
        pet_id: Optional pet ID for record keeping
        additional_context: Optional additional context about the cat
        save_to_db: Whether to save assessment to database
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Structured pain assessment with AI analysis matching existing system
    """
    
    # Check if Gemini is available
    if not GEMINI_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI service is not available. Please contact support."
        )
    
    try:
        # Validate file
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="File must be an image (JPG or PNG)"
            )
        
        # Read image
        image_bytes = await file.read()
        
        # Check file size (max 10MB for Gemini)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(image_bytes) > max_size:
            raise HTTPException(
                status_code=400,
                detail="Image file too large. Maximum size is 10MB."
            )
        
        # Prepare prompt with optional context
        prompt = FELINE_PAIN_ASSESSMENT_PROMPT
        if additional_context:
            prompt += f"\n\n**Additional Context:** {additional_context}"
        
        # Initialize Gemini model (use latest available model)
        model_name = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")
        model = genai.GenerativeModel(model_name)
        logging.info(f"Using Gemini model: {model_name}")
        
        # Prepare image for Gemini
        import PIL.Image
        import io
        pil_image = PIL.Image.open(io.BytesIO(image_bytes))
        
        # Generate response
        logging.info(f"Sending image to Gemini AI for user {current_user.id}")
        response = model.generate_content([prompt, pil_image])
        
        # Parse response
        result = parse_gemini_response(response.text)
        
        # Save to database if requested
        if save_to_db and pet_id:
            try:
                # Save image to disk
                timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S%f')
                filename = f"gemini_assessment_{current_user.id}_{timestamp}.jpg"
                file_path = os.path.join("uploads", filename)
                
                with open(file_path, "wb") as f:
                    f.write(image_bytes)
                
                image_url = f"/uploads/{filename}"
                
                # Create pain assessment record
                assessment = PainAssessment(
                    pet_id=pet_id,
                    user_id=current_user.id,
                    pain_score=result["pain_score"],
                    pain_level=result["pain_level"],
                    notes=result["overall_analysis"],
                    image_url=image_url,
                    assessment_answers=json.dumps({
                        "model": "Gemini AI",
                        "fgs_total": result.get("fgs_total", 0),
                        "confidence": result["confidence"],
                        "indicators": result.get("indicators", {}),
                        "recommendations": result.get("recommendations", []),
                        "urgency": result.get("urgency", "Low")
                    })
                )
                
                db.add(assessment)
                db.commit()
                db.refresh(assessment)
                
                result["assessment_id"] = assessment.id
                
                logging.info(f"Saved pain assessment {assessment.id} for pet {pet_id}")
                
            except Exception as e:
                logging.error(f"Failed to save assessment to database: {e}")
                result["db_save_error"] = str(e)
        
        # Add metadata
        result["model_type"] = "Gemini AI"
        result["timestamp"] = datetime.utcnow().isoformat()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in Gemini pain assessment: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process pain assessment: {str(e)}"
        )


@router.get("/gemini-health")
async def gemini_health_check():
    """Check if Gemini AI service is available"""
    return {
        "gemini_available": GEMINI_AVAILABLE,
        "api_key_configured": bool(GEMINI_API_KEY),
        "status": "ready" if GEMINI_AVAILABLE else "unavailable"
    }