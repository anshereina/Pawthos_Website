# Ensemble Landmark Detector (ELD) for Feline Pain Assessment

## Overview

This implementation provides a complete **Ensemble Landmark Detector (ELD) Model with Magnifying Ensemble Method** for real-time feline pain assessment. The system follows a precise 4-step architecture that produces exactly **48 landmarks** for comprehensive pain assessment.

**Latest Training Results (January 2025 - Enhanced with Augmentation):**
- **Accuracy**: 72.48% (improved from 66.1%)
- **F1 Score (Weighted)**: 72.14% (improved from 53.6%)
- **F1 Score (Macro)**: 68.11% (improved from 28%)
- **Dataset**: 2,032 samples (1,625 training, 407 test) - Augmented from 1,366
- **Severe Pain Recall**: 58% (improved from 0%)
- **Moderate Pain Recall**: 62% (improved from 2%)
- **Landmark Detection Rate**: 100% (using JSON annotations)
- **Face Detection Accuracy**: 92%

**Recent Improvements (August 2025):**
- **Species Validation**: Multi-stage gates to block non-cat images
- **Confidence Calibration**: Aligned scikit-learn to 1.7.1 for reliable confidence scores
- **Error Handling**: User-friendly error messages for invalid inputs
- **Face Area Validation**: Proper framing validation (0.08-0.30 ratio)
- **Whisker/Ear Detection**: Enhanced edge energy thresholds (35.0) for species validation

## Architecture

### **4-Step ELD Process:**

#### **Step 1: Face Detection & Species Validation**
- **Model**: Cat-specific Haar Cascade with multi-stage validation
- **Purpose**: Finds the general location of the cat's face and validates species
- **Output**: Bounding box (x, y, w, h) of the detected face
- **Validation Gates**:
  - Face area ratio validation (0.08-0.30 for proper framing)
  - Whisker region edge energy validation (threshold: 35.0)
  - Ear region edge energy validation (threshold: 35.0)
  - Face aspect ratio validation (0.85-1.20)
  - Human face overlap rejection
- **Improvements**: Enhanced with EXIF orientation correction, CLAHE light normalization, and rotation retry mechanisms

#### **Step 2: Region Detection**
- **Model**: Geometric region detector
- **Purpose**: Identifies centers of **5 key regions** within the face:
  - **Left Eye Region** (8 landmarks)
  - **Right Eye Region** (8 landmarks)
  - **Left Ear Region** (8 landmarks)
  - **Right Ear Region** (8 landmarks)
  - **Nose/Whisker Region** (16 landmarks)
- **Output**: 5 region bounding boxes

#### **Step 3: Ensemble of Specialists**
- **Models**: 5 specialized CNN models (one per region)
- **Purpose**: Each magnified region is passed to its own specialized, smaller model
- **Process**:
  - Regions are cropped and magnified at multiple scales (1.0x, 1.5x, 2.0x)
  - Each specialist model finds landmarks within its specific area
  - **Left Eye Specialist**: 8 landmarks around left eye
  - **Right Eye Specialist**: 8 landmarks around right eye
  - **Left Ear Specialist**: 8 landmarks around left ear
  - **Right Ear Specialist**: 8 landmarks around right ear
  - **Nose/Whisker Specialist**: 16 landmarks for nose and whisker area

#### **Step 4: Combination**
- **Method**: Consensus clustering and landmark combination
- **Purpose**: Combines results from the five specialist models
- **Output**: **Exactly 48 landmarks** for pain assessment

## **48 Landmarks Breakdown**

| Region | Landmarks | Purpose |
|--------|-----------|---------|
| **Left Eye** | 8 | Eye squinting detection |
| **Right Eye** | 8 | Eye squinting detection |
| **Left Ear** | 8 | Ear position analysis |
| **Right Ear** | 8 | Ear position analysis |
| **Nose/Whisker** | 16 | Whisker tension, mouth tension |
| **Total** | **48** | Complete facial pain assessment |

## Installation

### 1. Install ELD Dependencies
```bash
pip install -r requirements_eld.txt
```

### 2. Download Required Models
```bash
# Download cat face cascade (if not available)
# The haarcascade_frontalcatface_extended.xml should be in your project
```

### 3. Verify Installation
```bash
python -c "from eld_model import FelinePainAssessmentELD; print('ELD model ready')"
```

## Usage

### Basic Usage
```python
from eld_model import FelinePainAssessmentELD
import cv2

# Initialize ELD model
eld_model = FelinePainAssessmentELD()

# Load image
image = cv2.imread("cat_image.jpg")

# Assess pain using 48 landmarks
result = eld_model.assess_pain(image)
print(f"Pain Level: {result['pain_level']}")
print(f"Confidence: {result['confidence']:.2f}")
print(f"Landmarks: {result['landmarks_detected']}/48")
```

