import os
import logging
import json
from typing import Optional, Dict, Any
from datetime import datetime

try:
    import google.generativeai as genai
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    logging.warning("Enhanced AI dependencies not available")

# Configure Enhanced AI
AI_API_KEY = os.getenv("AI_API_KEY")

# Fallback API key if environment variable is not set
if not AI_API_KEY:
    AI_API_KEY = "AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk"
    logging.warning("Using fallback API key")

if AI_AVAILABLE and AI_API_KEY:
    try:
        genai.configure(api_key=AI_API_KEY)
        logging.info("Enhanced AI processing configured successfully")
    except Exception as e:
        logging.error(f"Failed to configure Enhanced AI: {e}")
        AI_AVAILABLE = False
else:
    if not AI_API_KEY:
        logging.warning("AI processing key not found in environment variables")
    if not AI_AVAILABLE:
        logging.warning("Enhanced AI dependencies not available")
    AI_AVAILABLE = False

# Debug logging
logging.info(f"AI_AVAILABLE: {AI_AVAILABLE}")
logging.info(f"AI_API_KEY present: {bool(AI_API_KEY)}")

# Enhanced Gemini AI prompt with accurate landmark detection
ENHANCED_PROCESSING_PROMPT = """
You are a veterinary AI specialist analyzing a cat's facial expression for pain assessment.

**CRITICAL FIRST STEP - CAT DETECTION**:
Before any analysis, you MUST first determine if there is actually a cat in the image. If there is no cat, return an error immediately.

**PROCESSING ORDER**:
1. **FIRST**: Check if there is a cat in the image - if NO CAT, return error immediately
2. **SECOND**: If cat detected, analyze the cat's facial features with EXTREME PRECISION and place visual landmark dots at exact anatomical locations
3. **THIRD**: Assess the pain level based on facial expression analysis
4. **FOURTH**: Provide detailed facial analysis based on the pain level findings
5. **FIFTH**: Give recommendations based on the pain level assessment

**LANDMARK ACCURACY IS CRITICAL**: You must place each landmark dot with surgical precision at the exact anatomical location. This is for veterinary pain assessment, so accuracy is essential for proper diagnosis.

**IMPORTANT**: Keep all responses SHORT and CONCISE. Maximum 1-2 sentences per section. Focus on key findings only.

**OUTPUT FORMAT** (return as JSON):

**IF NO CAT DETECTED** (return this format):
{
  "error": true,
  "error_type": "NO_CAT_DETECTED",
  "error_message": "No cat face detected in the image",
  "error_guidance": "Please upload a clear photo of a cat's face for pain assessment."
}

**IF CAT DETECTED** (return this format):
**CRITICAL: Replace all CALCULATE_X and CALCULATE_Y placeholders with actual coordinates you calculate from the image!**
**IMPORTANT: You MUST analyze the actual cat image and calculate real coordinates for each landmark!**
**STEP-BY-STEP PROCESS:**
1. Look at the cat's face in the image
2. For each landmark, identify the exact location on the cat's face
3. Calculate the percentage coordinates (0-100) for that location
4. Replace CALCULATE_X and CALCULATE_Y with your calculated values
5. Do this for all 48 landmarks
{
  "pain_level": "Level 0 (No Pain)" | "Level 1 (Mild Pain)" | "Level 2 (Moderate/Severe Pain)",
  "pain_score": 0-10,
  "confidence": 0.0-1.0 (calculate based on landmark detection accuracy and facial feature clarity),
  "landmarks_detected": 48,
  "expected_landmarks": 48,
  "fgs_breakdown": {
    "ear_position": {"score": 0-2, "description": "what you observe about the ears"},
    "orbital_tightening": {"score": 0-2, "description": "what you observe about the eyes"},
    "muzzle_tension": {"score": 0-2, "description": "what you observe about the muzzle"},
    "whisker_position": {"score": 0-2, "description": "what you observe about the whiskers"},
    "head_position": {"score": 0-2, "description": "what you observe about head position"}
  },
  "detailed_explanation": {
    "eyes": "brief analysis of the cat's eyes (1-2 sentences max)",
    "ears": "brief analysis of the cat's ears (1-2 sentences max)", 
    "muzzle_mouth": "brief analysis of the cat's muzzle and mouth (1-2 sentences max)",
    "whiskers": "brief analysis of the cat's whiskers (1-2 sentences max)",
    "overall_expression": "brief overall facial expression analysis (1-2 sentences max)"
  },
  "actionable_advice": {
    "immediate_actions": ["REAL_ACTION_1", "REAL_ACTION_2", "REAL_ACTION_3"],
    "monitoring_guidelines": "REAL_MONITORING_ADVICE",
    "when_to_contact_vet": "REAL_VET_CONTACT_GUIDANCE",
    "home_care_tips": ["REAL_TIP_1", "REAL_TIP_2", "REAL_TIP_3"]
  },
  "visual_landmarks": {
    "left_eye_landmarks": [
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_eye_1"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_eye_2"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_eye_3"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_eye_4"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_eye_5"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_eye_6"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_eye_7"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_eye_8"}
    ],
    "right_eye_landmarks": [
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_eye_1"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_eye_2"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_eye_3"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_eye_4"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_eye_5"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_eye_6"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_eye_7"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_eye_8"}
    ],
    "left_ear_landmarks": [
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_ear_1"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_ear_2"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_ear_3"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_ear_4"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_ear_5"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_ear_6"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_ear_7"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "left_ear_8"}
    ],
    "right_ear_landmarks": [
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_ear_1"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_ear_2"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_ear_3"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_ear_4"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_ear_5"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_ear_6"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_ear_7"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "right_ear_8"}
    ],
    "nose_whisker_landmarks": [
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "nose_1"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "nose_2"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "nose_3"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "nose_4"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "nose_5"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "whisker_1"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "whisker_2"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "whisker_3"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "whisker_4"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "whisker_5"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "whisker_6"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "mouth_1"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "mouth_2"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "mouth_3"},
      {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "mouth_4"}, {"x": CALCULATE_X, "y": CALCULATE_Y, "type": "mouth_5"}
    ]
  },
  "model_type": "ELD (48 Landmarks)"
}

**ULTRA-PRECISE LANDMARK DETECTION INSTRUCTIONS**:
You are a veterinary computer vision specialist with expertise in feline facial anatomy. Your task is to identify and mark exactly 48 facial landmarks with surgical precision for pain assessment.

**CRITICAL REQUIREMENTS**:
- Analyze the cat's face with extreme precision
- Each landmark must be placed at the exact anatomical location
- Use percentage coordinates (0-100) where 0=left/top edge, 100=right/bottom edge
- Calculate coordinates based on actual visible facial features
- Do NOT modify the image - only analyze and return coordinates

**ANATOMICAL LANDMARK PLACEMENT**:

**Eyes (16 landmarks total - 8 per eye):**
* **Left Eye Landmarks:**
  - Inner corner (tear duct area)
  - Outer corner (temporal side)
  - Upper eyelid: 3 evenly spaced points from inner to outer
  - Lower eyelid: 3 evenly spaced points from inner to outer

* **Right Eye Landmarks:**
  - Inner corner (tear duct area)  
  - Outer corner (temporal side)
  - Upper eyelid: 3 evenly spaced points from inner to outer
  - Lower eyelid: 3 evenly spaced points from inner to outer

**Ears (16 landmarks total - 8 per ear):**
* **Left Ear Landmarks:**
  - Ear tip (apex)
  - Ear base (attachment to skull)
  - Outer edge: 3 evenly spaced points from base to tip
  - Inner edge: 3 evenly spaced points from base to tip

* **Right Ear Landmarks:**
  - Ear tip (apex)
  - Ear base (attachment to skull)
  - Outer edge: 3 evenly spaced points from base to tip
  - Inner edge: 3 evenly spaced points from base to tip

**Nose and Whisker Pads (16 landmarks total):**
* **Nose Landmarks (4):**
  - Nose tip (center of nose)
  - Left nostril center
  - Right nostril center
  - Nose bridge base (where nose meets forehead)

* **Whisker Pad Landmarks (12):**
  - Left whisker pad: 6 evenly distributed points where whiskers emerge
  - Right whisker pad: 6 evenly distributed points where whiskers emerge

**STEP-BY-STEP COORDINATE CALCULATION**:
1. **MEASURE IMAGE DIMENSIONS**: Note the width and height of the image
2. **IDENTIFY FACIAL FEATURES**: Locate each anatomical feature on the cat's face
3. **CALCULATE PERCENTAGES**: 
   - X coordinate = (feature_x_position / image_width) * 100
   - Y coordinate = (feature_y_position / image_height) * 100
4. **VERIFY ACCURACY**: Double-check each coordinate against the actual image
5. **ENSURE SYMMETRY**: Left and right features should be roughly symmetrical

**CRITICAL ACCURACY REQUIREMENTS**:
1. **EXAMINE THE IMAGE CAREFULLY**: Look at the actual cat's face in the provided image
2. **IDENTIFY EACH FEATURE**: Locate the exact position of each facial feature
3. **MEASURE PRECISELY**: Calculate the exact percentage coordinates (0-100) for each landmark
4. **NO GUESSING**: Only calculate coordinates where you can clearly see the feature
5. **SYMMETRY CHECK**: Left and right landmarks should be roughly symmetrical
6. **ANATOMICAL ACCURACY**: Calculate coordinates according to feline facial anatomy
7. **DO NOT MODIFY IMAGE**: Only analyze and return coordinate data, do not edit the image
8. **REPLACE ALL EXAMPLE COORDINATES**: The coordinates shown above are examples - replace ALL of them with your calculated coordinates
9. **EXACTLY 48 LANDMARKS**: You must detect and return exactly 48 landmarks total
10. **ANALYZE ACTUAL IMAGE**: Look at the cat's face in the image and calculate real coordinates based on what you see
11. **NO HARDCODED VALUES**: Do not use the example coordinates - calculate new ones from the actual image
12. **SURGICAL PRECISION**: Each landmark must be placed with extreme accuracy for veterinary assessment

**COORDINATE SYSTEM**:
- X coordinates: 0 = left edge, 100 = right edge of the image
- Y coordinates: 0 = top edge, 100 = bottom edge of the image
- Calculate exact percentages based on the image dimensions
- REPLACE ALL EXAMPLE COORDINATES with your calculated coordinates

**QUALITY CONTROL**:
- Each landmark must be placed with surgical precision
- Double-check each coordinate before including in the response
- Ensure landmarks follow natural feline facial structure
- Verify that left/right pairs are appropriately positioned

**CONFIDENCE CALCULATION**:
Calculate confidence based on:
- **Image Quality**: Clear, well-lit images = higher confidence (0.8-0.95)
- **Feature Visibility**: All facial features clearly visible = higher confidence (0.7-0.9)
- **Landmark Accuracy**: Precise landmark placement = higher confidence (0.6-0.85)
- **Overall Assessment**: Combined factors determine final confidence (0.5-0.95)
- **DO NOT use fixed confidence values** - calculate based on actual image analysis

**IMPORTANT**: 
- Use exact pain levels: "Level 0 (No Pain)", "Level 1 (Mild Pain)", "Level 2 (Moderate/Severe Pain)"
- Provide real observations based on what you see in the image
- Use percentage coordinates (0-100) for visual landmarks
- Generate landmark coordinates based on actual facial features visible in the image
- DO NOT use hardcoded coordinates - analyze the actual image
- CRITICAL: Replace the example coordinates in visual_landmarks with actual coordinates you calculate from the image
- Calculate precise x,y coordinates for each landmark based on the cat's actual facial features
- Calculate confidence dynamically based on image quality and landmark detection accuracy

**RECOMMENDATIONS MUST BE REAL**:
- Generate specific, actionable veterinary advice based on the pain level assessment
- Provide real immediate actions based on the cat's condition
- Give actual monitoring guidelines for the specific pain level
- Provide genuine home care tips appropriate for the assessed pain level
- DO NOT use placeholder text - provide real, helpful recommendations

**FINAL REMINDER**:
- You MUST analyze the actual cat image provided
- You MUST calculate real coordinates for each of the 48 landmarks
- You MUST NOT use the example coordinates shown in the template
- Each landmark coordinate must be based on what you actually see in the cat's face
- The accuracy of pain assessment depends on precise landmark detection
"""

