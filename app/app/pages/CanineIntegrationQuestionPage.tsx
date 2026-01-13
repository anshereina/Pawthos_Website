import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CanineIntegrationQuestionPage({ onSelect, onCategoryChange }: { onSelect: (label: string, data?: any) => void, onCategoryChange?: (category: string) => void }) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [currentCategory, setCurrentCategory] = useState(0);
  // Changed to allow multiple selections per category (array of arrays)
  const [selectedAnswers, setSelectedAnswers] = useState<number[][]>(Array(8).fill(null).map(() => []));

  const categories = [
    'Breathing',
    'Eyes', 
    'Ambulation',
    'Activity',
    'Appetite',
    'Attitude',
    'Posture',
    'Palpation'
  ];

  useEffect(() => {
    // Ensure we are at the top whenever the category changes
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    // Notify parent of category change for header update
    if (onCategoryChange) {
      onCategoryChange(categories[currentCategory]);
    }
  }, [currentCategory, onCategoryChange]);

  // Updated category data with proper scoring system (0-5 scale per category, total 0-40)
  const categoryData = [
    // Breathing
    {
      images: [
        { source: require('../../assets/images/caninepictures/breathing/Breathing_0_No_Pain.png'), text: 'Breathing calmly at rest', score: 0 },
        { source: require('../../assets/images/caninepictures/breathing/Breathing_1-2_Mild_Pain.png'), text: 'Breathing normally during activity', score: 0 },
        { source: require('../../assets/images/caninepictures/breathing/Breathing_3-4_Moderate_Pain.jpg'), text: 'May sometimes have trouble catching their breath', score: 1 },
        { source: require('../../assets/images/caninepictures/breathing/Breathing_5-6_Moderate_to_Severe_Pain.png'), text: 'Often breathes heavily and may need extra effort to breathe', score: 2 },
        { source: require('../../assets/images/caninepictures/breathing/Breathing_7-8_Severe_Pain.jpg'), text: 'Breathing is fast and often looks harder than normal, with frequent panting', score: 3 },
        { source: require('../../assets/images/caninepictures/breathing/Breathing_9-10_Worst_Pain_Possible.webp'), text: 'Panting with faster and more difficult breathing', score: 4 }
      ]
    },
    // Eyes
    {
      images: [
        { source: require('../../assets/images/caninepictures/eyes/Eyes_0_No_Pain.png'), text: 'Eyes bright and alert', score: 0 },
        { source: require('../../assets/images/caninepictures/eyes/Eyes_1-2_Mild_Pain.png'), text: 'Eyes bright and alert', score: 0 },
        { source: require('../../assets/images/caninepictures/eyes/Eyes_3-4_Moderate_Pain.png'), text: 'Eyes slightly more dull in appearance; can have a slightly furrowed brow', score: 1 },
        { source: require('../../assets/images/caninepictures/eyes/Eyes_5-6_Moderate_to_Severe.png'), text: 'Dull eyes; worried look', score: 2 },
        { source: require('../../assets/images/caninepictures/eyes/Eyes_7-8_Severe_Pain.png'), text: 'Dull eyes; seems distant or unfocused', score: 3 },
        { source: require('../../assets/images/caninepictures/eyes/Eyes_9-10_Worst_Pain_Possible.png'), text: 'Dull eyes; have a pained look', score: 4 }
      ]
    },
    // Ambulation
    {
      images: [
        { source: require('../../assets/images/caninepictures/ambulation/Ambulation_0_No_Pain.png'), text: 'Moves normally on all four legs with no difficulty or discomfort', score: 0 },
        { source: require('../../assets/images/caninepictures/ambulation/Ambulation_1-2_Mild_Pain.png'), text: 'Walks normally; may show slight discomfort', score: 1 },
        { source: require('../../assets/images/caninepictures/ambulation/Ambulation_3-4_Moderate_Pain.webp'), text: 'Noticeably slower to lie down or rise up; may exhibit "lameness" when walking', score: 2 },
        { source: require('../../assets/images/caninepictures/ambulation/Ambulation_5-6_Moderate_to_Severe_Pain.jpg'), text: 'Very slow to rise up and lie down; hesitation with movement; difficulty on stairs; reluctant to turn corners; stiff to start out; may be limping', score: 3 },
        { source: require('../../assets/images/caninepictures/ambulation/Ambulation_7-8_Severe_Pain.jpg'), text: 'Obvious difficulty rising up or lying down; will not bear weight on affected leg; avoids stairs; obvious lameness', score: 4 },
        { source: require('../../assets/images/caninepictures/ambulation/Ambulation_9-10_Worst_Pain_Possible.jpg'), text: 'May refuse to get up; may not be able to or willing to take more than a few steps; will not bear weight on affected limb', score: 5 }
      ]
    },
    // Activity
    {
      images: [
        { source: require('../../assets/images/caninepictures/activity/Activity_0_No_Pain.png'), text: 'Engages in play and all normal activities', score: 0 },
        { source: require('../../assets/images/caninepictures/activity/Activity_1-2_Mild_Pain.png'), text: 'May be slightly slower to lie down or get up', score: 1 },
        { source: require('../../assets/images/caninepictures/activity/Activity_3-4_Moderate_Pain.png'), text: 'May be a bit restless, having trouble getting comfortable and shifting weight', score: 2 },
        { source: require('../../assets/images/caninepictures/activity/Activity_5-6_Moderate_to_Severe_Pain.png'), text: 'Do not want to interact but may be in a room with a family member; obvious lameness when walking; may lick painful area', score: 3 },
        { source: require('../../assets/images/caninepictures/activity/Activity_7-8_Severe_Pain.png'), text: 'Avoids interaction with family or environment; unwilling to get up or move; may frequently lick a painful area', score: 4 },
        { source: require('../../assets/images/caninepictures/activity/Activity_9-10_Worst_Pain_Possible.png'), text: 'Difficulty in being distracted from pain, even with gentle touch or something familiar', score: 5 }
      ]
    },
    // Appetite
    {
      images: [
        { source: require('../../assets/images/caninepictures/activity/Activity_0_No_Pain.png'), text: 'Eating and drinking normally', score: 0 },
        { source: require('../../assets/images/caninepictures/activity/Activity_1-2_Mild_Pain.png'), text: 'Eating and drinking normally', score: 0 },
        { source: require('../../assets/images/caninepictures/activity/Activity_3-4_Moderate_Pain.png'), text: 'Picky eater; may only want treats or human food', score: 1 },
        { source: require('../../assets/images/caninepictures/activity/Activity_5-6_Moderate_to_Severe_Pain.png'), text: 'Frequently not interested in eating', score: 2 },
        { source: require('../../assets/images/caninepictures/activity/Activity_7-8_Severe_Pain.png'), text: 'Loss of appetite; may not want to drink', score: 3 },
        { source: require('../../assets/images/caninepictures/activity/Activity_9-10_Worst_Pain_Possible.png'), text: 'No interest in food or water', score: 4 }
      ]
    },
    // Attitude
    {
      images: [
        { source: require('../../assets/images/caninepictures/attitude/Attitude_0_No_Pain.jpg'), text: 'Happy; interested in surroundings and playing; seeks attention', score: 0 },
        { source: require('../../assets/images/caninepictures/attitude/Attitude_1-2_Mild_Pain.png'), text: 'Happy and alert, though sometimes a bit quiet; overall behaves normally', score: 1 },
        { source: require('../../assets/images/caninepictures/attitude/Attitude_3-4_Moderate_Pain.png'), text: 'Less lively; doesn\'t initiate play', score: 2 },
        { source: require('../../assets/images/caninepictures/attitude/Attitude_5-6_Moderate_to_Severe_Pain.png'), text: 'Feels unsettled and can\'t sleep well', score: 3 },
        { source: require('../../assets/images/caninepictures/attitude/Attitude_7-8_Severe_Pain.avif'), text: 'Scared, anxious, and may act aggressive', score: 4 },
        { source: require('../../assets/images/caninepictures/attitude/Attitude_9-10_Worst_Pain_Possible.jpg'), text: 'Extremely low energy; lying motionless and clearly in pain', score: 5 }
      ]
    },
    // Posture
    {
      images: [
        { source: require('../../assets/images/caninepictures/posture/Posture_0_No_Pain.jpg'), text: 'Comfortable at rest and during play; ears up and wagging tail', score: 0 },
        { source: require('../../assets/images/caninepictures/posture/Posture_1-2_Mild_Pain.png'), text: 'May show occasional shifting of position; tail may be down just a little more; ears slightly flatter', score: 1 },
        { source: require('../../assets/images/caninepictures/posture/Posture_3-4_Moderate_Pain.png'), text: 'Difficulty squatting or lifting leg to urinate; subtle changes in position; tail more tucked and ears more flattened', score: 2 },
        { source: require('../../assets/images/caninepictures/posture/Posture_5-6_Moderate_to_Severe_Pain.png'), text: 'Abnormal weight distribution when standing; difficulty posturing to urinate; arched back; tucked belly; head hanging low; tucked tail', score: 3 },
        { source: require('../../assets/images/caninepictures/posture/Posture_7-8_Severe_Pain.png'), text: 'Tail tucked; ears flattened or pinned back; abnormal posture when standing; may refuse to move or stand', score: 4 },
        { source: require('../../assets/images/caninepictures/posture/Posture_9-10_Worst_Pain_Possible.png'), text: 'Refuses to lay down or rest on side at all; pained ears; may prefer to be very tucked up or stretched out', score: 5 }
      ]
    },
    // Palpation
    {
      images: [
        { source: require('../../assets/images/caninepictures/palpation/Palpation_0_No_Pain.jpg'), text: 'Enjoys being touched and petted; no body tension present', score: 0 },
        { source: require('../../assets/images/caninepictures/palpation/Palpation_1-2_Mild_Pain.jpg'), text: 'Enjoys being touched and petted; no body tension present', score: 0 },
        { source: require('../../assets/images/caninepictures/palpation/Palpation_3-4_Moderate_Pain.png'), text: 'Does not mind touch except on painful area; turns head to look where touched; mild body tension', score: 1 },
        { source: require('../../assets/images/caninepictures/palpation/Palpation_5-6_Moderate_to_Severe_Pain.jpg'), text: 'Withdraws from people; may not want to be touched; Pulls away from a hand when touched; moderate body tension when being touched', score: 2 },
        { source: require('../../assets/images/caninepictures/palpation/Palpation_7-8_Severe_Pain.jpg'), text: 'Significant body tension when painful area is touched; may vocalize in pain; guards a painful area by pulling away in a dramatic manner', score: 3 },
        { source: require('../../assets/images/caninepictures/palpation/Palpation_9-10_Worst_Pain_Possible.jpg'), text: 'Severe body tension when touched; will not tolerate touch of painful area; becomes fearful when other areas that are not painful are touched', score: 4 }
      ]
    }
  ];

  const handleBack = () => {
    onSelect('CanineGuidelineIntegration');
  };

  const handleImageSelect = (imageIndex: number) => {
    const newAnswers = [...selectedAnswers];
    const currentSelections = newAnswers[currentCategory] || [];
    
    // Toggle selection - if already selected, remove it; otherwise add it
    if (currentSelections.includes(imageIndex)) {
      newAnswers[currentCategory] = currentSelections.filter(idx => idx !== imageIndex);
    } else {
      newAnswers[currentCategory] = [...currentSelections, imageIndex];
    }
    
    setSelectedAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (!selectedAnswers[currentCategory] || selectedAnswers[currentCategory].length === 0) {
      Alert.alert('Selection Required', 'Please select at least one option before proceeding.');
      return;
    }

    if (currentCategory < categories.length - 1) {
      setCurrentCategory(currentCategory + 1);
    } else {
      // Calculate total score (average score per category if multiple selections)
      const totalScore = selectedAnswers.reduce((sum, imageIndices, categoryIndex) => {
        if (!imageIndices || imageIndices.length === 0) return sum;
        
        // Calculate average score for this category if multiple selections
        const categoryTotal = imageIndices.reduce((catSum, imageIndex) => {
          const score = categoryData[categoryIndex].images[imageIndex]?.score || 0;
          return catSum + score;
        }, 0);
        
        const averageScore = categoryTotal / imageIndices.length;
        return sum + averageScore;
      }, 0);

      // Save assessment data to AsyncStorage for the result page
      try {
        // Get existing assessment data (includes pet_registered, pet_id, pet_name, etc.)
        const existingDataString = await AsyncStorage.getItem('currentAssessmentData');
        let assessmentData = existingDataString ? JSON.parse(existingDataString) : {};
        
        // Merge with new assessment results
        assessmentData = {
          ...assessmentData,
          pet_type: 'dog',
          assessment_type: 'BEAAP',
          beaap_answers: selectedAnswers,
          total_score: totalScore,
          timestamp: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(assessmentData));
        
        // Navigate to results page with data
        onSelect('CanineIntegrationResult', { beaap_answers: selectedAnswers, total_score: totalScore });
      } catch (error) {
        console.error('Error saving assessment data:', error);
        Alert.alert('Error', 'Failed to save assessment data. Please try again.');
      }
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  };

  const isCurrentCategoryAnswered = selectedAnswers[currentCategory]?.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Intro */}
        <View style={styles.introCard}>
          <MaterialIcons name="pets" size={22} color="#045b26" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Assessment in progress</Text>
            <Text style={styles.introText}>Choose the image that matches your dog's current behavior for each category.</Text>
          </View>
        </View>

        <View style={[styles.card, styles.section]}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentCategory + 1} of {categories.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentCategory + 1) / categories.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Category Description */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>
              Select one or more images that represent your dog's {categories[currentCategory].toLowerCase()}:
            </Text>
            <Text style={styles.categorySubtitle}>
              💡 Tip: You can select multiple behaviors if your dog shows different symptoms
            </Text>
          </View>

          {/* Image Grid */}
          <View style={styles.imageGrid}>
            {categoryData[currentCategory].images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.imageContainer,
                  selectedAnswers[currentCategory]?.includes(index) && styles.selectedImage
                ]}
                onPress={() => handleImageSelect(index)}
                activeOpacity={0.9}
              >
                <Image source={image.source} style={styles.image} />
                <Text style={styles.imageText}>{image.text}</Text>
                {selectedAnswers[currentCategory]?.includes(index) && (
                  <View style={styles.checkmarkContainer}>
                    <MaterialIcons name="check-circle" size={24} color="#045b26" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentCategory > 0 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious} activeOpacity={0.9}>
              <MaterialIcons name="arrow-back" size={20} color="#045b26" />
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.nextButton, 
              !isCurrentCategoryAnswered && styles.disabledButton
            ]} 
            onPress={handleNext}
            disabled={!isCurrentCategoryAnswered}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>
              {currentCategory === categories.length - 1 ? 'Finish' : 'Next'}
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  introTitle: {
    color: '#045b26',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  introText: {
    color: '#4a7c59',
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  section: {
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    color: '#045b26',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D37F52',
    borderRadius: 2,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    color: '#045b26',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
  },
  categorySubtitle: {
    color: '#4a7c59',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  imageContainer: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedImage: {
    borderColor: '#D37F52',
    backgroundColor: '#fff8f5',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageText: {
    color: '#4a7c59',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 120,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  previousButtonText: {
    color: '#045b26',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D37F52',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 4,
    minWidth: 160,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
