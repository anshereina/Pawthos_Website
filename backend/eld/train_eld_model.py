import os
import cv2
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from eld_model import FelinePainAssessmentELD, MagnifyingEnsemble, FelineFaceDetector, RegionDetector, SpecialistModel
import logging
from typing import List, Tuple, Dict
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ELDModelTrainer:
    """Trainer for Ensemble Landmark Detector Model with 48 Landmarks"""
    
    def __init__(self, data_dir: str = "feline_pain_dataset"):
        self.data_dir = data_dir
        self.eld_model = FelinePainAssessmentELD()
        self.scaler = StandardScaler()
        self.classifier = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        # Pain level mapping
        self.pain_levels = {
            'no_pain': 0,
            'mild_pain': 1,
            'moderate_pain': 2,
            'severe_pain': 3
        }
        
        # Expected 48 landmarks
        self.expected_landmarks = 48
        
        # Region breakdown for 48 landmarks
        self.region_breakdown = {
            'left_eye': 8,      # 8 landmarks
            'right_eye': 8,     # 8 landmarks  
            'left_ear': 8,      # 8 landmarks
            'right_ear': 8,     # 8 landmarks
            'nose_whisker': 16  # 16 landmarks
        }
    
    def load_dataset(self) -> Tuple[List[np.ndarray], List[int]]:
        """Load and preprocess the feline pain dataset"""
        images = []
        labels = []
        
        # Expected directory structure:
        # data_dir/
        #   no_pain/
        #   mild_pain/
        #   moderate_pain/
        #   severe_pain/
        
        for pain_level, label in self.pain_levels.items():
            pain_dir = os.path.join(self.data_dir, pain_level)
            if not os.path.exists(pain_dir):
                logger.warning(f"Directory {pain_dir} not found, skipping...")
                continue
            
            logger.info(f"Loading {pain_level} images...")
            for filename in os.listdir(pain_dir):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    image_path = os.path.join(pain_dir, filename)
                    try:
                        image = cv2.imread(image_path)
                        if image is not None:
                            # Resize image to standard size
                            image = cv2.resize(image, (224, 224))
                            images.append(image)
                            labels.append(label)
                    except Exception as e:
                        logger.warning(f"Error loading {image_path}: {e}")
        
        logger.info(f"Loaded {len(images)} images with {len(set(labels))} classes")
        return images, labels
    
    def extract_features(self, images: List[np.ndarray]) -> np.ndarray:
        """Extract features from images using ELD model with 48 landmarks"""
        features_list = []
        
        for i, image in enumerate(images):
            if i % 10 == 0:
                logger.info(f"Processing image {i+1}/{len(images)}")
            
            try:
                # Detect 48 landmarks using magnifying ensemble
                landmarks = self.eld_model.magnifying_ensemble.detect_landmarks_multi_scale(image)
                
                # Extract pain features from 48 landmarks
                features = self.eld_model.extract_pain_features(image, landmarks)
                
                # Prepare feature vector
                feature_vector = self.eld_model._prepare_feature_vector(features)
                features_list.append(feature_vector)
                
                # Log landmark detection progress
                if i % 20 == 0:
                    logger.info(f"Image {i+1}: {len(landmarks)}/{self.expected_landmarks} landmarks detected")
                
            except Exception as e:
                logger.warning(f"Error extracting features from image {i}: {e}")
                # Use zero features as fallback
                feature_vector = [0.0] * 70  # 70 features in our feature vector
                features_list.append(feature_vector)
        
        return np.array(features_list)
    
    def train_model(self, features: np.ndarray, labels: List[int]) -> Dict:
        """Train the ELD model with 48 landmarks"""
        logger.info("Training ELD model with 48 landmarks...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            features, labels, test_size=0.2, random_state=42, stratify=labels
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train classifier
        self.classifier.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.classifier.predict(X_test_scaled)
        y_pred_proba = self.classifier.predict_proba(X_test_scaled)
        
        # Calculate metrics
        accuracy = self.classifier.score(X_test_scaled, y_test)
        report = classification_report(y_test, y_pred, target_names=list(self.pain_levels.keys()))
        conf_matrix = confusion_matrix(y_test, y_pred)
        
        # Feature importance
        feature_importance = self.classifier.feature_importances_
        
        results = {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': conf_matrix.tolist(),
            'feature_importance': feature_importance.tolist(),
            'test_predictions': y_pred.tolist(),
            'test_probabilities': y_pred_proba.tolist(),
            'test_labels': y_test,
            'expected_landmarks': self.expected_landmarks,
            'region_breakdown': self.region_breakdown
        }
        
        logger.info(f"Model accuracy: {accuracy:.4f}")
        logger.info(f"Classification report:\n{report}")
        
        return results
    
    def save_model(self, model_path: str = "eld_pain_model.pkl"):
        """Save the trained model"""
        model_data = {
            'classifier': self.classifier,
            'scaler': self.scaler,
            'pain_levels': self.pain_levels,
            'expected_landmarks': self.expected_landmarks,
            'region_breakdown': self.region_breakdown
        }
        joblib.dump(model_data, model_path)
        logger.info(f"Model saved to {model_path}")
    
    def plot_results(self, results: Dict, save_path: str = "eld_training_results.png"):
        """Plot training results for 48-landmark ELD model"""
        fig, axes = plt.subplots(2, 3, figsize=(18, 12))
        
        # Confusion Matrix
        conf_matrix = np.array(results['confusion_matrix'])
        sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=list(self.pain_levels.keys()),
                   yticklabels=list(self.pain_levels.keys()), ax=axes[0,0])
        axes[0,0].set_title('Confusion Matrix')
        axes[0,0].set_xlabel('Predicted')
        axes[0,0].set_ylabel('Actual')
        
        # Feature Importance
        feature_importance = np.array(results['feature_importance'])
        top_features = np.argsort(feature_importance)[-15:]  # Top 15 features
        axes[0,1].barh(range(len(top_features)), feature_importance[top_features])
        axes[0,1].set_title('Top 15 Feature Importance')
        axes[0,1].set_xlabel('Importance')
        
        # Accuracy by Class
        class_accuracy = conf_matrix.diagonal() / conf_matrix.sum(axis=1)
        axes[0,2].bar(self.pain_levels.keys(), class_accuracy)
        axes[0,2].set_title('Accuracy by Pain Level')
        axes[0,2].set_ylabel('Accuracy')
        axes[0,2].tick_params(axis='x', rotation=45)
        
        # Region Breakdown Visualization
        regions = list(self.region_breakdown.keys())
        landmark_counts = list(self.region_breakdown.values())
        axes[1,0].pie(landmark_counts, labels=regions, autopct='%1.1f%%')
        axes[1,0].set_title('48 Landmarks Distribution')
        
        # Overall Metrics
        metrics_text = f"Overall Accuracy: {results['accuracy']:.4f}\n"
        metrics_text += f"Total Samples: {len(results['test_labels'])}\n"
        metrics_text += f"Expected Landmarks: {self.expected_landmarks}\n"
        metrics_text += f"Feature Vector Size: {len(results['feature_importance'])}"
        axes[1,1].text(0.1, 0.5, metrics_text, fontsize=12, transform=axes[1,1].transAxes)
        axes[1,1].set_title('Model Performance')
        axes[1,1].axis('off')
        
        # Training Progress (placeholder for future implementation)
        axes[1,2].text(0.1, 0.5, "ELD Model Training\nCompleted Successfully", 
                      fontsize=14, transform=axes[1,2].transAxes, 
                      ha='center', va='center', weight='bold')
        axes[1,2].set_title('Training Status')
        axes[1,2].axis('off')
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        logger.info(f"Results plot saved to {save_path}")
    
    def create_sample_dataset(self, num_samples: int = 100):
        """Create a sample dataset for testing (if no real data available)"""
        logger.info("Creating sample dataset for 48-landmark ELD model...")
        
        # Create directories
        for pain_level in self.pain_levels.keys():
            os.makedirs(os.path.join(self.data_dir, pain_level), exist_ok=True)
        
        # Generate synthetic images (for demonstration)
        for pain_level, label in self.pain_levels.items():
            pain_dir = os.path.join(self.data_dir, pain_level)
            samples_per_class = num_samples // len(self.pain_levels)
            
            for i in range(samples_per_class):
                # Create synthetic cat face image with more realistic features
                image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
                
                # Add cat face features based on pain level
                if label == 0:  # No pain
                    # Bright, clear image with relaxed features
                    image = np.clip(image + 50, 0, 255)
                    # Add relaxed eye features
                    cv2.circle(image, (80, 80), 15, (255, 255, 255), -1)  # Left eye
                    cv2.circle(image, (144, 80), 15, (255, 255, 255), -1)  # Right eye
                    
                elif label == 1:  # Mild pain
                    # Slightly darker with subtle tension
                    image = np.clip(image - 20, 0, 255)
                    # Add slightly squinted eyes
                    cv2.ellipse(image, (80, 80), (12, 8), 0, 0, 360, (255, 255, 255), -1)
                    cv2.ellipse(image, (144, 80), (12, 8), 0, 0, 360, (255, 255, 255), -1)
                    
                elif label == 2:  # Moderate pain
                    # More variation with visible tension
                    image = np.clip(image + np.random.randint(-50, 50, image.shape), 0, 255)
                    # Add more squinted eyes
                    cv2.ellipse(image, (80, 80), (10, 6), 0, 0, 360, (255, 255, 255), -1)
                    cv2.ellipse(image, (144, 80), (10, 6), 0, 0, 360, (255, 255, 255), -1)
                    
                else:  # Severe pain
                    # Darker, more contrast with obvious pain indicators
                    image = np.clip(image - 50, 0, 255)
                    # Add very squinted eyes
                    cv2.ellipse(image, (80, 80), (8, 4), 0, 0, 360, (255, 255, 255), -1)
                    cv2.ellipse(image, (144, 80), (8, 4), 0, 0, 360, (255, 255, 255), -1)
                
                # Add nose and whisker area
                cv2.circle(image, (112, 120), 8, (200, 200, 200), -1)  # Nose
                
                # Save image
                filename = f"{pain_level}_{i:03d}.jpg"
                image_path = os.path.join(pain_dir, filename)
                cv2.imwrite(image_path, image)
        
        logger.info(f"Sample dataset created with {num_samples} images")
    
    def validate_eld_architecture(self):
        """Validate the ELD architecture with 48 landmarks"""
        logger.info("Validating ELD architecture...")
        
        # Test face detection
        face_detector = FelineFaceDetector()
        test_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        face_bbox = face_detector.detect_face(test_image)
        logger.info(f"Face detection test: {'PASS' if face_bbox is not None else 'FAIL'}")
        
        # Test region detection
        region_detector = RegionDetector()
        if face_bbox is not None:
            regions = region_detector.detect_regions(test_image, face_bbox)
            logger.info(f"Region detection test: {'PASS' if len(regions) == 5 else 'FAIL'}")
            logger.info(f"Detected regions: {list(regions.keys())}")
        
        # Test specialist models
        for region_name, landmark_count in self.region_breakdown.items():
            specialist = SpecialistModel(region_name)
            test_region = np.random.randint(0, 255, (64, 64, 3), dtype=np.uint8)
            landmarks = specialist.detect_landmarks(test_region)
            logger.info(f"{region_name} specialist: {len(landmarks)}/{landmark_count} landmarks")
        
        # Test magnifying ensemble
        ensemble = MagnifyingEnsemble()
        landmarks = ensemble.detect_landmarks_multi_scale(test_image)
        logger.info(f"Magnifying ensemble test: {len(landmarks)}/{self.expected_landmarks} landmarks")
        
        logger.info("ELD architecture validation completed")

