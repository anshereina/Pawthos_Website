/**
 * FGS (Feline Grimace Scale) Scoring Utilities
 * 
 * Based on the official Feline Grimace Scale Training Manual:
 * "Facial expressions of pain in cats: the development and validation of a Feline Grimace Scale"
 * 
 * The FGS evaluates 5 facial action units, each scored 0-2:
 * 1. Ear Position
 * 2. Orbital Tightening
 * 3. Muzzle Tension
 * 4. Whiskers Change (note: "change" not "position")
 * 5. Head Position
 * 
 * Total FGS score: 0-10 (sum of all 5 features)
 * 
 * Pain Level Classification:
 * - Level 0 (No Pain): FGS score 0-2
 * - Level 1 (Mild Pain): FGS score 3-5
 * - Level 2 (Moderate/Severe Pain): FGS score 6-10
 */

export interface FgsFeatureScores {
  ear_position: number;
  orbital_tightening: number;
  muzzle_tension: number;
  whiskers_change: number;  // Note: "change" not "position"
  head_position: number;
}

/**
 * Calculate FGS total score from individual feature scores
 * @param features Object with scores for each FGS feature (0-2 each)
 * @returns Total FGS score (0-10)
 */
export const calculateFgsTotalScore = (features: Partial<FgsFeatureScores>): number => {
  const total = 
    (features.ear_position ?? 0) +
    (features.orbital_tightening ?? 0) +
    (features.muzzle_tension ?? 0) +
    (features.whiskers_change ?? 0) +
    (features.head_position ?? 0);
  
  return Math.min(10, Math.max(0, total)); // Clamp to 0-10
};

/**
 * Map FGS total score to pain level
 * @param fgsTotal FGS total score (0-10)
 * @returns Pain level string
 */
export const mapFgsScoreToPainLevel = (fgsTotal: number): string => {
  if (fgsTotal <= 2) {
    return 'Level 0 (No Pain)';
  } else if (fgsTotal <= 5) {
    return 'Level 1 (Mild Pain)';
  } else {
    return 'Level 2 (Moderate/Severe Pain)';
  }
};

/**
 * Validate FGS feature score
 * @param score Feature score to validate
 * @returns Validated score (0-2) or null if invalid
 */
export const validateFgsFeatureScore = (score: number | null | undefined): number | null => {
  if (score === null || score === undefined) return null;
  if (score === 0 || score === 1 || score === 2) return score;
  return null; // Invalid score
};

/**
 * Get FGS feature descriptions based on official training manual
 */
export const getFgsFeatureDescriptions = () => {
  return {
    ear_position: {
      0: 'Ears facing forward',
      1: 'Ears slightly pulled apart',
      2: 'Ears rotated outwards'
    },
    orbital_tightening: {
      0: 'Eyes opened',
      1: 'Partially closed eyes',
      2: 'Squinted eyes'
    },
    muzzle_tension: {
      0: 'Relaxed (round shape)',
      1: 'Mild tension',
      2: 'Tense (elliptical shape)'
    },
    whiskers_change: {
      0: 'Loose (relaxed) and curved',
      1: 'Slightly curved or straight (closer together)',
      2: 'Straight and moving forward (rostrally, away from the face)'
    },
    head_position: {
      0: 'Head above the shoulder line OR Head aligned with the shoulder line',
      1: 'Head aligned with the shoulder line',
      2: 'Head below the shoulder line or tilted down (chin toward the chest)'
    }
  };
};

/**
 * Get FGS scoring guidelines
 */
export const getFgsScoringGuidelines = () => {
  return {
    scoring: {
      0: 'Action unit is absent',
      1: 'Moderate appearance of the action unit, or uncertainty over its presence or absence',
      2: 'Obvious appearance of the action unit'
    },
    notVisible: 'If the action unit is not visible, mark as "not possible to score"',
    painLevels: {
      'Level 0 (No Pain)': { min: 0, max: 2, description: 'FGS score 0-2, no signs of discomfort' },
      'Level 1 (Mild Pain)': { min: 3, max: 5, description: 'FGS score 3-5, mild to moderate discomfort' },
      'Level 2 (Moderate/Severe Pain)': { min: 6, max: 10, description: 'FGS score 6-10, severe pain requiring attention' }
    }
  };
};

