#!/usr/bin/env python3
"""
Train feline pain assessment classifier using ELD features.
Uses the cleaned CSV labels and existing ELD feature extraction pipeline.
"""

import os
import sys
import csv
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score
import cv2
from PIL import Image, ImageOps

# Add the parent directory to path to import ELD modules
sys.path.append(str(Path(__file__).parent))

from eld_model import FelinePainAssessmentELD

def load_and_preprocess_image(image_path):
    """Load and preprocess image using the same pipeline as the backend."""
    try:
        # Load image
        image = Image.open(image_path)
        
        # Apply EXIF orientation correction
        image = ImageOps.exif_transpose(image)
        
        # Convert to OpenCV format
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Apply CLAHE for light normalization
        lab = cv2.cvtColor(image_cv, cv2.COLOR_BGR2LAB)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])
        image_cv = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        
        return image_cv
    except Exception as e:
        print(f"Error loading image {image_path}: {e}")
        return None

def extract_features_for_training(image_path, pain_assessor):
    """Extract ELD features for a single image."""
    try:
        # Preprocess image
        image_cv = load_and_preprocess_image(image_path)
        if image_cv is None:
            return None
        
        # Extract features using the same method as runtime
        # First detect landmarks, then extract features
        landmarks = pain_assessor.magnifying_ensemble.detect_landmarks_multi_scale(image_cv)
        if len(landmarks) < 10:
            return None
        
        features = pain_assessor.extract_pain_features(image_cv, landmarks)
        
        if features is not None and len(features) > 0:
            # Prepare feature vector using the same method as runtime
            feature_vector = pain_assessor._prepare_feature_vector(features)
            return feature_vector
        else:
            print(f"No features extracted for {image_path}")
            return None
            
    except Exception as e:
        print(f"Error extracting features for {image_path}: {e}")
        return None

def load_dataset(csv_path, images_dir):
    """Load the dataset and extract features."""
    features_list = []
    labels_list = []
    failed_count = 0
    
    # Initialize the pain assessor
    pain_assessor = FelinePainAssessmentELD()
    
    print(f"Loading dataset from {csv_path}")
    print(f"Images directory: {images_dir}")
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row_num, row in enumerate(reader, 1):
            filename = row['filename']
            label = int(row['label'])
            
            # Construct image path
            image_path = Path(images_dir) / filename
            
            if not image_path.exists():
                print(f"Warning: Image not found: {image_path}")
                failed_count += 1
                continue
            
            # Extract features
            features = extract_features_for_training(str(image_path), pain_assessor)
            
            if features is not None:
                features_list.append(features)
                labels_list.append(label)
                
                if row_num % 100 == 0:
                    print(f"Processed {row_num} images...")
            else:
                failed_count += 1
    
    print(f"\nFeature extraction complete!")
    print(f"Successful extractions: {len(features_list)}")
    print(f"Failed extractions: {failed_count}")
    
    return np.array(features_list), np.array(labels_list)

def train_classifier(X, y):
    """Train the RandomForest classifier."""
    print(f"\nTraining RandomForest classifier...")
    print(f"Input shape: {X.shape}")
    print(f"Labels shape: {y.shape}")
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Initialize classifier with balanced class weights
    classifier = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    
    # Train the classifier
    classifier.fit(X_train, y_train)
    
    # Evaluate on test set
    y_pred = classifier.predict(X_test)
    
    print(f"\nTest Set Results:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.3f}")
    print(f"F1 Score (weighted): {f1_score(y_test, y_pred, average='weighted'):.3f}")
    
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Pain', 'Mild Pain', 'Moderate Pain']))
    
    return classifier, (X_test, y_test, y_pred)

def save_model(classifier, output_path):
    """Save the trained classifier."""
    try:
        joblib.dump(classifier, output_path)
        print(f"\nModel saved to: {output_path}")
        return True
    except Exception as e:
        print(f"Error saving model: {e}")
        return False

def main():
    # Paths
    script_dir = Path(__file__).parent
    dataset_dir = script_dir.parent / "feline_pain_dataset"
    csv_path = dataset_dir / "labels_clean.csv"
    images_dir = dataset_dir / "images"
    model_path = script_dir / "eld_pain_model.pkl"
    
    # Check if files exist
    if not csv_path.exists():
        print(f"Error: Clean CSV not found: {csv_path}")
        print("Please run normalize_labels.py first")
        return
    
    if not images_dir.exists():
        print(f"Error: Images directory not found: {images_dir}")
        return
    
    print("=== Feline Pain Classifier Training ===")
    print(f"CSV: {csv_path}")
    print(f"Images: {images_dir}")
    print(f"Output: {model_path}")
    
    # Load dataset and extract features
    X, y = load_dataset(csv_path, images_dir)
    
    if len(X) == 0:
        print("No features extracted. Cannot train classifier.")
        return
    
    # Train classifier
    classifier, test_results = train_classifier(X, y)
    
    # Save model
    success = save_model(classifier, model_path)
    
    if success:
        print(f"\n=== Training Complete ===")
        print(f"Model saved to: {model_path}")
        print("You can now restart your backend to use the new model.")
    else:
        print("Failed to save model.")

if __name__ == "__main__":
    main()
