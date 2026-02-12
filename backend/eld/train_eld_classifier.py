"""
Train ELD Pain Classifier with Augmented Dataset
Uses JSON annotations for landmarks and applies SMOTE for balancing
"""
import os
import json
import cv2
import numpy as np
import pandas as pd
from pathlib import Path
from tqdm import tqdm
import argparse
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Tuple, Dict

# Import ELD model components
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eld_model import FelinePainAssessmentELD

def load_landmarks_from_json(json_path: Path) -> List[Tuple[int, int]]:
    """Load landmarks from JSON annotation file"""
    try:
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        if 'labels' in data and len(data['labels']) >= 10:
            # Convert to list of tuples
            landmarks = [(int(point[0]), int(point[1])) for point in data['labels']]
            return landmarks
        return []
    except Exception as e:
        print(f"Error loading {json_path}: {e}")
        return []

def extract_features_from_dataset(
    images_dir: Path,
    annotations_dir: Path,
    labels_df: pd.DataFrame,
    eld_model: FelinePainAssessmentELD
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Extract 70-dimensional features from all images using landmarks from JSON
    
    Returns:
        X: Feature matrix (n_samples, 70)
        y: Labels (n_samples,)
    """
    X = []
    y = []
    failed_count = 0
    
    print("\n🔍 Extracting features from dataset...")
    for idx, row in tqdm(labels_df.iterrows(), total=len(labels_df), desc="Processing"):
        filename = row['filename']
        pain_level = int(row['pain_level'])
        
        # Load image
        image_path = images_dir / filename
        if not image_path.exists():
            failed_count += 1
            continue
        
        image = cv2.imread(str(image_path))
        if image is None:
            failed_count += 1
            continue
        
        # Load landmarks from JSON annotation
        annotation_path = annotations_dir / f"{Path(filename).stem}.json"
        landmarks = load_landmarks_from_json(annotation_path)
        
        if len(landmarks) < 10:
            failed_count += 1
            continue
        
        # Extract features using ELD model
        features_dict = eld_model.extract_pain_features(image, landmarks)
        
        # Convert to feature vector
        feature_vector = eld_model._prepare_feature_vector(features_dict)
        
        if len(feature_vector) == 70:  # Ensure we have all 70 features
            X.append(feature_vector)
            y.append(pain_level)
        else:
            failed_count += 1
    
    if failed_count > 0:
        print(f"⚠️  Failed to extract features from {failed_count} images")
    
    X = np.array(X)
    y = np.array(y)
    
    print(f"✅ Extracted features from {len(X)} samples")
    print(f"   Feature shape: {X.shape}")
    print(f"   Class distribution:")
    unique, counts = np.unique(y, return_counts=True)
    for label, count in zip(unique, counts):
        print(f"      Class {label}: {count} samples")
    
    return X, y

def train_classifier(
    X_train: np.ndarray,
    y_train: np.ndarray,
    use_smote: bool = True,
    n_estimators: int = 300,
    random_state: int = 42
) -> RandomForestClassifier:
    """
    Train Random Forest classifier with optional SMOTE
    
    Args:
        X_train: Training features
        y_train: Training labels
        use_smote: Whether to apply SMOTE oversampling
        n_estimators: Number of trees in Random Forest
        random_state: Random seed
    
    Returns:
        Trained classifier
    """
    print("\n🌳 Training Random Forest Classifier...")
    
    # Apply SMOTE if requested
    if use_smote:
        print("   Applying SMOTE for class balancing...")
        # Calculate target counts (slightly more than current to ensure balance)
        unique, counts = np.unique(y_train, return_counts=True)
        max_count = max(counts)
        
        # Target: balance to max class size
        sampling_strategy = {int(label): max_count for label in unique}
        
        smote = SMOTE(
            sampling_strategy=sampling_strategy,
            k_neighbors=3,
            random_state=random_state
        )
        
        X_resampled, y_resampled = smote.fit_resample(X_train, y_train)
        
        print(f"   Before SMOTE: {len(X_train)} samples")
        print(f"   After SMOTE: {len(X_resampled)} samples")
        unique, counts = np.unique(y_resampled, return_counts=True)
        for label, count in zip(unique, counts):
            print(f"      Class {label}: {count} samples")
        
        X_train = X_resampled
        y_train = y_resampled
    
    # Train Random Forest
    clf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight='balanced',  # Additional balancing
        random_state=random_state,
        n_jobs=-1  # Use all CPU cores
    )
    
    print("   Training classifier...")
    clf.fit(X_train, y_train)
    
    print("✅ Training complete!")
    
    return clf

def evaluate_model(
    clf: RandomForestClassifier,
    X_test: np.ndarray,
    y_test: np.ndarray,
    output_dir: Path
):
    """Evaluate model and generate classification report"""
    print("\n📊 Evaluating model...")
    
    # Predictions
    y_pred = clf.predict(X_test)
    y_pred_proba = clf.predict_proba(X_test)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n{'='*70}")
    print(f"Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"{'='*70}\n")
    
    # Classification report
    class_names = ['No Pain', 'Moderate Pain', 'Severe Pain']
    report = classification_report(
        y_test, y_pred,
        target_names=class_names,
        output_dict=True
    )
    
    print("Detailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=class_names))
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    
    # Save results
    results = {
        'accuracy': float(accuracy),
        'classification_report': report,
        'confusion_matrix': cm.tolist(),
        'test_samples': len(y_test),
        'class_distribution': {
            int(label): int(count) for label, count in zip(*np.unique(y_test, return_counts=True))
        }
    }
    
    # Save JSON results
    results_path = output_dir / 'eld_training_results.json'
    import json
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n✅ Saved results to {results_path}")
    
    # Create visualization
    plt.figure(figsize=(12, 5))
    
    # Confusion matrix plot
    plt.subplot(1, 2, 1)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    
    # Class distribution plot
    plt.subplot(1, 2, 2)
    unique, counts = np.unique(y_test, return_counts=True)
    plt.bar([class_names[int(i)] for i in unique], counts, color=['green', 'orange', 'red'])
    plt.title('Test Set Class Distribution')
    plt.ylabel('Count')
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    plot_path = output_dir / 'eld_training_results.png'
    plt.savefig(plot_path, dpi=150, bbox_inches='tight')
    print(f"✅ Saved visualization to {plot_path}")
    
    return results

def main():
    parser = argparse.ArgumentParser(description='Train ELD Pain Classifier')
    parser.add_argument('--dataset', type=str, required=True,
                       help='Path to augmented dataset directory')
    parser.add_argument('--output', type=str, default='eld',
                       help='Output directory for model and results')
    parser.add_argument('--test-size', type=float, default=0.2,
                       help='Test set size (0.0-1.0)')
    parser.add_argument('--use-smote', action='store_true', default=True,
                       help='Use SMOTE for class balancing')
    parser.add_argument('--n-estimators', type=int, default=300,
                       help='Number of trees in Random Forest')
    parser.add_argument('--random-state', type=int, default=42,
                       help='Random seed')
    
    args = parser.parse_args()
    
    # Setup paths
    dataset_path = Path(args.dataset)
    images_dir = dataset_path / 'images'
    annotations_dir = dataset_path / 'annotations'
    labels_csv = dataset_path / 'labels_clean.csv'
    
    # Verify paths
    if not images_dir.exists():
        print(f"❌ Images directory not found: {images_dir}")
        return
    if not annotations_dir.exists():
        print(f"❌ Annotations directory not found: {annotations_dir}")
        return
    if not labels_csv.exists():
        print(f"❌ Labels CSV not found: {labels_csv}")
        return
    
    # Load labels
    print(f"📂 Loading dataset from: {dataset_path}")
    labels_df = pd.read_csv(labels_csv)
    print(f"   Total samples: {len(labels_df)}")
    print(f"   Class distribution:")
    print(labels_df['pain_level'].value_counts().sort_index())
    
    # Initialize ELD model (for feature extraction)
    print("\n🤖 Initializing ELD model for feature extraction...")
    eld_model = FelinePainAssessmentELD()
    
    # Extract features
    X, y = extract_features_from_dataset(images_dir, annotations_dir, labels_df, eld_model)
    
    if len(X) == 0:
        print("❌ No features extracted. Exiting.")
        return
    
    # Split dataset
    print(f"\n📊 Splitting dataset (test_size={args.test_size})...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=args.test_size,
        stratify=y,
        random_state=args.random_state
    )
    
    print(f"   Training set: {len(X_train)} samples")
    print(f"   Test set: {len(X_test)} samples")
    
    # Scale features
    print("\n📏 Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train classifier
    clf = train_classifier(
        X_train_scaled, y_train,
        use_smote=args.use_smote,
        n_estimators=args.n_estimators,
        random_state=args.random_state
    )
    
    # Evaluate
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    results = evaluate_model(clf, X_test_scaled, y_test, output_dir)
    
    # Save model and scaler
    model_path = output_dir / 'eld_pain_model.pkl'
    scaler_path = output_dir / 'eld_scaler.pkl'
    
    joblib.dump(clf, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"\n✅ Model saved to: {model_path}")
    print(f"✅ Scaler saved to: {scaler_path}")
    
    print(f"\n{'='*70}")
    print("🎉 Training Complete!")
    print(f"{'='*70}")
    print(f"\nModel Performance Summary:")
    print(f"  Test Accuracy: {results['accuracy']:.4f} ({results['accuracy']*100:.2f}%)")
    print(f"  Test Samples: {results['test_samples']}")
    print(f"\nClass Distribution (Test Set):")
    for label, count in results['class_distribution'].items():
        class_name = ['No Pain', 'Moderate Pain', 'Severe Pain'][label]
        print(f"  {class_name}: {count} samples")

if __name__ == "__main__":
    main()


