import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createPainAssessment, createPainAssessmentWithImage } from '../../utils/painAssessments.utils';
import VisualLandmarks from '../components/VisualLandmarks';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    
    // Header Section
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        fontFamily: 'Flink',
    },
    
    // Image Section
    imageSection: {
        width: '100%',
        marginBottom: 24,
        position: 'relative',
    },
    fullImage: {
        width: '100%',
        height: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    landmarkDot: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#87CEEB',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    
    // Enhanced Results Card
    resultsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        width: '100%',
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        position: 'relative',
        overflow: 'hidden',
    },
    painLevelCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        width: '100%',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        position: 'relative',
        overflow: 'hidden',
    },
    painLevelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    resultsCardGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: '#3B82F6',
    },
    painLevelSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    painLevelContainer: {
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        marginBottom: 16,
    },
    painLevelLabel: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '600',
        fontFamily: 'Jumper',
    },
    painLevelValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E40AF',
    },
    painLevelSubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    confidenceIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    confidenceIcon: {
        marginRight: 6,
    },
    confidenceText: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '600',
    },
    recommendationsSection: {
        width: '100%',
    },
    recommendationsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    recommendationsText: {
        fontSize: 14,
        color: 'rgba(26, 26, 26, 0.8)',
        textAlign: 'center',
        lineHeight: 22,
    },
    // Action Buttons
    actionButtonsContainer: {
        width: '100%',
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: '#045b26',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
    },
    secondaryButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    
    // Disclaimer
    disclaimerCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        width: '100%',
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    disclaimerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 8,
        textAlign: 'center',
    },
    disclaimerText: {
        fontSize: 12,
        color: 'rgba(26, 26, 26, 0.7)',
        textAlign: 'center',
        lineHeight: 16,
    },
    
    // Enhanced comprehensive analysis styles
    comprehensiveSection: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        position: 'relative',
        overflow: 'hidden',
    },
    comprehensiveTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 16,
        textAlign: 'center',
    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F8FAFE',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dropdownContent: {
        marginTop: 12,
        paddingHorizontal: 16,
    },
    fgsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    fgsItemLast: {
        borderBottomWidth: 0,
    },
    fgsLabel: {
        fontSize: 14,
        color: '#4A5568',
        flex: 1,
    },
    fgsScore: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D3748',
        minWidth: 30,
        textAlign: 'center',
    },
    fgsDescription: {
        fontSize: 12,
        color: '#718096',
        fontStyle: 'italic',
        marginTop: 4,
    },
    explanationItem: {
        marginBottom: 12,
    },
    explanationLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 4,
    },
    explanationText: {
        fontSize: 13,
        color: '#4A5568',
        lineHeight: 18,
    },
    adviceItem: {
        marginBottom: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.1)',
    },
    adviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    adviceLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    adviceList: {
        marginLeft: 0,
    },
    adviceListItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    adviceListItem: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginLeft: 8,
        flex: 1,
    },
    adviceText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    landmarkItem: {
        marginBottom: 8,
    },
    landmarkLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 4,
    },
    landmarkText: {
        fontSize: 13,
        color: '#4A5568',
        lineHeight: 18,
    },
    expandableSection: {
        marginTop: 8,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 8,
        marginTop: 8,
    },
    expandButtonText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
        marginRight: 4,
    },
    
    // Error Modal Styles
    errorModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    errorModalBox: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 10,
    },
    errorModalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    errorModalIconNoCat: {
        backgroundColor: '#FFE5E5',
    },
    errorModalIconPosition: {
        backgroundColor: '#FFF3CD',
    },
    errorModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    errorModalMessage: {
        fontSize: 16,
        color: '#4A5568',
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    errorModalGuidance: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    errorModalButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        minWidth: 120,
        alignItems: 'center',
    },
    errorModalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    errorModalCloseButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 8,
    },
});