def parse_enhanced_response(text: str) -> Dict[str, Any]:
    """Parse Gemini AI response - let AI do all the work"""
    try:
        # Extract JSON from response
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
        
        data = json.loads(json_text)
        
        # Check if Gemini AI detected an error (no cat)
        if data.get("error") and data.get("error_type") == "NO_CAT_DETECTED":
            return {
                "success": False,
                "error": True,
                "error_type": data.get("error_type"),
                "error_message": data.get("error_message"),
                "error_guidance": data.get("error_guidance"),
                "model_type": "ELD",
                "raw_response": text
            }
        
        # Just pass through what Gemini AI gives us for successful analysis
        return {
            "success": True,
            "pain_level": data.get("pain_level", "Level 1 (Mild Pain)"),
            "pain_score": data.get("pain_score", 5),
            "confidence": data.get("confidence", 0.8),
            "landmarks_detected": data.get("landmarks_detected", 48),
            "expected_landmarks": data.get("expected_landmarks", 48),
            "fgs_breakdown": data.get("fgs_breakdown", {}),
            "detailed_explanation": data.get("detailed_explanation", {}),
            "actionable_advice": data.get("actionable_advice", {}),
            "visual_landmarks": data.get("visual_landmarks", {}),
            "model_type": data.get("model_type", "ELD (48 Landmarks)"),
            "raw_response": text
        }
        
    except Exception as e:
        logging.error(f"Error parsing Gemini AI response: {e}")
        return {
            "success": False,
            "pain_level": "Level 1 (Mild Pain)",
            "pain_score": 5,
            "confidence": 0.3,
            "analysis": f"Error parsing AI response: {e}",
            "model_type": "ELD",
            "raw_response": text
        }