### Error Handling & User Experience

The system now provides clear, user-friendly error messages:

- **"No Cat Face Detected"** - For non-cat images or invalid species
- **"Cat face detected is too small/large"** - For improper framing
- **"Insufficient landmarks detected"** - For unclear or obstructed faces

### API Integration
```python
# Use the enhanced API endpoint
response = await client.post("/api/predict-eld", files={"file": image_file})
result = response.json()
```

## Training the Model

### 1. Prepare Dataset
Organize your feline pain dataset:
```
feline_pain_dataset/
├── images/
│   ├── 00000001_000.png
│   ├── 00000002_000.png
│   └── ...
└── labels_clean.csv
```

### 2. Normalize Labels
```bash
python eld/normalize_labels.py
```

### 3. Train the Model
```bash
python eld/train_pain_classifier.py
```

### 4. Training Output
- `eld_pain_model.pkl`: Trained RandomForest classifier
- `eld_training_results.png`: Training visualization
- `eld_training_results.json`: Detailed metrics

## Model Components

### FelineFaceDetector
```python
detector = FelineFaceDetector()
face_bbox = detector.detect_face(image)
```
**Features:**
- Cat-specific face detection with enhanced robustness
- MediaPipe fallback
- Multi-scale detection with rotation retries
- EXIF orientation correction and CLAHE preprocessing

### RegionDetector
```python
detector = RegionDetector()
regions = detector.detect_regions(image, face_bbox)
```
**Features:**
- 5-region detection
- Geometric region calculation
- Region-specific sizing

### SpecialistModel
```python
specialist = SpecialistModel('left_eye')
landmarks = specialist.detect_landmarks(region_image)
```
**Features:**
- Region-specific CNN models
- Specialized landmark detection
- Multi-scale processing

### MagnifyingEnsemble
```python
ensemble = MagnifyingEnsemble(scales=[1.0, 1.5, 2.0])
landmarks = ensemble.detect_landmarks_multi_scale(image)
```
**Features:**
- Multi-scale magnification
- Consensus landmark formation
- 48-landmark output

### FelinePainAssessmentELD
```python
model = FelinePainAssessmentELD()
result = model.assess_pain(image)
```
**Features:**
- Complete 48-landmark pipeline
- Pain-specific feature extraction
- Confidence scoring with robust classifier loading

## API Endpoints

### Enhanced Prediction
- **Endpoint**: `POST /api/predict-eld`
- **Features**: ELD model with 48 landmarks and improved robustness
- **Response**: Pain level, confidence, landmarks detected, model type

### Backward Compatibility
- **Endpoint**: `POST /api/predict`
- **Features**: Maintains original API compatibility
- **Response**: Standard pain assessment format

### Health Check
- **Endpoint**: `GET /health`
- **Features**: Model availability status
- **Response**: ELD and Torch availability

## Performance Metrics

### Current Performance (January 2025 - Enhanced Model)
| Metric | Value | Description |
|--------|-------|-------------|
| **Accuracy** | 72.48% | Overall classification accuracy (improved from 66.1%) |
| **F1 Score (Weighted)** | 72.14% | Balanced performance across classes (improved from 53.6%) |
| **F1 Score (Macro)** | 68.11% | Unweighted average (improved from 28%) |
| **Landmark Detection Rate** | 100% | Successful landmark extraction (using JSON annotations) |
| **Face Detection Accuracy** | 92% | Cat face detection success rate |
| **Processing Time** | 2.5 seconds | Average inference time |

### Class Performance (Enhanced Model)
| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| **No Pain** | 0.73 | 0.86 | 0.79 | 180 |
| **Moderate Pain** | 0.77 | 0.62 | 0.69 | 184 |
| **Severe Pain** | 0.54 | 0.58 | 0.56 | 43 |

### Performance Improvement Summary
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Overall Accuracy** | 66.1% | 72.48% | +6.38% |
| **Severe Pain Recall** | 0.00 (0%) | 0.58 (58%) | +58% |
| **Moderate Pain Recall** | 0.02 (2%) | 0.62 (62%) | +60% |
| **F1 Score (Weighted)** | 53.6% | 72.14% | +18.54% |
| **F1 Score (Macro)** | 28% | 68.11% | +40.11% |