interface IntegrationResultPageProps {
    onSecondOpinion?: () => void;
    onHome?: () => void;
    onSecondOpinionAppointment?: () => void;
    onSave?: () => void;
    onTakeAnotherPicture?: () => void;
    petType?: string;
    severityLevel?: string;
    painLevel?: string;
    // Enhanced comprehensive data from backend
    fgsBreakdown?: any;
    detailedExplanation?: any;
    actionableAdvice?: any;
    landmarkAnalysis?: any;
    visualLandmarks?: any;
    capturedImage?: string;
    // Full API result for error handling
    apiResult?: any;
}

export default function IntegrationResultPage({ 
    onSecondOpinion, 
    onHome, 
    onSecondOpinionAppointment,
    onSave,
    onTakeAnotherPicture,
    petType = 'cat', 
    severityLevel = 'Unknown',
    painLevel,
    fgsBreakdown,
    detailedExplanation,
    actionableAdvice,
    landmarkAnalysis,
    visualLandmarks,
    capturedImage,
    apiResult
}: IntegrationResultPageProps) {
    
    // Use painLevel if provided, otherwise fall back to severityLevel
    const currentPainLevel = painLevel || severityLevel;

    // Normalize various backend/result strings to a consistent 6-level BEAP set
    const normalizePainLevel = (level: string): string => {
        if (!level) return 'Unknown';
        const normalized = String(level).trim();
        // Prefer numeric level if present
        if (/^level\s*0/i.test(normalized)) return 'Level 0 (No Pain)';
        if (/^level\s*1/i.test(normalized)) return 'Level 1 (Mild Pain)';
        if (/^level\s*2/i.test(normalized)) return 'Level 2 (Moderate Pain)';
        if (/^level\s*3/i.test(normalized)) return 'Level 3 (Moderate to Severe Pain)';
        if (/^level\s*4/i.test(normalized)) return 'Level 4 (Severe Pain)';
        if (/^level\s*5/i.test(normalized)) return 'Level 5 (Worst Pain Possible)';

        // Handle plain labels
        const lower = normalized.toLowerCase();
        if (lower.includes('no pain')) return 'Level 0 (No Pain)';
        if (lower.includes('mild')) return 'Level 1 (Mild Pain)';
        if (lower.includes('moderate to severe')) return 'Level 3 (Moderate to Severe Pain)';
        if (lower.includes('moderate')) return 'Level 2 (Moderate Pain)';
        if (lower.includes('worst')) return 'Level 5 (Worst Pain Possible)';
        if (lower.includes('severe')) return 'Level 4 (Severe Pain)';
        if (lower.includes('unknown') || lower.includes('not recognize') || lower.includes('not recognized')) return 'Unknown';
        return 'Unknown';
    };

    const normalizedPainLevel = normalizePainLevel(currentPainLevel);

    // Resolve pet type preference from local assessment data if present
    const [displayPetType, setDisplayPetType] = useState<string>(petType);
    React.useEffect(() => {
        (async () => {
            try {
                const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
                if (assessmentDataString) {
                    const assessmentData = JSON.parse(assessmentDataString);
                    const storedType = String(assessmentData?.pet_type || '').toLowerCase();
                    if (storedType === 'cat' || storedType === 'dog') {
                        setDisplayPetType(storedType);
                    }
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    // Define a function to get recommendations based on the pain level
    const getRecommendations = (level: string, type: string) => {
        const petName = type === 'cat' ? 'cat' : 'dog';
        const petPronoun = type === 'cat' ? 'its' : 'their';
        
        if (level === 'Level 0 (No Pain)' || level === 'Level 0' || level === 'No Pain') {
            return `Your ${petName} appears to be in good health. Continue to monitor ${petPronoun} behavior and well-being.`;
        } else if (level === 'Level 1 (Mild Pain)' || level === 'Level 1' || level === 'Mild Pain') {
            return `Your ${petName} may be experiencing mild pain. Monitor closely for changes in behavior or appetite. Consider consulting with a veterinarian if symptoms persist.`;
        } else if (level === 'Level 2 (Moderate Pain)' || level === 'Level 2' || level === 'Moderate Pain') {
            return `Your ${petName} is experiencing moderate pain. Please schedule a veterinary appointment soon to address the underlying cause and ensure your pet's comfort.`;
        } else if (level === 'Level 3 (Moderate to Severe Pain)' || level === 'Level 3' || level === 'Moderate to Severe Pain') {
            return `Your ${petName} is experiencing moderate to severe pain. Seek prompt veterinary attention to manage pain and evaluate potential causes.`;
        } else if (level === 'Level 4 (Severe Pain)' || level === 'Level 4' || level === 'Severe Pain') {
            return `Your ${petName} is experiencing severe pain. Immediate veterinary attention is strongly recommended to ensure comfort and address serious concerns.`;
        } else if (level === 'Level 5 (Worst Pain Possible)' || level === 'Level 5' || level === 'Worst Pain Possible') {
            return `Your ${petName} may be in the worst pain possible. Seek emergency veterinary care immediately.`;
        } else if (level === 'Not recognize' || level === 'Not Recognized' || level === 'Unknown') {
            return `The image could not be properly analyzed. Please ensure your ${petName}'s face is clearly visible and well-lit. Try taking another photo following the guidelines above.`;
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
            return require('../../assets/images/ModeratePain.png'); // Reuse moderate image
        } else if (level === 'Level 4 (Severe Pain)' || level === 'Level 4' || level === 'Severe Pain') {
            return require('../../assets/images/ModeratePain.png'); // Reuse moderate image
        } else if (level === 'Level 5 (Worst Pain Possible)' || level === 'Level 5' || level === 'Worst Pain Possible') {
            return require('../../assets/images/ModeratePain.png'); // Reuse moderate image
        } else if (level === 'Not recognize' || level === 'Not Recognized' || level === 'Unknown') {
            return require('../../assets/images/NoPain.png'); // Default to no pain image for unknown
        }
        return require('../../assets/images/NoPain.png'); // Default to no pain image
    };

    const recommendations = getRecommendations(normalizedPainLevel, displayPetType);
    const resultImageSource = getResultImage(normalizedPainLevel);
    
    // Get pain level styling based on severity
    const getPainLevelStyling = (level: string) => {
        if (level === 'Level 0 (No Pain)' || level === 'Level 0' || level === 'No Pain') {
            return {
                containerColor: 'rgba(16, 185, 129, 0.05)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                textColor: '#059669',
                confidenceColor: '#059669',
                confidenceBg: 'rgba(16, 185, 129, 0.1)',
                icon: 'check-circle'
            };
        } else if (level === 'Level 1 (Mild Pain)' || level === 'Level 1' || level === 'Mild Pain') {
            return {
                containerColor: 'rgba(245, 158, 11, 0.05)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                textColor: '#D97706',
                confidenceColor: '#D97706',
                confidenceBg: 'rgba(245, 158, 11, 0.1)',
                icon: 'warning'
            };
        } else if (level === 'Level 2 (Moderate Pain)' || level === 'Level 2' || level === 'Moderate Pain') {
            return {
                containerColor: 'rgba(239, 68, 68, 0.05)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                textColor: '#DC2626',
                confidenceColor: '#DC2626',
                confidenceBg: 'rgba(239, 68, 68, 0.1)',
                icon: 'error'
            };
        } else {
            return {
                containerColor: 'rgba(239, 68, 68, 0.05)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                textColor: '#DC2626',
                confidenceColor: '#DC2626',
                confidenceBg: 'rgba(239, 68, 68, 0.1)',
                icon: 'error'
            };
        }
    };
    
    const painStyling = getPainLevelStyling(normalizedPainLevel);
    
    // Check for error types and show appropriate modal
    React.useEffect(() => {
        // Check if apiResult has error information
        if (apiResult && apiResult.error_type) {
            setErrorType(apiResult.error_type);
            setErrorMessage(apiResult.error_message || 'An error occurred');
            setErrorGuidance(apiResult.error_guidance || 'Please try again');
            setShowErrorModal(true);
        }
        // Also check painLevel for backward compatibility when it carries error metadata
        else if (painLevel && typeof (painLevel as any) === 'object' && (painLevel as any).error_type) {
            const errObj: any = painLevel;
            setErrorType(errObj.error_type);
            setErrorMessage(errObj.error_message || 'An error occurred');
            setErrorGuidance(errObj.error_guidance || 'Please try again');
            setShowErrorModal(true);
        }
    }, [apiResult, painLevel]);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveChoice, setSaveChoice] = useState<'yes' | 'no' | null>(null);
    const [petRegistered, setPetRegistered] = useState<'yes' | 'no' | null>(null);
    
    // Enhanced comprehensive analysis state
    const [showFGSBreakdown, setShowFGSBreakdown] = useState(false);
    const [showActionableAdvice, setShowActionableAdvice] = useState(false);
    const [showLandmarkAnalysis, setShowLandmarkAnalysis] = useState(false);
    
    // Error modal state
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorType, setErrorType] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [errorGuidance, setErrorGuidance] = useState<string>('');

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
                    
                    // Debug: Log what's in the assessment data
                    console.log('=== ASSESSMENT DATA FROM STORAGE ===');
                    console.log('Full assessment data:', assessmentData);
                    console.log('Basic answers:', assessmentData.basic_answers);
                    console.log('Assessment answers:', assessmentData.assessment_answers);
                    console.log('Captured image from props:', capturedImage);
                    console.log('Existing image_url in assessment data:', assessmentData?.image_url);
                    
                    // Update the assessment data with final results
                    assessmentData.recommendations = recommendations;
                    assessmentData.pain_level = currentPainLevel;
                    
                    // If this pet was marked as registered, store a lightweight snapshot
                    // so we can prefill the appointment form for Second Opinion later
                    try {
                        if (assessmentData.pet_registered === 'yes') {
                            const petSnapshot = {
                                pet_id: assessmentData.pet_id,
                                pet_name: assessmentData.pet_name,
                                pet_type: assessmentData.pet_type || displayPetType || 'cat',
                            };
                            console.log('Saving felineAssessmentPetInfo snapshot:', petSnapshot);
                            await AsyncStorage.setItem('felineAssessmentPetInfo', JSON.stringify(petSnapshot));
                        }
                    } catch (snapshotError) {
                        console.warn('Failed to store felineAssessmentPetInfo snapshot:', snapshotError);
                    }
                    
                    // Use capturedImage if available, otherwise use existing image_url
                    const imageToUse = capturedImage || assessmentData?.image_url;
                    console.log('=== IMAGE HANDLING DEBUG ===');
                    console.log('Image to use:', imageToUse);
                    console.log('Image URL string:', String(imageToUse || ''));
                    
                    // Check if image_url is already a server URL or local file path
                    let result;
                    const imageUrlString = String(imageToUse || '');
                    console.log('=== SAVE ASSESSMENT DEBUG ===');
                    console.log('Image URL string:', imageUrlString);
                    console.log('Assessment data:', JSON.stringify(assessmentData, null, 2));
                    
                    if (imageUrlString.startsWith('file://')) {
                        // Local file path - upload via multipart endpoint
                        console.log('Using multipart upload for local file');
                        result = await createPainAssessmentWithImage(assessmentData, imageUrlString);
                    } else if (imageUrlString.startsWith('/uploads/') || imageUrlString.startsWith('http')) {
                        // Already a server URL - create via JSON
                        console.log('Using JSON upload with server URL:', imageUrlString);
                        assessmentData.image_url = imageUrlString;
                        result = await createPainAssessment(assessmentData);
                    } else {
                        // No image or unknown format - create via JSON
                        console.log('Using JSON upload without image');
                        result = await createPainAssessment(assessmentData);
                    }

                    console.log('=== SAVE RESULT ===');
                    console.log('Result:', JSON.stringify(result, null, 2));

                    if (result.success) {
                        console.log('Assessment created and saved successfully');
                        setIsSaved(true);
                        // Clear the assessment data from storage
                        await AsyncStorage.removeItem('currentAssessmentData');
                        
                        // Show success message
                        Alert.alert('Success', 'Assessment saved successfully!');
                        
                        // Don't navigate automatically - stay on the same page
                        // The user can choose to navigate using the back arrow or second opinion button
                    } else {
                        console.error('Failed to save assessment:', result.message);
                        const errorMessage = result.message || 'Failed to save assessment. Please try again.';
                        console.error('Full error result:', JSON.stringify(result, null, 2));
                        Alert.alert(
                            'Error', 
                            `Failed to save assessment.\n\nReason: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`
                        );
                        setSaveChoice(null);
                    }
                } else {
                    Alert.alert('Error', 'No assessment data found to save.');
                    setSaveChoice(null);
                }
            } catch (error: any) {
                console.error('Error saving assessment:', error);
                console.error('Error details:', {
                    message: error?.message,
                    name: error?.name,
                    stack: error?.stack
                });
                
                // Extract error message
                let errorMessage = 'Failed to save assessment. Please try again.';
                if (error?.message) {
                    errorMessage = error.message;
                }
                
                Alert.alert(
                    'Error', 
                    `Failed to save assessment.\n\nError: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`
                );
                setSaveChoice(null);
            } finally {
                setIsSaving(false);
            }
        } else if (choice === 'no') {
            // Don't save, just clear the data and go home
            try {
                await AsyncStorage.removeItem('currentAssessmentData');
                console.log('Assessment discarded, navigating to home');
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
            console.log('Assessment discarded, navigating to home');
        } catch (error) {
            console.error('Error clearing assessment data:', error);
        }
        
        if (onHome) {
            onHome();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Error Modal */}
            {showErrorModal && (
                <View style={styles.errorModalOverlay}>
                    <View style={styles.errorModalBox}>
                        <TouchableOpacity 
                            style={styles.errorModalCloseButton}
                            onPress={() => setShowErrorModal(false)}
                        >
                            <MaterialIcons name="close" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                        
                        <View style={[
                            styles.errorModalIcon,
                            errorType === 'NO_CAT_DETECTED' ? styles.errorModalIconNoCat : styles.errorModalIconPosition
                        ]}>
                            <MaterialIcons 
                                name={errorType === 'NO_CAT_DETECTED' ? 'pets' : 'camera-alt'} 
                                size={40} 
                                color={errorType === 'NO_CAT_DETECTED' ? '#EF4444' : '#F59E0B'} 
                            />
                        </View>
                        
                        <Text style={styles.errorModalTitle}>
                            {errorType === 'NO_CAT_DETECTED' ? 'No Cat Detected' : 'Cat Position Issue'}
                        </Text>
                        
                        <Text style={styles.errorModalMessage}>
                            {errorMessage}
                        </Text>
                        
                        <Text style={styles.errorModalGuidance}>
                            {errorGuidance}
                        </Text>
                        
                        <TouchableOpacity 
                            style={styles.errorModalButton}
                            onPress={() => setShowErrorModal(false)}
                        >
                            <Text style={styles.errorModalButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <Text style={styles.headerTitle}>Pain Assessment Results</Text>
                        <Text style={styles.headerSubtitle}>AI analysis completed successfully</Text>
                    </View>

                    {/* Picture with Dots */}
                    {capturedImage && (
                        <View style={styles.imageSection}>
                            <VisualLandmarks 
                                imageUri={capturedImage}
                                landmarks={visualLandmarks || {}}
                                fgsBreakdown={fgsBreakdown}
                            />
                        </View>
                    )}

                    {/* Pain Level */}
                    <View style={[
                        styles.painLevelCard,
                        {
                            backgroundColor: painStyling.containerColor,
                            borderColor: painStyling.borderColor,
                        }
                    ]}>
                        <View style={styles.painLevelRow}>
                            <Text style={styles.painLevelLabel}>Pain Level:</Text>
                            <Text style={[
                                styles.painLevelValue,
                                { color: painStyling.textColor }
                            ]}>{normalizedPainLevel}</Text>
                        </View>
                        <View style={[styles.resultsCardGradient, { backgroundColor: painStyling.textColor }]} />
                    </View>

                    {/* Recommendations */}
                    {actionableAdvice ? (
                        <View style={styles.comprehensiveSection}>
                            <Text style={styles.comprehensiveTitle}>💡 Recommendations</Text>
                            
                            {actionableAdvice.immediate_actions && (
                                <View style={styles.adviceItem}>
                                    <View style={styles.adviceHeader}>
                                        <MaterialIcons name="flash-on" size={20} color="#045b26" />
                                        <Text style={[styles.adviceLabel, { color: '#045b26' }]}>Immediate Actions</Text>
                                    </View>
                                    <View style={styles.adviceList}>
                                        {actionableAdvice.immediate_actions.map((action: string, index: number) => (
                                            <View key={index} style={styles.adviceListItemContainer}>
                                                <MaterialIcons name="check-circle" size={16} color="#045b26" />
                                                <Text style={styles.adviceListItem}>{action}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                            
                            {actionableAdvice.monitoring_guidelines && (
                                <View style={styles.adviceItem}>
                                    <View style={styles.adviceHeader}>
                                        <MaterialIcons name="visibility" size={20} color="#045b26" />
                                        <Text style={[styles.adviceLabel, { color: '#045b26' }]}>Monitoring Guidelines</Text>
                                    </View>
                                    <Text style={styles.adviceText}>{actionableAdvice.monitoring_guidelines}</Text>
                                </View>
                            )}
                            
                            {actionableAdvice.when_to_contact_vet && (
                                <View style={styles.adviceItem}>
                                    <View style={styles.adviceHeader}>
                                        <MaterialIcons name="local-hospital" size={20} color="#045b26" />
                                        <Text style={[styles.adviceLabel, { color: '#045b26' }]}>When to Contact Vet</Text>
                                    </View>
                                    <Text style={styles.adviceText}>{actionableAdvice.when_to_contact_vet}</Text>
                                </View>
                            )}
                            
                            {actionableAdvice.home_care_tips && (
                                <View style={styles.adviceItem}>
                                    <View style={styles.adviceHeader}>
                                        <MaterialIcons name="home" size={20} color="#045b26" />
                                        <Text style={[styles.adviceLabel, { color: '#045b26' }]}>Home Care Tips</Text>
                                    </View>
                                    <View style={styles.adviceList}>
                                        {actionableAdvice.home_care_tips.map((tip: string, index: number) => (
                                            <View key={index} style={styles.adviceListItemContainer}>
                                                <MaterialIcons name="star" size={16} color="#045b26" />
                                                <Text style={styles.adviceListItem}>{tip}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.comprehensiveSection}>
                            <Text style={styles.comprehensiveTitle}>💡 Recommendations</Text>
                            <Text style={styles.recommendationsText}>{recommendations}</Text>
                        </View>
                    )}

                    {/* Disclaimer */}
                    <View style={styles.disclaimerCard}>
                        <Text style={styles.disclaimerTitle}>⚠️ Medical Disclaimer</Text>
                        <Text style={styles.disclaimerText}>
                            This AI assessment is for informational purposes only and should not replace professional veterinary consultation. 
                            Always consult with a qualified veterinarian for accurate diagnosis and treatment recommendations.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity 
                            style={styles.primaryButton} 
                            onPress={onTakeAnotherPicture || (() => onHome?.())}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.primaryButtonText}>Take Another Picture</Text>
                        </TouchableOpacity>
                        
                        {petRegistered === 'yes' && !isSaved && (
                            <>
                                <Text style={[styles.disclaimerText, { marginBottom: 8, fontSize: 13, color: '#666', textAlign: 'center' }]}>
                                    Note: If you want to ask for second opinion, save the assessment and set an appointment with San Pedro City Vet Office.
                                </Text>
                                <TouchableOpacity 
                                    style={styles.secondaryButton} 
                                    onPress={() => handleSaveChoice('yes')}
                                    disabled={isSaving}
                                    activeOpacity={0.9}
                                >
                                    {isSaving ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            <ActivityIndicator size="small" color="#6B7280" style={{ marginRight: 8 }} />
                                            <Text style={styles.secondaryButtonText}>Saving Assessment...</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.secondaryButtonText}>Save Assessment</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                        
                        {(petRegistered === 'yes' && isSaved) || petRegistered !== 'yes' ? (
                            <TouchableOpacity 
                                style={styles.secondaryButton} 
                                onPress={onSecondOpinionAppointment || onSecondOpinion}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.secondaryButtonText}>Get Second Opinion</Text>
                            </TouchableOpacity>
                        ) : null}
                        
                        <TouchableOpacity 
                            style={styles.secondaryButton} 
                            onPress={handleHome}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.secondaryButtonText}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 