def main():
    """Main training function for 48-landmark ELD model"""
    trainer = ELDModelTrainer()
    
    # Validate ELD architecture first
    trainer.validate_eld_architecture()
    
    # Check if dataset exists, if not create sample
    if not os.path.exists(trainer.data_dir):
        logger.info("No dataset found, creating sample dataset...")
        trainer.create_sample_dataset(num_samples=200)
    
    # Load dataset
    images, labels = trainer.load_dataset()
    
    if len(images) == 0:
        logger.error("No images loaded. Please check your dataset.")
        return
    
    # Extract features
    logger.info("Extracting features using 48-landmark ELD model...")
    features = trainer.extract_features(images)
    
    # Train model
    results = trainer.train_model(features, labels)
    
    # Save model
    trainer.save_model()
    
    # Plot results
    trainer.plot_results(results)
    
    # Save results
    with open("eld_training_results.json", "w") as f:
        # Convert numpy arrays to lists for JSON serialization
        json_results = {k: v.tolist() if hasattr(v, 'tolist') else v for k, v in results.items()}
        json.dump(json_results, f, indent=2)
    
    logger.info("48-landmark ELD model training completed successfully!")
    logger.info(f"Expected landmarks: {trainer.expected_landmarks}")
    logger.info(f"Region breakdown: {trainer.region_breakdown}")

if __name__ == "__main__":
    main()
