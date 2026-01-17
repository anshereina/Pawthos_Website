import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPainAssessment } from '../../utils/painAssessments.utils';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff', // White background
    },
    scrollView: {
        flex: 1,
    },
    content: {
        width: '100%',
        maxWidth: 400, // Limit maximum width for better centering
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
    },
    // Circular Icon Container
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: -15, // Creates overlap with the results card
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        zIndex: 10, // Ensures it appears above the results card
    },
    // Results Card
    resultsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        paddingTop: 40, 
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    resultText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#d37f52', // Terracotta color for result
        marginBottom: 16,
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#e0e0e0',
        marginBottom: 20,
    },
    recommendationsTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    recommendationsText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Scoring Explanation
    scoringExplanation: {
        backgroundColor: '#f5f9f7',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        width: '100%',
        borderLeftWidth: 4,
        borderLeftColor: '#4a7c59',
    },
    scoringTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 8,
        textAlign: 'left',
    },
    scoringText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'left',
        lineHeight: 18,
    },
    // Button Container
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
        marginTop: 8,
        paddingBottom: 8,
    },
    // Save Question Container
    saveQuestionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    // Save Question Text
    saveQuestionText: {
        color: '#045b26',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Yes/No Text Buttons
    yesNoTextButton: {
        color: '#D37F52',
        fontSize: 16,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    yesNoTextButtonDisabled: {
        color: '#ccc',
    },

    // Second Opinion Button
    secondOpinionButton: {
        backgroundColor: '#D37F52', // Terracotta orange
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        width: '100%',
        maxWidth: 360,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 6,
    },
    secondOpinionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    // Note Text
    noteText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 16,
        paddingHorizontal: 20,
        lineHeight: 16,
    },
});

interface CanineIntegrationResultPageProps {
    onSecondOpinion?: () => void;
    onHome?: () => void;
    onSecondOpinionAppointment?: () => void;
    onSave?: () => void;
    petType?: string;
    severityLevel?: string;
    painLevel?: string;
    selectedAnswers?: number[];
}