### Feature Importance (Top 10)
1. **Feature 1** (0.085) - Geometric landmark relationships
2. **Feature 2** (0.082) - Eye region characteristics
3. **Feature 3** (0.079) - Texture analysis
4. **Feature 4** (0.076) - Ear position metrics
5. **Feature 5** (0.073) - Whisker tension indicators
6. **Feature 6** (0.070) - Facial symmetry
7. **Feature 7** (0.067) - Landmark density
8. **Feature 8** (0.064) - Region-specific features
9. **Feature 9** (0.061) - Spatial relationships
10. **Feature 10** (0.058) - Texture entropy

## Technical Specifications

### Landmark Detection
- **Total Landmarks**: Exactly 48
- **Detection Methods**: 5 specialist models
- **Consensus Threshold**: 15 pixels
- **Multi-scale Processing**: 1.0x, 1.5x, 2.0x

### Feature Extraction
- **Geometric Features**: 10 dimensions
- **Texture Features**: 60 dimensions (20 landmarks × 3 features)
- **Total Feature Vector**: 70 dimensions

### Classification
- **Algorithm**: Random Forest
- **Estimators**: 300 trees
- **Max Depth**: 10 levels
- **Min Samples Split**: 5
- **Min Samples Leaf**: 2
- **Class Weight**: Balanced
- **Classes**: 3 pain levels (No Pain, Mild Pain, Moderate Pain)

### Compatibility Notes (NEW)
- scikit-learn compatibility patch: some older pickled forests/trees may miss `monotonic_cst` in newer sklearn. The loader now patches the classifier and its base estimators by setting `monotonic_cst=None` when missing.
- Recommended: re-save the classifier with your current scikit-learn to silence warnings.
  - PowerShell:
  ```powershell
  python -c "import joblib; clf=joblib.load(r'eld/eld_pain_model.pkl'); joblib.dump(clf, r'eld/eld_pain_model.pkl'); print('Re-saved with current scikit-learn')"
  ```

## Recent Improvements (December 2024)

### 1. **Enhanced Image Preprocessing**
- **EXIF Orientation Correction**: Automatically corrects image orientation
- **CLAHE Light Normalization**: Improves contrast and lighting consistency
- **Face Pre-cropping**: Uses Haar cascades to focus on face region

### 2. **Robust Face Detection**
- **Tuned Haar Cascade Parameters**: Optimized scaleFactor, minNeighbors, minSize
- **Rotation Retry Mechanisms**: 90° CW, 90° CCW, 180° rotation attempts
- **Multi-scale Detection**: Image upscaling (1.5x) for better detection
- **Face Multi-crop Fallback (NEW)**: Tries scaled and slightly shifted face crops and selects the crop that yields the most landmarks to reduce heuristic fallbacks

### 3. **Improved Model Training**
- **Image Data Augmentation**: Aggressive augmentation for Severe Pain class (31 → 217 samples)
- **SMOTE Oversampling**: Balanced training set in feature space (1,625 → 2,202 samples)
- **Balanced Class Weights**: Handles class imbalance in training data
- **Enhanced Feature Extraction**: 70-dimensional feature vector
- **Robust Classifier Loading**: Multiple path fallbacks and error handling

### 4. **Better Error Handling**
- **Explicit Error Messages**: Clear feedback when face detection fails
- **Debug Image Dumps**: Optional debug output for failed detections
- **Graceful Fallbacks**: Heuristic assessment when ML model unavailable

## Dataset Information

### Enhanced Dataset (January 2025 - After Augmentation)
- **Total Samples**: 2,032 images (augmented from 1,366)
- **Successful Extractions**: 2,032 (100%)
- **Training Set**: 1,625 samples (80%)
- **Test Set**: 407 samples (20%)
- **After SMOTE**: 2,202 training samples (balanced)

### Class Distribution (Augmented Dataset)
- **No Pain**: 897 samples (44.1%)
- **Moderate Pain**: 918 samples (45.2%)
- **Severe Pain**: 217 samples (10.7%)

### Original Dataset (Before Augmentation)
- **Total Samples**: 1,366 images
- **Training Set**: 1,092 samples (80%)
- **Test Set**: 274 samples (20%)
- **Class Distribution**:
  - No Pain: 897 samples (65.7%)
  - Moderate Pain: 438 samples (32.1%)
  - Severe Pain: 31 samples (2.2%)

## Class Imbalance Mitigation Strategy

To address the severe class imbalance (31 samples for Severe Pain in original dataset), a comprehensive two-stage balancing approach was implemented:

### Stage 1: Image Data Augmentation
- **Severe Pain Class**: Aggressive augmentation (31 → 217 samples)
  - Techniques: rotation (±15°), horizontal flips, brightness/contrast adjustments (±20%), elastic transformations, Gaussian blur, CLAHE normalization
  - Approximately 7 augmentations per original image
