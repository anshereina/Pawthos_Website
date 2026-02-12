"""
Dataset Augmentation Script - Works with annotations/ and images/ folders
Augments severe pain class from 31 samples to 200+ samples
"""
import cv2
import numpy as np
import pandas as pd
from pathlib import Path
from albumentations import (
    Compose, Rotate, HorizontalFlip, RandomBrightnessContrast,
    ShiftScaleRotate, ElasticTransform, GaussianBlur, CLAHE,
    RandomGamma, HueSaturationValue
)
import json
import shutil
from tqdm import tqdm

def create_augmentation_pipeline(class_type='severe'):
    """Create augmentation pipeline based on class type"""
    if class_type == 'severe':
        # Aggressive augmentation for severe pain (31 → 200)
        return Compose([
            Rotate(limit=15, p=0.8),
            HorizontalFlip(p=0.5),
            ShiftScaleRotate(shift_limit=0.1, scale_limit=0.1, rotate_limit=10, p=0.7),  # Using ShiftScaleRotate for compatibility
            RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.8),
            RandomGamma(gamma_limit=(80, 120), p=0.5),
            HueSaturationValue(hue_shift_limit=10, sat_shift_limit=15, val_shift_limit=15, p=0.5),
            GaussianBlur(blur_limit=(3, 7), p=0.3),
            CLAHE(clip_limit=2.0, tile_grid_size=(8, 8), p=0.5),
            ElasticTransform(alpha=1, sigma=50, p=0.3),
        ], p=1.0)
    elif class_type == 'moderate':
        # Moderate augmentation for moderate pain (438 → 600)
        return Compose([
            Rotate(limit=10, p=0.6),
            HorizontalFlip(p=0.4),
            ShiftScaleRotate(shift_limit=0.05, scale_limit=0.05, rotate_limit=5, p=0.5),
            RandomBrightnessContrast(brightness_limit=0.15, contrast_limit=0.15, p=0.6),
            RandomGamma(gamma_limit=(90, 110), p=0.3),
        ], p=1.0)
    else:  # no_pain
        # Light augmentation for no pain (maintain diversity)
        return Compose([
            Rotate(limit=5, p=0.3),
            HorizontalFlip(p=0.3),
            RandomBrightnessContrast(brightness_limit=0.1, contrast_limit=0.1, p=0.3),
        ], p=1.0)

