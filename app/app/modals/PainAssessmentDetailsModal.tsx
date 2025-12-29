import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PainAssessmentRecord, formatAssessmentDate, derivePainLevelLabel } from '../../utils/painAssessments.utils';
import { API_BASE_URL } from '../../utils/config';

interface PainAssessmentDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    record: PainAssessmentRecord | null;
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
        maxHeight: '80%',
        width: '90%',
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    modalScrollView: {
        maxHeight: '85%',
        paddingTop: 0,
        marginTop: -8,
    },
    questionContainer: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#045b26',
    },
    questionText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
        lineHeight: 20,
    },
    answerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#045b26',
    },
    assessmentInfo: {
        marginBottom: 16,
        padding: 14,
        backgroundColor: '#A1D998',
        borderRadius: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#045b26',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
    },
    painLevel0: {
        color: '#4CAF50', // Green for no pain
    },
    painLevel1: {
        color: '#FF9800', // Orange for mild pain
    },
    painLevel2: {
        color: '#F44336', // Red for severe pain
    },
    painLevel3: {
        color: '#FF7043', // Deep orange for moderate to severe
    },
    painLevel4: {
        color: '#F44336', // Red for severe
    },
    painLevel5: {
        color: '#B71C1C', // Dark red for worst pain possible
    },
    imageSection: {
        marginBottom: 16,
    },
    imageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    assessmentImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
});

// Pain assessment questions
const painAssessmentQuestions = [
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
    'Stopped grooming completely or certain areas'
];

const getPainLevelColorStyle = (painLevel?: string) => {
    const level = (painLevel || '').toLowerCase();
    if (level.includes('level 0') || level.includes('no pain')) {
        return styles.painLevel0;
    } else if (level.includes('level 1') || level.includes('mild')) {
        return styles.painLevel1;
    } else if (level.includes('level 2') || level.includes('moderate pain')) {
        return styles.painLevel2;
    } else if (level.includes('level 3') || level.includes('moderate to severe')) {
        return styles.painLevel3;
    } else if (level.includes('level 4') || level.includes('severe')) {
        return styles.painLevel4;
    } else if (level.includes('level 5') || level.includes('worst')) {
        return styles.painLevel5;
    }
    return {};
};

export default function PainAssessmentDetailsModal({ visible, onClose, record }: PainAssessmentDetailsModalProps) {
    const buildImageUrl = (url?: string | null) => {
        if (!url) return null;
        if (url.startsWith('file://')) return 'local-file';
        if (url.startsWith('http')) return url;
        const base = (API_BASE_URL || '').replace(/\/+$/, '');
        return `${base}${url}`;
    };
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Pain Assessment Details</Text>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={styles.modalScrollView} 
                        contentContainerStyle={{ paddingTop: 0 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {record && (
                            <>


                                {/* Assessment Information */}
                                <View style={styles.assessmentInfo}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Pet Name:</Text>
                                        <Text style={styles.infoValue}>{record.pet_name}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Pet Type:</Text>
                                        <Text style={styles.infoValue}>{record.pet_type}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Pain Level:</Text>
                                        <Text style={[styles.infoValue, getPainLevelColorStyle(record.pain_level)]}>
                                            {derivePainLevelLabel({ pain_level: record.pain_level, pain_score: record.pain_score })}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Assessment Date:</Text>
                                        <Text style={styles.infoValue}>{formatAssessmentDate(record.assessment_date)}</Text>
                                    </View>
                                </View>

                                {/* Assessment Image */}
                                {record.image_url && (
                                    <View style={styles.imageSection}>
                                        <Text style={[styles.modalTitle, { marginBottom: 12, fontSize: 18 }]}>Assessment Photo</Text>
                                        <View style={styles.imageContainer}>
                                            <Image
                                                source={{ uri: buildImageUrl(record.image_url) }}
                                                style={styles.assessmentImage}
                                                resizeMode="cover"
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* Questions and Answers */}
                                <Text style={[styles.modalTitle, { marginBottom: 12, fontSize: 18 }]}>Assessment Questions & Answers</Text>
                                
                                {painAssessmentQuestions.map((question, index) => {
                                    // Parse the assessment answers if available
                                    let answer = 'Not answered';
                                    
                                    // Debug logging for first question only
                                    if (index === 0) {
                                        console.log('=== DEBUG ASSESSMENT DATA ===');
                                        console.log('Record:', record);
                                        console.log('Assessment answers:', (record as any).assessment_answers);
                                        console.log('Basic answers:', (record as any).basic_answers);
                                    }
                                    
                                    // Try to get answers from assessment_answers first (like in the React example)
                                    if ((record as any).assessment_answers) {
                                        try {
                                            const answers = JSON.parse((record as any).assessment_answers);
                                            if (Array.isArray(answers) && answers[index] !== undefined) {
                                                answer = answers[index];
                                            } else if (typeof answers === 'object' && answers[question] !== undefined) {
                                                answer = answers[question];
                                            }
                                        } catch (e) {
                                            console.log('Error parsing assessment_answers:', e);
                                        }
                                    }
                                    
                                    // Fallback to basic_answers if assessment_answers didn't work
                                    if (answer === 'Not answered' && (record as any).basic_answers) {
                                        try {
                                            const answers = JSON.parse((record as any).basic_answers);
                                            if (Array.isArray(answers) && answers[index] !== undefined) {
                                                answer = answers[index];
                                            } else if (typeof answers === 'object' && answers[question] !== undefined) {
                                                answer = answers[question];
                                            }
                                        } catch (e) {
                                            console.log('Error parsing basic_answers:', e);
                                        }
                                    }
                                    
                                    // Convert boolean values to Yes/No
                                    if (answer === true) {
                                        answer = 'Yes';
                                    } else if (answer === false) {
                                        answer = 'No';
                                    } else if (String(answer) === 'true') {
                                        answer = 'Yes';
                                    } else if (String(answer) === 'false') {
                                        answer = 'No';
                                    }
                                    
                                    // Debug when answer is found
                                    if (index === 0) {
                                        console.log(`Question ${index + 1} final answer:`, answer);
                                    }
                                    
                                    return (
                                        <View key={index} style={styles.questionContainer}>
                                            <Text style={styles.questionText}>
                                                {index + 1}. {question}
                                            </Text>
                                            <Text style={styles.answerText}>
                                                Answer: {answer}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
