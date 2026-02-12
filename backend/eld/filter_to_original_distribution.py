"""
Filter dataset to match original distribution:
- Class 0 (No Pain): 897 samples
- Class 1 (Moderate Pain): 438 samples  
- Class 2 (Severe Pain): 31 samples
Total: 1,366 samples
"""
import pandas as pd
import argparse
from pathlib import Path
import shutil
import random

def filter_to_original_distribution(
    labels_csv,
    images_dir,
    annotations_dir,
    output_dir,
    target_counts=None,
    random_seed=42
):
    """
    Filter dataset to match original distribution
    
    Args:
        labels_csv: Path to labels CSV file
        images_dir: Input images directory
        annotations_dir: Input annotations directory
        output_dir: Output directory for filtered dataset
        target_counts: Target counts per class
        random_seed: Random seed for reproducibility
    """
    if target_counts is None:
        target_counts = {
            0: 897,  # No Pain
            1: 438,  # Moderate Pain
            2: 31    # Severe Pain
        }
    
    # Set random seed
    random.seed(random_seed)
    
    print("="*70)
    print("🔍 FILTERING TO ORIGINAL DISTRIBUTION")
    print("="*70)
    
    # Load labels CSV
    df = pd.read_csv(labels_csv)
    
    # Filter out entries without pain_level
    df_labeled = df[df['pain_level'].notna() & (df['pain_level'] != '')].copy()
    df_labeled['pain_level'] = df_labeled['pain_level'].astype(int)
    
    print(f"\n📊 Current distribution:")
    print(df_labeled['pain_level'].value_counts().sort_index())
    
    # Group by class
    files_by_class = {}
    for label in [0, 1, 2]:
        class_files = df_labeled[df_labeled['pain_level'] == label].copy()
        files_by_class[label] = class_files
    
    # Select files to keep
    selected_files = []
    
    print(f"\n🎯 Selecting files to match target distribution:")
    for label in [0, 1, 2]:
        available = files_by_class[label]
        target = target_counts[label]
        
        if len(available) < target:
            print(f"   ⚠️  Class {label}: Only {len(available)} available, target is {target}")
            selected = available
        else:
            # Randomly sample to target count
            selected = available.sample(n=target, random_state=random_seed)
            print(f"   ✅ Class {label}: Selected {len(selected)} from {len(available)} available")
        
        selected_files.append(selected)
    
    # Combine selected files
    selected_df = pd.concat(selected_files, ignore_index=True)
    
    print(f"\n✅ Total selected: {len(selected_df)} files")
    print(f"\n📊 Final distribution:")
    print(selected_df['pain_level'].value_counts().sort_index())
    
    # Create output directories
    output_path = Path(output_dir)
    output_images = output_path / 'images'
    output_annotations = output_path / 'annotations'
    output_images.mkdir(parents=True, exist_ok=True)
    output_annotations.mkdir(parents=True, exist_ok=True)
    
    # Copy selected files
    images_path = Path(images_dir)
    annotations_path = Path(annotations_dir)
    
    print(f"\n📁 Copying files to: {output_dir}")
    copied = 0
    for _, row in selected_df.iterrows():
        filename = row['filename']
        stem = Path(filename).stem
        
        # Copy image
        src_img = images_path / filename
        if src_img.exists():
            dst_img = output_images / filename
            shutil.copy2(src_img, dst_img)
            copied += 1
        else:
            print(f"   ⚠️  Image not found: {filename}")
        
        # Copy annotation
        ann_filename = row.get('annotation_file', f"{stem}.json")
        src_ann = annotations_path / ann_filename
        if not src_ann.exists():
            src_ann = annotations_path / f"{stem}.json"
        
        if src_ann.exists():
            dst_ann = output_annotations / src_ann.name
            shutil.copy2(src_ann, dst_ann)
    
    # Save filtered CSV
    output_csv = output_path / 'labels_clean.csv'
    selected_df[['filename', 'pain_level']].to_csv(output_csv, index=False)
    
    print(f"\n✅ Filtering complete!")
    print(f"   Copied {copied} images")
    print(f"   Created {output_csv}")
    print(f"   Output directory: {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Filter dataset to original distribution')
    parser.add_argument('--labels', type=str, required=True,
                       help='Input labels CSV file')
    parser.add_argument('--images', type=str, required=True,
                       help='Input images directory')
    parser.add_argument('--annotations', type=str, required=True,
                       help='Input annotations directory')
    parser.add_argument('--output', type=str, required=True,
                       help='Output directory')
    parser.add_argument('--target-no-pain', type=int, default=897,
                       help='Target count for No Pain class')
    parser.add_argument('--target-moderate', type=int, default=438,
                       help='Target count for Moderate Pain class')
    parser.add_argument('--target-severe', type=int, default=31,
                       help='Target count for Severe Pain class')
    
    args = parser.parse_args()
    
    filter_to_original_distribution(
        labels_csv=args.labels,
        images_dir=args.images,
        annotations_dir=args.annotations,
        output_dir=args.output,
        target_counts={
            0: args.target_no_pain,
            1: args.target_moderate,
            2: args.target_severe
        }
    )