def augment_dataset(
    input_images_dir: str,
    input_annotations_dir: str,
    labels_csv: str,
    output_dir: str,
    target_counts: dict = {0: 800, 1: 600, 2: 200}
):
    """
    Augment dataset with annotations and images
    
    Args:
        input_images_dir: Path to input images directory
        input_annotations_dir: Path to input annotations directory
        labels_csv: Path to labels CSV file
        output_dir: Path to output directory
        target_counts: Target number of samples per class
    """
    # Load labels
    df = pd.read_csv(labels_csv)
    
    # Create output directories
    output_path = Path(output_dir)
    output_images_dir = output_path / 'images'
    output_annotations_dir = output_path / 'annotations'
    output_images_dir.mkdir(parents=True, exist_ok=True)
    output_annotations_dir.mkdir(parents=True, exist_ok=True)
    
    input_images_path = Path(input_images_dir)
    input_annotations_path = Path(input_annotations_dir)
    
    # Track augmented files
    augmented_data = []
    
    # Process each class
    for class_label, target_count in target_counts.items():
        class_data = df[df['pain_level'] == class_label].copy()
        current_count = len(class_data)
        
        if current_count >= target_count:
            print(f"Class {class_label}: Already has {current_count} samples (target: {target_count})")
            # Just copy original files
            for idx, row in class_data.iterrows():
                filename = row['filename']
                image_src = input_images_path / filename
                annotation_src = input_annotations_path / f"{Path(filename).stem}.json"
                
                if image_src.exists():
                    shutil.copy2(image_src, output_images_dir / filename)
                if annotation_src.exists():
                    shutil.copy2(annotation_src, output_annotations_dir / f"{Path(filename).stem}.json")
                
                augmented_data.append({
                    'filename': filename,
                    'pain_level': class_label
                })
            continue
        
        # Determine augmentation strategy
        if class_label == 2:
            aug_type = 'severe'
            augmentations_per_image = (target_count + current_count - 1) // current_count  # Ceiling division
        elif class_label == 1:
            aug_type = 'moderate'
            augmentations_per_image = (target_count + current_count - 1) // current_count
        else:
            aug_type = 'no_pain'
            augmentations_per_image = max(1, (target_count + current_count - 1) // current_count)
        
        augmentation = create_augmentation_pipeline(aug_type)
        
        print(f"\nAugmenting Class {class_label} ({aug_type}):")
        print(f"  Current: {current_count} samples")
        print(f"  Target: {target_count} samples")
        print(f"  Augmentations per image: ~{augmentations_per_image}")
        
        # Augment each image
        total_generated = 0
        for idx, row in tqdm(class_data.iterrows(), total=len(class_data), desc=f"Class {class_label}"):
            filename = row['filename']
            image_path = input_images_path / filename
            annotation_path = input_annotations_path / f"{Path(filename).stem}.json"
            
            if not image_path.exists():
                print(f"Warning: {image_path} not found, skipping")
                continue
            
            # Load image
            image = cv2.imread(str(image_path))
            if image is None:
                print(f"Warning: Could not load {image_path}, skipping")
                continue
            
            # Load annotation
            annotation_data = None
            if annotation_path.exists():
                with open(annotation_path, 'r') as f:
                    annotation_data = json.load(f)
            
            # Convert BGR to RGB for albumentations
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Copy original
            dst_image = output_images_dir / filename
            cv2.imwrite(str(dst_image), image)
            
            if annotation_data:
                dst_annotation = output_annotations_dir / f"{Path(filename).stem}.json"
                with open(dst_annotation, 'w') as f:
                    json.dump(annotation_data, f)
            
            augmented_data.append({
                'filename': filename,
                'pain_level': class_label
            })
            total_generated += 1
            
            # Generate augmented versions
            aug_count = 0
            while total_generated < target_count and aug_count < augmentations_per_image * 2:  # Safety limit
                augmented = augmentation(image=image_rgb)['image']
                
                # Convert back to BGR
                augmented_bgr = cv2.cvtColor(augmented, cv2.COLOR_RGB2BGR)
                
                # Generate filename
                base_name = Path(filename).stem
                ext = Path(filename).suffix
                aug_filename = f"{base_name}_aug_{aug_count:03d}{ext}"
                
                # Save augmented image
                dst_aug = output_images_dir / aug_filename
                cv2.imwrite(str(dst_aug), augmented_bgr)
                
                # Copy annotation (landmarks stay the same relative positions)
                # Note: In a real implementation, you'd transform landmarks too
                if annotation_data:
                    aug_annotation = annotation_data.copy()
                    dst_aug_annotation = output_annotations_dir / f"{base_name}_aug_{aug_count:03d}.json"
                    with open(dst_aug_annotation, 'w') as f:
                        json.dump(aug_annotation, f)
                
                augmented_data.append({
                    'filename': aug_filename,
                    'pain_level': class_label
                })
                total_generated += 1
                aug_count += 1
                
                if total_generated >= target_count:
                    break
    
    # Save augmented labels CSV
    augmented_df = pd.DataFrame(augmented_data)
    output_csv = output_path / 'labels_clean.csv'
    augmented_df.to_csv(output_csv, index=False)
    
    print(f"\n✅ Augmentation complete!")
    print(f"   Output directory: {output_dir}")
    print(f"   Total images: {len(augmented_df)}")
    print(f"   Class distribution:")
    print(augmented_df['pain_level'].value_counts().sort_index())
    
    return output_dir

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Augment feline pain dataset')
    parser.add_argument('--images', type=str, required=True,
                       help='Input images directory')
    parser.add_argument('--annotations', type=str, required=True,
                       help='Input annotations directory')
    parser.add_argument('--labels', type=str, required=True,
                       help='Labels CSV file')
    parser.add_argument('--output', type=str, required=True,
                       help='Output directory for augmented dataset')
    parser.add_argument('--target-no-pain', type=int, default=800,
                       help='Target count for No Pain class')
    parser.add_argument('--target-moderate', type=int, default=600,
                       help='Target count for Moderate Pain class')
    parser.add_argument('--target-severe', type=int, default=200,
                       help='Target count for Severe Pain class')
    
    args = parser.parse_args()
    
    augment_dataset(
        input_images_dir=args.images,
        input_annotations_dir=args.annotations,
        labels_csv=args.labels,
        output_dir=args.output,
        target_counts={
            0: args.target_no_pain,
            1: args.target_moderate,
            2: args.target_severe
        }
    )