export default function CanineIntegrationResultPage({ 
    onSecondOpinion, 
    onHome, 
    onSecondOpinionAppointment,
    onSave,
    petType = 'dog', 
    severityLevel = 'Unknown',
    painLevel,
    selectedAnswers = []
}: CanineIntegrationResultPageProps) {
    
    // Calculate pain level based on BEAAP assessment (6-level BEAP mapping)
    const calculatePainLevel = (answers: number[]) => {
        if (answers.length === 0) {
            return 'Unknown';
        }
        
        // Use the provided selectedAnswers from props if available
        // selectedAnswers is an array of arrays: [[imageIndices for category 0], [imageIndices for category 1], ...]
        if (selectedAnswers && selectedAnswers.length > 0) {
            // Calculate total score from the nested array structure
            // Each category can have multiple image selections, so we need to calculate average per category
            const totalScore = selectedAnswers.reduce((sum, imageIndices, categoryIndex) => {
                // imageIndices is an array of selected image indices for this category
                if (!imageIndices || imageIndices.length === 0) return sum;
                
                // Calculate the maximum score from selected images in this category (worst pain indicator)
                // Or average if multiple selections - using max for conservative assessment
                const categoryScore = Math.max(...imageIndices.map(imageIndex => {
                    // Map image index to score (0-5 scale per category)
                    // Image index 0 = score 0, index 1 = score 1, etc.
                    return imageIndex;
                }));
                
                return sum + categoryScore;
            }, 0);
            
            // Map total score to 6 pain levels (0-40 scale → BEAP)
            // 0–3: Level 0 (No Pain)
            // 4–12: Level 1 (Mild Pain)
            // 13–20: Level 2 (Moderate Pain)
            // 21–28: Level 3 (Moderate to Severe Pain)
            // 29–36: Level 4 (Severe Pain)
            // 37–40: Level 5 (Worst Pain Possible)
            if (totalScore <= 3) {
                return 'Level 0 (No Pain)';
            } else if (totalScore <= 12) {
                return 'Level 1 (Mild Pain)';
            } else if (totalScore <= 20) {
                return 'Level 2 (Moderate Pain)';
            } else if (totalScore <= 28) {
                return 'Level 3 (Moderate to Severe Pain)';
            } else if (totalScore <= 36) {
                return 'Level 4 (Severe Pain)';
            } else if (totalScore <= 40) {
                return 'Level 5 (Worst Pain Possible)';
            } else {
                return 'Level 5 (Worst Pain Possible)'; // Cap at worst pain
            }
        }
        
        // Fallback to old calculation method if no stored data
        const painScores = answers.map(answerIndex => {
            // Convert image index to pain score based on BEAAP scale
            if (answerIndex === 0) return 0; // No pain
            if (answerIndex === 1) return 1.5; // Mild pain (1-2)
            if (answerIndex === 2) return 3.5; // Moderate pain (3-4)
            if (answerIndex === 3) return 5.5; // Moderate to severe pain (5-6)
            if (answerIndex === 4) return 7.5; // Severe pain (7-8)
            if (answerIndex === 5) return 9.5; // Worst pain possible (9-10)
            return 0;
        });
        
        const averageScore = painScores.reduce((sum, score) => sum + score, 0) / painScores.length;
        // Map 0–10 average to 6 levels using midpoints between anchors
        if (averageScore <= 0.75) {
            return 'Level 0 (No Pain)';
        } else if (averageScore <= 2.5) {
            return 'Level 1 (Mild Pain)';
        } else if (averageScore <= 4.5) {
            return 'Level 2 (Moderate Pain)';
        } else if (averageScore <= 6.5) {
            return 'Level 3 (Moderate to Severe Pain)';
        } else if (averageScore <= 8.5) {
            return 'Level 4 (Severe Pain)';
        } else {
            return 'Level 5 (Worst Pain Possible)';
        }
    };

    // Use calculated pain level or provided pain level
    const currentPainLevel = painLevel || calculatePainLevel(selectedAnswers);

    // Define a function to get recommendations based on the pain level
    const getRecommendations = (level: string) => {
        if (level === 'Level 0 (No Pain)' || level === 'Level 0' || level === 'No Pain') {
            return 'Your dog appears to be in good health. Continue to monitor their behavior and well-being using the BEAAP assessment regularly.';
        } else if (level === 'Level 1 (Mild Pain)' || level === 'Level 1' || level === 'Mild Pain') {
            return 'Your dog may be experiencing mild pain. Monitor closely for changes in behavior, appetite, or activity level. Consider consulting with a veterinarian if symptoms persist or worsen.';
        } else if (level === 'Level 2 (Moderate Pain)' || level === 'Level 2' || level === 'Moderate Pain') {
            return 'Your dog is experiencing moderate pain. It is recommended to schedule a veterinary appointment soon to address the underlying cause and ensure your dog\'s comfort.';
        } else if (level === 'Level 3 (Moderate to Severe Pain)' || level === 'Level 3' || level === 'Moderate to Severe Pain') {
            return 'Your dog is experiencing moderate to severe pain. Please schedule a veterinary appointment as soon as possible to address the pain and underlying health issues.';
        } else if (level === 'Level 4 (Severe Pain)' || level === 'Level 4' || level === 'Severe Pain') {
            return 'Your dog is experiencing severe pain. Immediate veterinary attention is strongly recommended to ensure your dog\'s comfort and address any serious health concerns.';
        } else if (level === 'Level 5 (Worst Pain Possible)' || level === 'Level 5' || level === 'Worst Pain Possible') {
            return 'Your dog may be in the worst pain possible. Seek emergency veterinary care immediately.';
        } else if (level === 'Not recognize' || level === 'Not Recognized' || level === 'Unknown') {
            return 'The assessment could not be properly completed. Please ensure you have answered all BEAAP categories and try the assessment again following the guidelines.';
        }
        return "Pain assessment result is unknown. Please try again or consult a professional.";
    };

    // Define a function to get the image source based on pain level
    const getResultImage = (level: string) => {
        if (level === 'Level 0 (No Pain)' || level === 'Level 0' || level === 'No Pain') {
            return require('../../assets/images/NoPain.png'); // No pain image
        } else if (level === 'Level 1 (Mild Pain)' || level === 'Level 1' || level === 'Mild Pain') {
            return require('../../assets/images/MildPain.png'); // Mild pain image
        } else if (level === 'Level 2 (Moderate Pain)' || level === 'Level 2' || level === 'Moderate Pain') {
            return require('../../assets/images/ModeratePain.png'); // Moderate pain image
        } else if (level === 'Level 3 (Moderate to Severe Pain)' || level === 'Level 3' || level === 'Moderate to Severe Pain') {
            return require('../../assets/images/ModeratePain.png'); // Moderate to severe pain image
        } else if (level === 'Level 4 (Severe Pain)' || level === 'Level 4' || level === 'Severe Pain') {
            return require('../../assets/images/ModeratePain.png'); // Severe pain image
        } else if (level === 'Level 5 (Worst Pain Possible)' || level === 'Level 5' || level === 'Worst Pain Possible') {
            return require('../../assets/images/ModeratePain.png'); // Worst pain possible - reuse severe image
        } else if (level === 'Not recognize' || level === 'Not Recognized' || level === 'Unknown') {
            return require('../../assets/images/NoPain.png'); // Default to no pain image for unknown
        }
        return require('../../assets/images/NoPain.png'); // Default to no pain image
    };

    const recommendations = getRecommendations(currentPainLevel);
    const resultImageSource = getResultImage(currentPainLevel);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveChoice, setSaveChoice] = useState<'yes' | 'no' | null>(null);
    const [petRegistered, setPetRegistered] = useState<'yes' | 'no' | null>(null);

    // Read pet_registered flag from storage
    React.useEffect(() => {
        (async () => {
            try {
                const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
                if (assessmentDataString) {
                    const assessmentData = JSON.parse(assessmentDataString);
                    if (assessmentData && assessmentData.pet_registered) {
                        setPetRegistered(assessmentData.pet_registered);
                    }
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    const handleSaveChoice = async (choice: 'yes' | 'no') => {
        setSaveChoice(choice);
        
        if (choice === 'yes') {
            setIsSaving(true);
            try {
                // Get the assessment data from local storage
                const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
                if (assessmentDataString) {
                    const assessmentData = JSON.parse(assessmentDataString);
                    
                    // Update the assessment data with final results
                    assessmentData.recommendations = recommendations;
                    assessmentData.pain_level = currentPainLevel;
                    assessmentData.beaap_answers = selectedAnswers;
                    assessmentData.pet_type = 'dog';
                    
                    // Create the assessment in the database
                    const result = await createPainAssessment(assessmentData);

                    if (result.success) {
                        console.log('Canine assessment created and saved successfully');
                        setIsSaved(true);
                        
                        // Save pet info for second opinion before clearing
                        await AsyncStorage.setItem('canineAssessmentPetInfo', JSON.stringify({
                            pet_id: assessmentData.pet_id,
                            pet_name: assessmentData.pet_name,
                            pet_type: assessmentData.pet_type || 'dog'
                        }));
                        
                        // Clear the assessment data from storage
                        await AsyncStorage.removeItem('currentAssessmentData');
                        
                        // Don't navigate automatically - stay on the same page
                        // The user can choose to navigate using the back arrow or second opinion button
                    } else {
                        console.error('Failed to save canine assessment:', result.message);
                        Alert.alert('Error', 'Failed to save assessment. Please try again.');
                        setSaveChoice(null);
                    }
                } else {
                    Alert.alert('Error', 'No assessment data found to save.');
                    setSaveChoice(null);
                }
            } catch (error) {
                console.error('Error saving canine assessment:', error);
                Alert.alert('Error', 'Failed to save assessment. Please try again.');
                setSaveChoice(null);
            } finally {
                setIsSaving(false);
            }
        } else if (choice === 'no') {
            // Don't save, just clear the data and go home
            try {
                await AsyncStorage.removeItem('currentAssessmentData');
                console.log('Canine assessment discarded, navigating to home');
                if (onHome) {
                    onHome();
                }
            } catch (error) {
                console.error('Error clearing assessment data:', error);
                if (onHome) {
                    onHome();
                }
            }
        }
    };

    const handleHome = async () => {
        try {
            // Clear the assessment data from storage without saving
            await AsyncStorage.removeItem('currentAssessmentData');
            console.log('Canine assessment discarded, navigating to home');
        } catch (error) {
            console.error('Error clearing assessment data:', error);
        }
        
        if (onHome) {
            onHome();
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={true}
            >
                {/* Circular Image */}
                <View style={styles.iconContainer}>
                    <Image
                        source={resultImageSource}
                        style={{ width: 50, height: 50, resizeMode: 'contain' }}
                    />
                </View>

                {/* Results Card */}
                <View style={styles.resultsCard}>
                    <Text style={styles.resultTitle}>
                        Your dog's pain level is:
                    </Text>
                    <Text style={styles.resultText}>
                        {currentPainLevel}
                    </Text>
                    
                    {/* Display Total Score */}
                    {selectedAnswers && selectedAnswers.length > 0 && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.recommendationsTitle}>
                                Total Score
                            </Text>
                            <Text style={[styles.resultText, { fontSize: 18, color: '#045b26', marginBottom: 12 }]}>
                                {selectedAnswers.reduce((sum, imageIndices) => {
                                    if (!imageIndices || imageIndices.length === 0) return sum;
                                    // Use max score from selected images in this category
                                    const categoryScore = Math.max(...imageIndices.map(imageIndex => imageIndex));
                                    return sum + categoryScore;
                                }, 0)} / 40
                            </Text>
                            
                            {/* Scoring Explanation */}
                            <View style={styles.scoringExplanation}>
                                <Text style={styles.scoringTitle}>📊 How Scoring Works</Text>
                                <Text style={styles.scoringText}>
                                    We assessed 8 areas of your dog's behavior: breathing, eyes, walking, activity, appetite, attitude, posture, and touch response. Each area is scored 0-5 points based on pain indicators.
                                    {'\n\n'}
                                    <Text style={{ fontWeight: 'bold' }}>Your dog's total: </Text>
                                    {selectedAnswers.reduce((sum, imageIndices) => {
                                        if (!imageIndices || imageIndices.length === 0) return sum;
                                        // Use max score from selected images in this category
                                        const categoryScore = Math.max(...imageIndices.map(imageIndex => imageIndex));
                                        return sum + categoryScore;
                                    }, 0)} points out of 40 possible
                                    {'\n\n'}
                                    • 0-4: Minimal or no pain{'\n'}
                                    • 5-11: Mild pain{'\n'}
                                    • 12-19: Moderate pain{'\n'}
                                    • 20-26: Moderate to severe pain{'\n'}
                                    • 27-33: Severe pain{'\n'}
                                    • 34-40: Worst possible pain
                                </Text>
                            </View>
                        </>
                    )}
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.recommendationsTitle}>
                        Recommendations
                    </Text>
                    <Text style={styles.recommendationsText}>
                        {recommendations}
                    </Text>
                </View>

                {/* Call-to-Action Buttons */}
                <View style={styles.buttonContainer}>
                    {petRegistered === 'yes' ? (
                        <>
                            <Text style={styles.noteText}>
                                Note: If you want to ask for second opinion, save the assessment and set an appointment with San Pedro City Vet Office.
                            </Text>
                            <View style={styles.saveQuestionContainer}>
                                <Text style={styles.saveQuestionText}>Save Assessment?</Text>
                                
                                <TouchableOpacity
                                    onPress={() => handleSaveChoice('yes')}
                                    disabled={saveChoice === 'yes' || isSaving}
                                >
                                    {isSaving ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <ActivityIndicator size="small" color="#D37F52" style={{ marginRight: 4 }} />
                                            <Text style={[styles.yesNoTextButton, styles.yesNoTextButtonDisabled]}>Saving...</Text>
                                        </View>
                                    ) : (
                                        <Text style={[
                                            styles.yesNoTextButton,
                                            (saveChoice === 'yes' || isSaving) && styles.yesNoTextButtonDisabled
                                        ]}>Yes</Text>
                                    )}
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    onPress={() => (saveChoice === 'yes' ? undefined : handleSaveChoice('no'))}
                                    disabled={saveChoice !== null || isSaving}
                                >
                                    <Text style={[
                                        styles.yesNoTextButton,
                                        (saveChoice !== null || isSaving) && styles.yesNoTextButtonDisabled
                                    ]}>No</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {/* Show Second Opinion button only when user clicks "Yes" */}
                            {saveChoice === 'yes' && (
                                <>
                                    <TouchableOpacity
                                        style={styles.secondOpinionButton}
                                        onPress={onSecondOpinionAppointment}
                                    >
                                        <Text style={styles.secondOpinionButtonText}>Second Opinion</Text>
                                    </TouchableOpacity>
                                    
                                    <Text style={styles.noteText}>
                                        Note: You'll need to schedule your pet to clinic appointment once you have a second opinion.
                                    </Text>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.secondOpinionButton}
                                onPress={onSecondOpinion}
                            >
                                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.secondOpinionButtonText}>Take another assessment</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.secondOpinionButton, { backgroundColor: '#045b26' }]}
                                onPress={onHome}
                            >
                                <Text style={styles.secondOpinionButtonText}>Go to Home</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
