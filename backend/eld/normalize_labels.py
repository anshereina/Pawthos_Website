#!/usr/bin/env python3
"""
Normalize feline pain assessment labels CSV for training.
Cleans up bracket formatting, handles multiple labels, and filters invalid entries.
"""

import csv
import re
import os
from pathlib import Path

def parse_label(label_str):
    """Parse a label string and return a single valid label or None."""
    # Remove brackets and whitespace
    clean = label_str.strip().strip('[]')
    
    # Split by comma if multiple values
    if ',' in clean:
        values = [v.strip() for v in clean.split(',')]
        # Convert to integers
        try:
            int_values = [int(v) for v in values]
        except ValueError:
            return None
        
        # Filter out -1 values
        valid_values = [v for v in int_values if v >= 0]
        
        # If exactly one valid value, use it
        if len(valid_values) == 1:
            return valid_values[0]
        # If multiple valid values or no valid values, skip
        else:
            return None
    else:
        # Single value
        try:
            value = int(clean)
            return value if value >= 0 else None
        except ValueError:
            return None

def normalize_csv(input_path, output_path):
    """Normalize the CSV file and write clean version."""
    cleaned_rows = []
    skipped_count = 0
    
    print(f"Reading from: {input_path}")
    
    with open(input_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        
        for row_num, row in enumerate(reader, 1):
            if len(row) != 2:
                print(f"Warning: Row {row_num} has {len(row)} columns, skipping")
                skipped_count += 1
                continue
            
            filename, label_str = row
            
            # Parse the label
            label = parse_label(label_str)
            
            if label is not None:
                cleaned_rows.append([filename, label])
            else:
                print(f"Skipping row {row_num}: {filename} - invalid label '{label_str}'")
                skipped_count += 1
    
    # Write cleaned data
    print(f"Writing {len(cleaned_rows)} valid rows to: {output_path}")
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['filename', 'label'])  # Header
        writer.writerows(cleaned_rows)
    
    # Print statistics
    print(f"\nNormalization complete!")
    print(f"Total rows processed: {len(cleaned_rows) + skipped_count}")
    print(f"Valid rows kept: {len(cleaned_rows)}")
    print(f"Rows skipped: {skipped_count}")
    
    # Count labels
    label_counts = {}
    for _, label in cleaned_rows:
        label_counts[label] = label_counts.get(label, 0) + 1
    
    print(f"\nLabel distribution:")
    for label in sorted(label_counts.keys()):
        count = label_counts[label]
        percentage = (count / len(cleaned_rows)) * 100
        print(f"  Label {label}: {count} samples ({percentage:.1f}%)")

def main():
    # Paths
    script_dir = Path(__file__).parent
    dataset_dir = script_dir.parent / "feline_pain_dataset"
    input_csv = dataset_dir / "labels_cat_datasets.csv"
    output_csv = dataset_dir / "labels_clean.csv"
    
    # Check if input exists
    if not input_csv.exists():
        print(f"Error: Input file not found: {input_csv}")
        return
    
    # Create output directory if needed
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    
    # Normalize the CSV
    normalize_csv(input_csv, output_csv)
    
    print(f"\nClean CSV saved to: {output_csv}")
    print("You can now use this file for training the pain classifier.")

if __name__ == "__main__":
    main()

