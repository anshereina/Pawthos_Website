"""
Create labels CSV file from images and annotations
Optionally uses ELD model to predict pain levels as starting point
"""
import os
import json
import pandas as pd
import cv2
from pathlib import Path
import argparse
from tqdm import tqdm
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_annotation(annotation_path):
    """Load and validate annotation file"""
    try:
        with open(annotation_path, 'r') as f:
            data = json.load(f)
        
        if 'labels' in data and len(data['labels']) >= 10:
            return True, data
        return False, None
    except:
        return False, None

def predict_with_eld(image_path, eld_model=None):
    """Predict pain level using ELD model"""
    if eld_model is None:
        try:
            from eld.eld_model import FelinePainAssessmentELD
            eld_model = FelinePainAssessmentELD()
        except Exception as e:
            print(f"⚠️  Could not load ELD model: {e}")
            return None
    
    try:
        image = cv2.imread(str(image_path))
        if image is None:
            return None
        
        result = eld_model.assess_pain(image)
        
        if result.get('success'):
            pain_level_str = result.get('pain_level', 'Level 1 (Mild Pain)')
            # Map to 0, 1, 2
            if 'Level 0' in pain_level_str or 'No Pain' in pain_level_str:
                return 0
            elif 'Level 1' in pain_level_str or 'Mild' in pain_level_str:
                return 1
            elif 'Level 2' in pain_level_str or 'Severe' in pain_level_str:
                return 2
            else:
                return 1  # Default
        return None
    except Exception as e:
        return None

def create_labels_csv(
    images_dir,
    annotations_dir,
    output_csv='labels_clean.csv',
    use_eld_predictions=False,
    eld_model=None
):
    """
    Create labels CSV from images and annotations
    
    Args:
        images_dir: Directory with images
        annotations_dir: Directory with JSON annotations
        output_csv: Output CSV file path
        use_eld_predictions: If True, use ELD model to predict pain levels
        eld_model: Optional pre-loaded ELD model
    """
    images_path = Path(images_dir)
    annotations_path = Path(annotations_dir)
    
    # Get all image files
    image_files = []
    for ext in ['*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG']:
        image_files.extend(list(images_path.glob(ext)))
    
    print(f"📊 Found {len(image_files)} images")
    
    # Get all annotation files
    annotation_files = {ann.stem: ann for ann in annotations_path.glob('*.json')}
    print(f"📊 Found {len(annotation_files)} annotations")
    
    # Match images to annotations
    valid_pairs = []
    missing_annotations = []
    
    print("\n🔍 Matching images to annotations...")
    for img_file in tqdm(image_files, desc="Processing"):
        stem = img_file.stem
        
        if stem in annotation_files:
            is_valid, _ = load_annotation(annotation_files[stem])
            if is_valid:
                valid_pairs.append((img_file, annotation_files[stem], stem))
            else:
                missing_annotations.append(img_file.name)
        else:
            missing_annotations.append(img_file.name)
    
    print(f"✅ Found {len(valid_pairs)} valid image-annotation pairs")
    if missing_annotations:
        print(f"⚠️  {len(missing_annotations)} images without valid annotations")
    
    # Create CSV entries
    entries = []
    
    if use_eld_predictions:
        print("\n🤖 Predicting pain levels using ELD model...")
        if eld_model is None:
            try:
                from eld.eld_model import FelinePainAssessmentELD
                eld_model = FelinePainAssessmentELD()
                print("✅ ELD model loaded")
            except Exception as e:
                print(f"❌ Could not load ELD model: {e}")
                print("   Creating CSV without predictions (you'll need to label manually)")
                use_eld_predictions = False
    
    print("\n📝 Creating CSV entries...")
    for img_file, ann_file, stem in tqdm(valid_pairs, desc="Creating entries"):
        filename = img_file.name
        
        if use_eld_predictions and eld_model:
            pain_level = predict_with_eld(img_file, eld_model)
            if pain_level is None:
                pain_level = 1  # Default to moderate if prediction fails
        else:
            pain_level = None  # Will need manual labeling
        
        entries.append({
            'filename': filename,
            'pain_level': pain_level if pain_level is not None else '',
            'has_annotation': True,
            'annotation_file': ann_file.name
        })
    
    # Create DataFrame
    df = pd.DataFrame(entries)
    
    # Save CSV
    df.to_csv(output_csv, index=False)
    
    print(f"\n✅ Created {output_csv}")
    print(f"   Total entries: {len(df)}")
    
    if use_eld_predictions:
        print(f"\n📊 Predicted distribution:")
        print(df['pain_level'].value_counts().sort_index())
        print("\n⚠️  Please review and correct predictions as needed!")
    else:
        print(f"\n⚠️  CSV created with empty pain_level column")
        print(f"   Please fill in pain_level values (0, 1, or 2)")
        print(f"   - 0 = No Pain")
        print(f"   - 1 = Moderate Pain")
        print(f"   - 2 = Severe Pain")
    
    return output_csv

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Create labels CSV from images and annotations')
    parser.add_argument('--images', type=str, required=True,
                       help='Images directory')
    parser.add_argument('--annotations', type=str, required=True,
                       help='Annotations directory')
    parser.add_argument('--output', type=str, default='labels_clean.csv',
                       help='Output CSV file')
    parser.add_argument('--use-eld', action='store_true',
                       help='Use ELD model to predict pain levels')
    
    args = parser.parse_args()
    
    create_labels_csv(
        images_dir=args.images,
        annotations_dir=args.annotations,
        output_csv=args.output,
        use_eld_predictions=args.use_eld
    )


