import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';




const CAT_QUESTIONS = [
  'Reluctance to jump onto counters or furniture (does it less)',
  'Difficulty jumping up or down from counters or furniture (falls or seems clumsy)',
  'Difficulty or avoids going up or down stairs',
  'Less playful',
  'Restlessness or difficulty finding a comfortable position',
  'Vocalizing (purring, or hissing) when touched or moving',
  'Decreased appetite',
  'Less desire to interact with people or animals (hiding, resisting being pet, brushed, held, or picked up)',
  'Excessive licking, biting or scratching a body part',
  'Sleeping in an unusual position or unusual location',
  'Unusual aggression when approached or touched (biting, hissing, ears pinned back)',
  'Changes in eye expression (staring, enlarged pupils, vacant look, or squinting)',
  'Stopped using or has difficulty getting in or out of litter box',
  'Stopped grooming completely or certain areas',
];

const PAW_WATERMARK_SIZE = 260;

export default function IntegrationQuestionsPage({ petType, onBack, onNext }) {
  const questions = CAT_QUESTIONS;
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));

  const handleAnswer = (idx, value) => {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));
  };

  // Check if all questions are answered
  const areAllQuestionsAnswered = () => {
    return answers.every(answer => answer !== null);
  };

  const handleNext = async () => {
    // Check if all questions are answered
    const allAnswered = answers.every(answer => answer !== null);
    
    if (!allAnswered) {
      // Show alert or some indication that all questions must be answered
      Alert.alert('Incomplete', 'Please answer all questions before proceeding.');
      return;
    }
    
    // Save answers to local storage before proceeding
    await saveAnswersToLocalStorage();
    onNext();
  };

  const saveAnswersToLocalStorage = async () => {
    try {
      const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
      if (!assessmentDataString) {
        console.error('No assessment data found');
        return;
      }

      const assessmentData = JSON.parse(assessmentDataString);
      
      // Update the assessment data with answers
      assessmentData.basic_answers = JSON.stringify(answers);
      assessmentData.assessment_answers = null;
      assessmentData.questions_completed = true;
      assessmentData.recommendations = `Assessment completed. Basic answers: ${answers.filter(a => a === true).length}/${answers.length} positive.`;

      // Store the updated assessment data back to AsyncStorage
      await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(assessmentData));
      console.log('Answers saved to local storage successfully');
      console.log('=== QUESTIONS PAGE DEBUG ===');
      console.log('Answers array:', answers);
      console.log('Basic answers JSON:', assessmentData.basic_answers);
      console.log('Full assessment data:', assessmentData);
    } catch (error) {
      console.error('Error saving answers to local storage:', error);
    }
  };

  const handleBack = () => {
    onBack();
  };



  return (
    <View style={styles.container}>
      {/* Watermark */}
              <View style={styles.watermarkContainer} pointerEvents="none">
          <View style={styles.pawWatermark}>
            <FontAwesome5 name="paw" size={180} color="#b6e2b6" style={{ opacity: 0.18 }} />
          </View>
        </View>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {/* Intro */}
        <View style={styles.introCard}>
          <FontAwesome5 name="paw" size={18} color="#045b26" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Quick check</Text>
            <Text style={styles.introText}>Answer each question to help us evaluate your pet's condition.</Text>
          </View>
        </View>

        <View style={[styles.card, styles.section]}>
          <Text style={styles.instructions}>Check yes or no for each of the following</Text>
        {/* Table header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }} />
          <Text style={styles.headerCol}>YES</Text>
          <Text style={styles.headerCol}>NO</Text>
        </View>
        {/* Questions */}
        {questions.map((q, idx) => (
          <View key={q} style={styles.questionRow}>
            <Text style={styles.questionText}>{q}</Text>
            <TouchableOpacity
              style={[styles.checkbox, answers[idx] === true && styles.checkboxChecked]}
              onPress={() => handleAnswer(idx, true)}
              activeOpacity={0.9}
            >
              {answers[idx] === true && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.checkbox, answers[idx] === false && styles.checkboxChecked]}
              onPress={() => handleAnswer(idx, false)}
              activeOpacity={0.9}
            >
              {answers[idx] === false && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
          </View>
        ))}
        </View>
        {/* Navigation buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.9}>
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.navButton, 
              !areAllQuestionsAnswered() && styles.navButtonDisabled
            ]} 
            onPress={handleNext}
            disabled={!areAllQuestionsAnswered()}
            activeOpacity={0.9}
          >
            <Text style={[
              styles.navButtonText,
              !areAllQuestionsAnswered() && styles.navButtonTextDisabled
            ]}>
              Next
            </Text>
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
  watermarkContainer: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
  },
  pawWatermark: {
    width: PAW_WATERMARK_SIZE,
    height: PAW_WATERMARK_SIZE,
    borderRadius: PAW_WATERMARK_SIZE / 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
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
  instructions: {
    fontSize: 16,
    color: '#045b26',
    textAlign: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  headerCol: {
    width: 48,
    color: '#b6e2b6',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  questionText: {
    flex: 1,
    color: '#4a7c59',
    fontSize: 16,
    marginRight: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#b6e2b6',
    borderRadius: 6,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  checkboxChecked: {
    borderColor: '#D37F52',
  },
  checkboxInner: {
    width: 16,
    height: 16,
    backgroundColor: '#D37F52',
    borderRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#D37F52',
    borderRadius: 14,
    marginHorizontal: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  navButtonTextDisabled: {
    color: '#999',
  },
}); 