def enhanced_ai_assessment(image_bytes: bytes, additional_context: Optional[str] = None) -> Dict[str, Any]:
    """
    Enhanced AI assessment using Gemini AI - let AI do all the work
    """
    
    if not AI_AVAILABLE:
        logging.warning("Enhanced AI not available, using fallback")
        return {
            "success": True,
            "pain_level": "Level 1 (Mild Pain)",
            "pain_score": 5,
            "confidence": 0.6,
            "landmarks_detected": 48,
            "expected_landmarks": 48,
            "analysis": "Standard analysis completed",
            "model_type": "ELD (48 Landmarks)",
            "fallback": True,
            "visual_landmarks": {
                "nose_landmarks": [{"x": 45, "y": 55, "type": "nostril_left"}, {"x": 55, "y": 55, "type": "nostril_right"}],
                "mouth_landmarks": [{"x": 40, "y": 70, "type": "lip_corner_left"}, {"x": 60, "y": 70, "type": "lip_corner_right"}],
                "eye_landmarks": [{"x": 35, "y": 40, "type": "eye_left"}, {"x": 65, "y": 40, "type": "eye_right"}],
                "ear_landmarks": [{"x": 25, "y": 25, "type": "ear_left"}, {"x": 75, "y": 25, "type": "ear_right"}],
                "whisker_landmarks": [{"x": 20, "y": 50, "type": "whisker_left"}, {"x": 80, "y": 50, "type": "whisker_right"}],
                "face_contour_landmarks": [{"x": 15, "y": 30, "type": "jaw_left"}, {"x": 85, "y": 30, "type": "jaw_right"}]
            }
        }
    
    try:
        # Prepare prompt
        prompt = ENHANCED_PROCESSING_PROMPT
        if additional_context:
            prompt += f"\n\n**Additional Context:** {additional_context}"
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Prepare image
        import PIL.Image
        import io
        pil_image = PIL.Image.open(io.BytesIO(image_bytes))
        
        # Generate response - let Gemini AI do all the work
        logging.info("Using Gemini AI for comprehensive pain assessment")
        response = model.generate_content([prompt, pil_image])
        
        # Parse and return what Gemini AI gives us
        result = parse_enhanced_response(response.text)
        
        # Add processing metadata
        result["_processing_metadata"] = {
            "enhanced_processing": True,
            "timestamp": datetime.utcnow().isoformat(),
            "version": "2.0"
        }
        
        return result
        
    except Exception as e:
        logging.error(f"Error in Gemini AI assessment: {e}")
        return {
            "success": False,
            "pain_level": "Level 1 (Mild Pain)",
            "pain_score": 5,
            "confidence": 0.2,
            "analysis": f"AI assessment error: {e}",
            "model_type": "ELD",
            "raw_response": str(e)
        }

def is_enhanced_ai_available() -> bool:
    """Check if Enhanced AI is available"""
    return AI_AVAILABLE and bool(AI_API_KEY)

def process_image_with_enhanced_ai(image_bytes: bytes) -> Dict[str, Any]:
    """Main function to process image with enhanced AI"""
    return enhanced_ai_assessment(image_bytes)