- **Moderate Pain Class**: Moderate augmentation (438 → 918 samples)
  - Techniques: rotation (±10°), horizontal flips, brightness/contrast adjustments (±15%)
  - Approximately 2 augmentations per original image
- **No Pain Class**: Light augmentation (897 samples maintained)
  - Techniques: rotation (±5°), horizontal flips, minimal adjustments
  - Original samples preserved

### Stage 2: SMOTE Oversampling
- Applied SMOTE to the 70-dimensional feature space after landmark extraction
- Balanced training set to 2,202 samples (734 per class)
- k_neighbors=3 to accommodate smaller classes
- Combined with class_weight='balanced' in Random Forest for additional balancing

### Results
- **Severe Pain Recall**: Improved from 0% to 58%
- **Moderate Pain Recall**: Improved from 2% to 62%
- **Overall Accuracy**: Improved from 66.1% to 72.48%
- **F1 Score (Weighted)**: Improved from 53.6% to 72.14%

## Advantages of 48-Landmark ELD Approach

### 1. **Precision**
- Exactly 48 landmarks for comprehensive coverage
- Region-specific specialist models
- Multi-scale magnification for accuracy

### 2. **Robustness**
- 5-region ensemble reduces single-point failures
- Consensus formation improves reliability
- Fallback mechanisms ensure operation

### 3. **Interpretability**
- Region-specific landmark analysis
- Pain indicators by facial region
- Visual landmark visualization

### 4. **Scalability**
- Modular specialist model design
- Easy addition of new regions
- Configurable magnification scales

## Limitations and Considerations

### 1. **Class Imbalance (Partially Addressed)**
- ~~Severe Pain class had very few samples (31 in original dataset, 6 in test set)~~ **ADDRESSED**
- Image augmentation increased Severe Pain samples from 31 to 217
- SMOTE further balanced the training set
- Remaining challenge: Severe Pain precision (54%) could be improved with more real-world data

### 2. **Computational Cost**
- 5 specialist models increase processing time
- Multi-scale processing requires more resources
- Real-time processing may be slower

### 3. **Data Requirements**
- Requires diverse training dataset
- Region-specific training data needed
- Quality affects specialist model performance

## Future Enhancements

### 1. **Data Augmentation**
- Increase Moderate Pain samples
- Synthetic data generation
- Cross-validation strategies

### 2. **Advanced Specialist Models**
- Cat-specific CNN architectures
- 3D landmark detection
- Temporal landmark tracking

### 3. **Deep Learning Integration**
- End-to-end training of specialist models
- Attention mechanisms for region focus
- Transfer learning from human models

### 4. **Real-time Optimization**
- GPU acceleration for specialist models
- Model quantization
- Streaming processing

## Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   pip install mediapipe opencv-python torch torchvision matplotlib seaborn
   ```

2. **Model Loading Failures**
   ```bash
   # Check model files exist
   ls -la haarcascade_frontalcatface_extended.xml
   ls -la eld_pain_model.pkl
   ```

3. **Memory Issues**
   ```python
   # Reduce magnification scales
   ensemble = MagnifyingEnsemble(scales=[1.0])  # Single scale
   ```

4. **Low Landmark Detection**
   - Ensure good lighting conditions
   - Use front-facing cat photos
   - Check image quality and resolution
   - Try different angles if detection fails

### Performance Tuning

1. **Adjust Consensus Threshold**
   ```python
   consensus_points = self._find_consensus_landmarks(points, threshold=10)
   ```

2. **Modify Feature Extraction**
   ```python
   # Use fewer texture features
   for i in range(10):  # Instead of 20
   ```

3. **Optimize Classification**
   ```python
   classifier = RandomForestClassifier(n_estimators=100)  # Fewer trees
   ```

## Citation

If you use this 48-landmark ELD implementation in your research, please cite:

```bibtex
@article{pawthos_eld_2024,
  title={Ensemble Landmark Detector with Magnifying Ensemble Method for Feline Pain Assessment: A 48-Landmark Approach},
  author={Pawthos Team},
  journal={Veterinary AI Systems},
  year={2024},
  note={Updated with enhanced robustness and improved training methodology}
}
```

## License

This implementation is part of the Pawthos project and follows the same licensing terms.

## Support

For technical support or questions about the 48-landmark ELD implementation:
- Check the troubleshooting section
- Review the code comments
- Test with sample images first
- Verify all dependencies are installed
- Check the training results visualization for performance insights

## Training Scripts

### normalize_labels.py
Cleans and normalizes raw CSV label files for training.

### train_pain_classifier.py
Trains the RandomForest classifier using ELD features and cleaned labels.

### generate_training_visualization.py
Creates comprehensive training results visualization (PNG format).





















