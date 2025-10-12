"""
Ensemble Landmark Detector (ELD) Package

This package contains the implementation of the Ensemble Landmark Detector (ELD) 
model for feline pain assessment using the Magnifying Ensemble Method.

Components:
- eld_model.py: Core ELD implementation with 48-landmark detection
- train_eld_model.py: Training script for the ELD model
- requirements_eld.txt: ELD-specific dependencies
- README_ELD.md: Comprehensive documentation
- eld_pain_model.pkl: Trained ELD classifier
- eld_training_results.json: Training results and metrics
- eld_training_results.png: Training visualization plots

Architecture:
1. Face Detection: Finds cat face location
2. Region Detection: Identifies 5 key regions (eyes, ears, nose/whisker)
3. Ensemble of Specialists: 5 specialized models for landmark detection
4. Magnifying Ensemble: Multi-scale processing for enhanced accuracy
5. Combination: Produces final 48 landmarks for pain assessment
"""

from .eld_model import FelinePainAssessmentELD, MagnifyingEnsemble, FelineFaceDetector, RegionDetector, SpecialistModel

__version__ = "1.0.0"
__author__ = "PawThos Team"
__description__ = "Ensemble Landmark Detector for Feline Pain Assessment"

__all__ = [
    'FelinePainAssessmentELD',
    'MagnifyingEnsemble', 
    'FelineFaceDetector',
    'RegionDetector',
    'SpecialistModel'
]

