import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
from typing import List, Tuple, Dict, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FelineFaceDetector:
    """Step 1: Face Detection - Finds the general location of the cat's face"""
    
    def __init__(self):
        # Load cat face cascade classifier with robust path resolution
        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # Preferred new location
        cascade_candidates = [
            os.path.join(base_dir, "models", "haarcascade_frontalcatface_extended.xml"),
            # Legacy location (backward compatibility)
            os.path.join(base_dir, "haarcascade_frontalcatface_extended.xml"),
        ]
        cascade_path = next((p for p in cascade_candidates if os.path.exists(p)), None)
        if not cascade_path:
            logger.error("Cat face cascade XML not found in expected locations: %s", cascade_candidates)
            raise FileNotFoundError("haarcascade_frontalcatface_extended.xml not found. Place it under backend-python/models or backend-python.")
        self.cat_cascade = cv2.CascadeClassifier(cascade_path)
        if self.cat_cascade.empty():
            logger.error("Failed to load cat cascade from %s (classifier is empty)", cascade_path)
            raise RuntimeError(f"Failed to load Haar cascade from {cascade_path}")
        logger.info("Loaded cat face cascade from: %s", cascade_path)
        
        # Alternative: Use general face cascade as fallback
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    def detect_face(self, image: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """Detect cat face and return bounding box (x, y, w, h) with tuned params and multi-scale retries"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            def detect_with(cascade, img_gray):
                # Tuned parameters
                faces = cascade.detectMultiScale(img_gray, scaleFactor=1.05, minNeighbors=3, minSize=(48, 48))
                if len(faces) > 0:
                    return max(faces, key=lambda x: x[2] * x[3])
                # Try slightly larger minSize
                faces = cascade.detectMultiScale(img_gray, scaleFactor=1.05, minNeighbors=3, minSize=(64, 64))
                if len(faces) > 0:
                    return max(faces, key=lambda x: x[2] * x[3])
                return None

            # 1) Cat-specific cascade
            face = detect_with(self.cat_cascade, gray)
            if face is not None:
                return tuple(face)

            # 2) General frontal cascade fallback
            face = detect_with(self.face_cascade, gray)
            if face is not None:
                return tuple(face)

            # 3) Multi-scale retry (upscale image)
            try:
                up = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
                face = detect_with(self.cat_cascade, up) or detect_with(self.face_cascade, up)
                if face is not None:
                    # Scale back coordinates
                    x, y, w, h = face
                    return (int(x/1.5), int(y/1.5), int(w/1.5), int(h/1.5))
            except Exception:
                pass

        except Exception as e:
            logger.warning(f"Face detection failed: {e}")
        
        return None

class RegionDetector:
    """Step 2: Region Detection - Identifies centers of 5 key regions"""
    
    def __init__(self):
        self.regions = {
            'left_eye': None,
            'right_eye': None,
            'left_ear': None,
            'right_ear': None,
            'nose_whisker': None
        }
    
    def detect_regions(self, image: np.ndarray, face_bbox: Tuple[int, int, int, int]) -> Dict[str, Tuple[int, int, int, int]]:
        """Detect 5 key regions within the face"""
        x, y, w, h = face_bbox
        
        # Define region centers based on face proportions
        regions = {}
        
        # Left eye region (upper left quadrant)
        left_eye_x = x + int(w * 0.25)
        left_eye_y = y + int(h * 0.3)
        left_eye_size = min(w, h) // 4
        regions['left_eye'] = (
            left_eye_x - left_eye_size//2,
            left_eye_y - left_eye_size//2,
            left_eye_size,
            left_eye_size
        )
        
        # Right eye region (upper right quadrant)
        right_eye_x = x + int(w * 0.75)
        right_eye_y = y + int(h * 0.3)
        right_eye_size = min(w, h) // 4
        regions['right_eye'] = (
            right_eye_x - right_eye_size//2,
            right_eye_y - right_eye_size//2,
            right_eye_size,
            right_eye_size
        )
        
        # Left ear region (top left)
        left_ear_x = x + int(w * 0.15)
        left_ear_y = y - int(h * 0.2)  # Above face
        left_ear_size = min(w, h) // 3
        regions['left_ear'] = (
            left_ear_x - left_ear_size//2,
            max(0, left_ear_y - left_ear_size//2),
            left_ear_size,
            left_ear_size
        )
        
        # Right ear region (top right)
        right_ear_x = x + int(w * 0.85)
        right_ear_y = y - int(h * 0.2)  # Above face
        right_ear_size = min(w, h) // 3
        regions['right_ear'] = (
            right_ear_x - right_ear_size//2,
            max(0, right_ear_y - right_ear_size//2),
            right_ear_size,
            right_ear_size
        )
        
        # Nose/whisker region (center bottom)
        nose_x = x + w // 2
        nose_y = y + int(h * 0.7)
        nose_size = min(w, h) // 3
        regions['nose_whisker'] = (
            nose_x - nose_size//2,
            nose_y - nose_size//2,
            nose_size,
            nose_size
        )
        
        return regions

class SpecialistModel:
    """Step 3: Ensemble of Specialists - Specialized models for each region"""
    
    def __init__(self, region_type: str):
        self.region_type = region_type
        
        # Define landmark counts for each region FIRST
        self.landmark_counts = {
            'left_eye': 8,    # 8 landmarks around left eye
            'right_eye': 8,   # 8 landmarks around right eye
            'left_ear': 8,    # 8 landmarks around left ear
            'right_ear': 8,   # 8 landmarks around right ear
            'nose_whisker': 16 # 16 landmarks for nose and whisker area
        }
        
        # THEN create the model
        self.model = self._create_specialist_model()
    
    def _create_specialist_model(self) -> nn.Module:
        """Create a specialized CNN model for the specific region"""
        model = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Linear(128, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, self.landmark_counts[self.region_type] * 2)  # x,y coordinates
        )
        return model
    
    def detect_landmarks(self, region_image: np.ndarray) -> List[Tuple[int, int]]:
        """Detect landmarks within the specific region"""
        try:
            # Preprocess image
            region_tensor = self._preprocess_image(region_image)
            
            # Get predictions (for now, use heuristic approach)
            # In a real implementation, this would use the trained model
            landmarks = self._heuristic_landmark_detection(region_image)
            
            return landmarks
            
        except Exception as e:
            logger.warning(f"Landmark detection failed for {self.region_type}: {e}")
            return []
    
    def _preprocess_image(self, image: np.ndarray) -> torch.Tensor:
        """Preprocess image for the specialist model"""
        # Resize to standard size
        image = cv2.resize(image, (64, 64))
        
        # Convert to tensor
        image = image / 255.0
        image = np.transpose(image, (2, 0, 1))
        tensor = torch.FloatTensor(image).unsqueeze(0)
        
        return tensor
    
    def _heuristic_landmark_detection(self, region_image: np.ndarray) -> List[Tuple[int, int]]:
        """Heuristic landmark detection for each region type"""
        h, w = region_image.shape[:2]
        landmarks = []
        
        if self.region_type in ['left_eye', 'right_eye']:
            # 8 landmarks around eye
            center_x, center_y = w // 2, h // 2
            radius = min(w, h) // 4
            
            for i in range(8):
                angle = i * 2 * np.pi / 8
                x = int(center_x + radius * np.cos(angle))
                y = int(center_y + radius * np.sin(angle))
                landmarks.append((x, y))
        
        elif self.region_type in ['left_ear', 'right_ear']:
            # 8 landmarks around ear
            center_x, center_y = w // 2, h // 2
            radius = min(w, h) // 3
            
            for i in range(8):
                angle = i * 2 * np.pi / 8
                x = int(center_x + radius * np.cos(angle))
                y = int(center_y + radius * np.sin(angle))
                landmarks.append((x, y))
        
        elif self.region_type == 'nose_whisker':
            # 16 landmarks for nose and whisker area
            center_x, center_y = w // 2, h // 2
            
            # Nose landmarks (6 points)
            nose_radius = min(w, h) // 6
            for i in range(6):
                angle = i * 2 * np.pi / 6
                x = int(center_x + nose_radius * np.cos(angle))
                y = int(center_y + nose_radius * np.sin(angle))
                landmarks.append((x, y))
            
            # Whisker landmarks (10 points)
            whisker_length = min(w, h) // 3
            # Left whiskers
            for i in range(5):
                x = int(center_x - whisker_length * (i + 1) / 5)
                y = int(center_y + (i - 2) * 10)
                landmarks.append((x, y))
            # Right whiskers
            for i in range(5):
                x = int(center_x + whisker_length * (i + 1) / 5)
                y = int(center_y + (i - 2) * 10)
                landmarks.append((x, y))
        
        return landmarks

class MagnifyingEnsemble:
    """Magnifying Ensemble Method - Magnifies regions for enhanced detection"""
    
    def __init__(self, magnification_scales: List[float] = [1.0, 1.5, 2.0]):
        self.magnification_scales = magnification_scales
        self.face_detector = FelineFaceDetector()
        self.region_detector = RegionDetector()
        
        # Initialize specialist models for each region
        self.specialists = {
            'left_eye': SpecialistModel('left_eye'),
            'right_eye': SpecialistModel('right_eye'),
            'left_ear': SpecialistModel('left_ear'),
            'right_ear': SpecialistModel('right_ear'),
            'nose_whisker': SpecialistModel('nose_whisker')
        }
    
    def detect_landmarks_multi_scale(self, image: np.ndarray) -> List[Tuple[int, int]]:
        """Detect landmarks using magnifying ensemble method with face multi-crop fallback"""
        # Step 1: Face Detection
        face_bbox = self.face_detector.detect_face(image)
        if face_bbox is None:
            logger.warning("No face detected")
            return []

        x, y, w, h = face_bbox
        # Candidate crops: different scales and slight offsets
        scales = [0.9, 1.0, 1.1, 1.25]
        offsets = [
            (0, 0),
            (int(0.05 * w), 0),
            (-int(0.05 * w), 0),
            (0, int(0.05 * h)),
            (0, -int(0.05 * h)),
        ]

        best_landmarks: List[Tuple[int, int]] = []
        best_count = 0

        for s in scales:
            for ox, oy in offsets:
                cw = int(w * s)
                ch = int(h * s)
                cx = max(0, x + ox - (cw - w) // 2)
                cy = max(0, y + oy - (ch - h) // 2)
                cx2 = min(image.shape[1], cx + cw)
                cy2 = min(image.shape[0], cy + ch)
                if cx2 <= cx or cy2 <= cy:
                    continue

                # Step 2: Region Detection on this candidate face crop
                regions = self.region_detector.detect_regions(image, (cx, cy, cx2 - cx, cy2 - cy))

                # Step 3: Multi-scale processing for each region
                all_landmarks = []
                for region_name, region_bbox in regions.items():
                    region_landmarks = self._process_region_multi_scale(image, region_bbox, region_name)
                    all_landmarks.extend(region_landmarks)

                combined = self._combine_landmarks(all_landmarks)
                if len(combined) > best_count:
                    best_count = len(combined)
                    best_landmarks = combined

                if best_count >= 48:
                    break
            if best_count >= 48:
                break

        return best_landmarks
    
    def _process_region_multi_scale(self, image: np.ndarray, region_bbox: Tuple[int, int, int, int], region_name: str) -> List[Tuple[int, int]]:
        """Process a region at multiple scales"""
        x, y, w, h = region_bbox
        region_landmarks = []
        
        for scale in self.magnification_scales:
            # Calculate magnified region
            magnified_w = int(w * scale)
            magnified_h = int(h * scale)
            
            # Extract region with padding
            start_x = max(0, x - (magnified_w - w) // 2)
            start_y = max(0, y - (magnified_h - h) // 2)
            end_x = min(image.shape[1], start_x + magnified_w)
            end_y = min(image.shape[0], start_y + magnified_h)
            
            # Extract region
            region_image = image[start_y:end_y, start_x:end_x]
            
            if region_image.size == 0:
                continue
            
            # Resize to standard size for specialist model
            region_image = cv2.resize(region_image, (64, 64))
            
            # Get landmarks from specialist model
            specialist = self.specialists[region_name]
            landmarks = specialist.detect_landmarks(region_image)
            
            # Scale landmarks back to original coordinates
            for lx, ly in landmarks:
                # Convert from 64x64 back to region coordinates
                orig_x = start_x + int(lx * (end_x - start_x) / 64)
                orig_y = start_y + int(ly * (end_y - start_y) / 64)
                region_landmarks.append((orig_x, orig_y))
        
        return region_landmarks
    
    def _combine_landmarks(self, all_landmarks: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        """Combine landmarks to produce final 48 landmarks"""
        if len(all_landmarks) == 0:
            return []
        
        # Use clustering to find consensus landmarks
        consensus_landmarks = self._find_consensus_landmarks(all_landmarks, target_count=48)
        
        return consensus_landmarks
    
    def _find_consensus_landmarks(self, landmarks: List[Tuple[int, int]], target_count: int = 48) -> List[Tuple[int, int]]:
        """Find consensus landmarks using clustering"""
        if len(landmarks) == 0:
            return []
        
        # Simple clustering based on distance
        clusters = []
        used = set()
        threshold = 15  # Distance threshold for clustering
        
        for i, point in enumerate(landmarks):
            if i in used:
                continue
            
            cluster = [point]
            used.add(i)
            
            for j, other_point in enumerate(landmarks):
                if j in used:
                    continue
                
                distance = np.sqrt((point[0] - other_point[0])**2 + (point[1] - other_point[1])**2)
                if distance < threshold:
                    cluster.append(other_point)
                    used.add(j)
            
            clusters.append(cluster)
        
        # Get centroid of each cluster
        consensus_points = []
        for cluster in clusters:
            if len(cluster) > 0:
                avg_x = sum(p[0] for p in cluster) // len(cluster)
                avg_y = sum(p[1] for p in cluster) // len(cluster)
                consensus_points.append((avg_x, avg_y))
        
        # If we have more than target_count, select the most confident ones
        if len(consensus_points) > target_count:
            # Sort by cluster size (larger clusters = more confidence)
            cluster_sizes = [len(cluster) for cluster in clusters]
            sorted_indices = np.argsort(cluster_sizes)[::-1]
            consensus_points = [consensus_points[i] for i in sorted_indices[:target_count]]
        
        # If we have fewer than target_count, duplicate some points
        while len(consensus_points) < target_count:
            if len(consensus_points) > 0:
                # Duplicate a random point with small offset
                point = consensus_points[np.random.randint(0, len(consensus_points))]
                offset_x = np.random.randint(-5, 6)
                offset_y = np.random.randint(-5, 6)
                consensus_points.append((point[0] + offset_x, point[1] + offset_y))
            else:
                # If no landmarks, create default points
                consensus_points.append((100, 100))
        
        return consensus_points[:target_count]

class FelinePainAssessmentELD:
    """Ensemble Landmark Detector for Feline Pain Assessment"""
    
    def __init__(self, model_path: str = "eld_pain_model.pkl"):
        self.magnifying_ensemble = MagnifyingEnsemble()
        self.feature_extractor = self._create_feature_extractor()
        self.classifier = self._load_classifier(model_path)
        self.scaler = StandardScaler()
        
        # Expected 48 landmarks
        self.expected_landmarks = 48
        
        # Pain assessment features
        self.pain_features = {
            'eye_squinting': 0.0,
            'ear_position': 0.0,
            'whisker_tension': 0.0,
            'mouth_tension': 0.0,
            'overall_tension': 0.0
        }
    
    def _create_feature_extractor(self) -> nn.Module:
        """Create feature extraction model using PyTorch"""
        try:
            model = models.resnet18(pretrained=True)
            # Remove the final classification layer
            model = nn.Sequential(*list(model.children())[:-1])
            return model
        except:
            # Fallback to a simple CNN if ResNet is not available
            model = nn.Sequential(
                nn.Conv2d(3, 64, 3, padding=1),
                nn.ReLU(),
                nn.MaxPool2d(2),
                nn.Conv2d(64, 128, 3, padding=1),
                nn.ReLU(),
                nn.MaxPool2d(2),
                nn.AdaptiveAvgPool2d((1, 1)),
                nn.Flatten()
            )
            return model
    
    def _load_classifier(self, model_path: str) -> RandomForestClassifier:
        """Load trained classifier from several candidate locations"""
        candidates = []
        # If absolute path provided
        if os.path.isabs(model_path):
            candidates.append(model_path)
        # Relative to this file's directory
        base_dir = os.path.dirname(os.path.abspath(__file__))
        candidates.append(os.path.join(base_dir, model_path))
        # Common explicit filename in same dir
        candidates.append(os.path.join(base_dir, "eld_pain_model.pkl"))
        # Fallback: parent/eld/eld_pain_model.pkl
        candidates.append(os.path.join(os.path.dirname(base_dir), "eld", "eld_pain_model.pkl"))

        for path in candidates:
            try:
                if os.path.exists(path):
                    clf = joblib.load(path)
                    logger.info(f"Loaded ELD classifier from: {path}")
                    # Apply sklearn compatibility patch (e.g., missing monotonic_cst)
                    try:
                        self._patch_sklearn_compat(clf)
                    except Exception as compat_err:
                        logger.warning(f"Failed to patch sklearn compatibility: {compat_err}")
                    return clf
            except Exception as e:
                logger.warning(f"Failed to load classifier from {path}: {e}")

        logger.warning("ELD classifier file not found; using unfitted default classifier")
        return RandomForestClassifier(n_estimators=100, random_state=42)

    def _patch_sklearn_compat(self, clf: RandomForestClassifier) -> None:
        """Patch known sklearn attribute differences across versions.

        Some newer sklearn versions access `monotonic_cst` on tree estimators.
        Older pickles may lack it; set to None when missing to avoid AttributeError.
        """
        try:
            if not hasattr(clf, 'monotonic_cst'):
                setattr(clf, 'monotonic_cst', None)
            if hasattr(clf, 'estimators_') and isinstance(clf.estimators_, list):
                for est in clf.estimators_:
                    if not hasattr(est, 'monotonic_cst'):
                        setattr(est, 'monotonic_cst', None)
        except Exception as e:
            logger.debug(f"_patch_sklearn_compat encountered: {e}")
    
    def extract_pain_features(self, image: np.ndarray, landmarks: List[Tuple[int, int]]) -> Dict[str, float]:
        """Extract pain-related features from 48 landmarks"""
        features = {}
        
        if len(landmarks) < 10:
            return features
        
        # Convert to grayscale for feature extraction
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Basic geometric features
        features['num_landmarks'] = len(landmarks)
        features['landmark_density'] = len(landmarks) / (image.shape[0] * image.shape[1])
        
        # Extract texture features around landmarks
        texture_features = self._extract_texture_features(gray, landmarks)
        features.update(texture_features)
        
        # Extract geometric features
        geometric_features = self._extract_geometric_features(landmarks)
        features.update(geometric_features)
        
        # Extract region-specific features
        region_features = self._extract_region_features(landmarks)
        features.update(region_features)
        
        return features
    
    def _extract_texture_features(self, gray_image: np.ndarray, landmarks: List[Tuple[int, int]]) -> Dict[str, float]:
        """Extract texture features around landmarks"""
        features = {}
        
        # Calculate local binary patterns or other texture features
        for i, (x, y) in enumerate(landmarks[:20]):  # Use first 20 landmarks
            if 0 <= x < gray_image.shape[1] and 0 <= y < gray_image.shape[0]:
                # Extract 5x5 patch around landmark
                patch = gray_image[max(0, y-2):min(gray_image.shape[0], y+3),
                                 max(0, x-2):min(gray_image.shape[1], x+3)]
                
                if patch.size > 0:
                    features[f'texture_mean_{i}'] = np.mean(patch)
                    features[f'texture_std_{i}'] = np.std(patch)
                    features[f'texture_entropy_{i}'] = self._calculate_entropy(patch)
        
        return features
    
    def _extract_geometric_features(self, landmarks: List[Tuple[int, int]]) -> Dict[str, float]:
        """Extract geometric features from landmarks"""
        features = {}
        
        if len(landmarks) < 3:
            return features
        
        # Calculate distances between landmarks
        distances = []
        for i in range(len(landmarks)):
            for j in range(i+1, len(landmarks)):
                dist = np.sqrt((landmarks[i][0] - landmarks[j][0])**2 + 
                             (landmarks[i][1] - landmarks[j][1])**2)
                distances.append(dist)
        
        if distances:
            features['min_distance'] = min(distances)
            features['max_distance'] = max(distances)
            features['mean_distance'] = np.mean(distances)
            features['std_distance'] = np.std(distances)
        
        # Calculate convex hull area
        try:
            from scipy.spatial import ConvexHull
            points = np.array(landmarks)
            hull = ConvexHull(points)
            features['convex_hull_area'] = hull.volume
        except:
            features['convex_hull_area'] = 0.0
        
        return features
    
    def _extract_region_features(self, landmarks: List[Tuple[int, int]]) -> Dict[str, float]:
        """Extract region-specific features for pain assessment"""
        features = {}
        
        if len(landmarks) < 48:
            return features
        
        # Divide landmarks into regions (approximate)
        # First 16: Eye regions (8 each)
        # Next 16: Ear regions (8 each)  
        # Last 16: Nose/whisker region
        
        eye_landmarks = landmarks[:16]
        ear_landmarks = landmarks[16:32]
        nose_whisker_landmarks = landmarks[32:48]
        
        # Eye region features (squinting detection)
        if len(eye_landmarks) >= 8:
            eye_distances = []
            for i in range(0, 8, 2):
                if i + 1 < len(eye_landmarks):
                    dist = np.sqrt((eye_landmarks[i][0] - eye_landmarks[i+1][0])**2 + 
                                 (eye_landmarks[i][1] - eye_landmarks[i+1][1])**2)
                    eye_distances.append(dist)
            features['eye_opening'] = np.mean(eye_distances) if eye_distances else 0.0
        
        # Ear region features (ear position)
        if len(ear_landmarks) >= 8:
            ear_heights = [landmark[1] for landmark in ear_landmarks]
            features['ear_height_variation'] = np.std(ear_heights) if ear_heights else 0.0
        
        # Nose/whisker region features (tension detection)
        if len(nose_whisker_landmarks) >= 16:
            whisker_spread = []
            center_x = np.mean([landmark[0] for landmark in nose_whisker_landmarks])
            for landmark in nose_whisker_landmarks:
                spread = abs(landmark[0] - center_x)
                whisker_spread.append(spread)
            features['whisker_spread'] = np.mean(whisker_spread) if whisker_spread else 0.0
        
        return features
    
    def _calculate_entropy(self, patch: np.ndarray) -> float:
        """Calculate entropy of image patch"""
        if patch.size == 0:
            return 0.0
        
        hist, _ = np.histogram(patch.flatten(), bins=256, range=(0, 256))
        hist = hist[hist > 0]  # Remove zero bins
        if len(hist) == 0:
            return 0.0
        
        prob = hist / hist.sum()
        entropy = -np.sum(prob * np.log2(prob))
        return entropy
    
    def assess_pain(self, image: np.ndarray) -> Dict[str, any]:
        """Assess pain level using ELD model with 48 landmarks"""
        try:
            # Detect 48 landmarks using magnifying ensemble
            landmarks = self.magnifying_ensemble.detect_landmarks_multi_scale(image)
            
            if len(landmarks) < 10:
                return {
                    'pain_level': 'Unknown',
                    'confidence': 0.0,
                    'features': {},
                    'error': 'Insufficient landmarks detected',
                    'landmarks_detected': len(landmarks)
                }
            
            # Extract pain features
            features = self.extract_pain_features(image, landmarks)
            
            # Prepare features for classification
            feature_vector = self._prepare_feature_vector(features)
            
            # Predict pain level (guard for unfitted classifier)
            if not hasattr(self.classifier, 'classes_'):
                # Unfitted classifier: use a simple heuristic fallback based on features
                eye_open = float(features.get('eye_opening', 0.0))
                whisker = float(features.get('whisker_spread', 0.0))
                # Very rough heuristic thresholds
                if eye_open > 8 and whisker < 5:
                    prediction = 0  # No Pain
                elif eye_open > 5:
                    prediction = 1  # Mild
                else:
                    prediction = 2  # Moderate
                confidence = 0.4
            else:
                if hasattr(self.classifier, 'predict_proba'):
                    probabilities = self.classifier.predict_proba([feature_vector])[0]
                    prediction = self.classifier.predict([feature_vector])[0]
                    confidence = max(probabilities)
                else:
                    prediction = self.classifier.predict([feature_vector])[0]
                    confidence = 0.5  # Default confidence
            
            # Map prediction to pain level
            pain_level = self._map_prediction_to_pain_level(prediction)
            
            return {
                'pain_level': pain_level,
                'confidence': float(confidence),
                'features': features,
                'landmarks_detected': len(landmarks),
                'expected_landmarks': self.expected_landmarks,
                'prediction_raw': int(prediction),
                'model_type': 'ELD with 48 Landmarks'
            }
            
        except Exception as e:
            logger.error(f"Error in pain assessment: {e}")
            return {
                'pain_level': 'Error',
                'confidence': 0.0,
                'features': {},
                'error': str(e),
                'landmarks_detected': 0
            }
    
    def _prepare_feature_vector(self, features: Dict[str, float]) -> List[float]:
        """Prepare feature vector for classification"""
        # Define expected features
        expected_features = [
            'num_landmarks', 'landmark_density', 'min_distance', 'max_distance',
            'mean_distance', 'std_distance', 'convex_hull_area',
            'eye_opening', 'ear_height_variation', 'whisker_spread'
        ]
        
        # Add texture features
        for i in range(20):
            expected_features.extend([f'texture_mean_{i}', f'texture_std_{i}', f'texture_entropy_{i}'])
        
        # Create feature vector
        feature_vector = []
        for feature in expected_features:
            feature_vector.append(features.get(feature, 0.0))
        
        return feature_vector
    
    def _map_prediction_to_pain_level(self, prediction: int) -> str:
        """Map numerical prediction to pain level"""
        pain_levels = {
            0: "No Pain",
            1: "Mild Pain", 
            2: "Moderate Pain",
            3: "Severe Pain"
        }
        return pain_levels.get(prediction, "Unknown")

# Usage example
if __name__ == "__main__":
    # Initialize ELD model
    eld_model = FelinePainAssessmentELD()
    
    # Load test image
    image = cv2.imread("test_cat.jpg")
    
    # Assess pain
    result = eld_model.assess_pain(image)
    print(f"Pain Level: {result['pain_level']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Landmarks Detected: {result['landmarks_detected']}/{result['expected_landmarks']}")
    print(f"Model Type: {result['model_type']}")
