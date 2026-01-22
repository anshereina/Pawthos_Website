/**
 * BEAP (BluePearl Pet Hospice) Pain Scale Scoring Utilities
 * 
 * Based on the official BEAP Pain Scale for Dogs:
 * - 0: No pain
 * - 1-2: Mild pain (midpoint: 1.5)
 * - 3-4: Moderate pain (midpoint: 3.5)
 * - 5-6: Moderate to severe pain (midpoint: 5.5)
 * - 7-8: Severe pain (midpoint: 7.5)
 * - 9-10: Worst pain possible (midpoint: 9.5)
 * 
 * The BEAP scale uses 8 categories:
 * B: Breathing, E: Eyes, A: Ambulation, A: Activity, 
 * A: Appetite, A: Attitude, P: Posture, P: Palpation
 */

/**
 * Map image index to BEAP score (midpoint of pain range)
 * Each category has 6 images representing the 6 pain ranges
 */
export const getBeapScoreFromImageIndex = (imageIndex: number): number => {
  const scoreMap: { [key: number]: number } = {
    0: 0,      // No pain (0)
    1: 1.5,    // Mild pain (1-2)
    2: 3.5,    // Moderate pain (3-4)
    3: 5.5,    // Moderate to severe pain (5-6)
    4: 7.5,    // Severe pain (7-8)
    5: 9.5,    // Worst pain possible (9-10)
  };
  return scoreMap[imageIndex] ?? 0;
};

/**
 * Calculate BEAP average score from category selections
 * @param selectedAnswers Array of arrays: [[imageIndices for category 0], [imageIndices for category 1], ...]
 * @returns Average BEAP score (0-10 scale)
 */
export const calculateBeapAverageScore = (selectedAnswers: number[][]): number => {
  if (!selectedAnswers || selectedAnswers.length === 0) {
    return 0;
  }

  const categoryScores: number[] = [];

  selectedAnswers.forEach((imageIndices, categoryIndex) => {
    if (!imageIndices || imageIndices.length === 0) {
      // If no selection for a category, use 0 (no pain)
      categoryScores.push(0);
      return;
    }

    // Use maximum score from selected images in this category (conservative approach)
    // This captures the worst pain indicator per category
    const categoryScore = Math.max(
      ...imageIndices.map(imageIndex => getBeapScoreFromImageIndex(imageIndex))
    );
    categoryScores.push(categoryScore);
  });

  // Calculate average across all 8 categories
  const totalScore = categoryScores.reduce((sum, score) => sum + score, 0);
  const averageScore = totalScore / categoryScores.length;

  return Math.round(averageScore * 10) / 10; // Round to 1 decimal place
};

/**
 * Map BEAP average score to pain level
 * @param averageScore Average BEAP score (0-10 scale)
 * @returns Pain level string
 */
export const mapBeapScoreToPainLevel = (averageScore: number): string => {
  if (averageScore <= 0) {
    return 'Level 0 (No Pain)';
  } else if (averageScore <= 1.5) {
    return 'Level 1 (Mild Pain)';
  } else if (averageScore <= 3.5) {
    return 'Level 2 (Moderate Pain)';
  } else if (averageScore <= 5.5) {
    return 'Level 3 (Moderate to Severe Pain)';
  } else if (averageScore <= 7.5) {
    return 'Level 4 (Severe Pain)';
  } else {
    return 'Level 5 (Worst Pain Possible)';
  }
};

/**
 * Get BEAP score ranges for each pain level
 */
export const getBeapPainLevelRanges = () => {
  return {
    'Level 0 (No Pain)': { min: 0, max: 0, description: 'No pain' },
    'Level 1 (Mild Pain)': { min: 0.1, max: 1.5, description: 'Mild pain (1-2 on BEAP scale)' },
    'Level 2 (Moderate Pain)': { min: 1.6, max: 3.5, description: 'Moderate pain (3-4 on BEAP scale)' },
    'Level 3 (Moderate to Severe Pain)': { min: 3.6, max: 5.5, description: 'Moderate to severe pain (5-6 on BEAP scale)' },
    'Level 4 (Severe Pain)': { min: 5.6, max: 7.5, description: 'Severe pain (7-8 on BEAP scale)' },
    'Level 5 (Worst Pain Possible)': { min: 7.6, max: 10, description: 'Worst pain possible (9-10 on BEAP scale)' },
  };
};

/**
 * Update category data scores to use BEAP midpoint values
 * This ensures consistency across the application
 */
export const updateCategoryDataScores = (categoryData: any[]) => {
  return categoryData.map((category, categoryIndex) => ({
    ...category,
    images: category.images.map((image: any, imageIndex: number) => ({
      ...image,
      score: getBeapScoreFromImageIndex(imageIndex),
      beapRange: imageIndex === 0 ? 0 : 
                 imageIndex === 1 ? '1-2' :
                 imageIndex === 2 ? '3-4' :
                 imageIndex === 3 ? '5-6' :
                 imageIndex === 4 ? '7-8' : '9-10'
    }))
  }));
};

