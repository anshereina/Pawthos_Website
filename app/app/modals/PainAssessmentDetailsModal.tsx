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

// Pain assessment questions (Feline)
const painAssessmentQuestions = [
    'Reluctance to jump onto counters or furniture (does it less)',
    'Difficulty jumping up or down from counters or furniture (falls or seems clumsy)',
    'Difficulty or avoids going up or down stairs',
    'Less playful',
    'Restlessness or difficulty finding a comfortable position',
    'Vocalizing (purring, or hissing) when touched or moving)',
    'Decreased appetite',
    'Less desire to interact with people or animals (hiding, resisting being pet, brushed, held, or picked up)',
    'Excessive licking, biting or scratching a body part',
    'Sleeping in an unusual position or unusual location',
    'Unusual aggression when approached or touched (biting, hissing, ears pinned back)',
    'Changes in eye expression (staring, enlarged pupils, vacant look, or squinting)',
    'Stopped using or has difficulty getting in or out of litter box',
    'Stopped grooming completely or certain areas'
];

// BEAP categories (Canine) - BluePearl Pet Hospice Pain Scale
const beaapCategories = [
    'Breathing',
    'Eyes',
    'Ambulation',
    'Activity',
    'Appetite',
    'Attitude',
    'Posture',
    'Palpation'
];

// BEAP category descriptions
const beaapCategoryDescriptions: { [key: number]: string[] } = {
    0: [ // Breathing
        'Breathing calmly at rest',
        'Breathing normally during activity',
        'May sometimes have trouble catching their breath',
        'Often breathes heavily and may need extra effort to breathe',
        'Breathing is fast and often looks harder than normal, with frequent panting',
        'Panting with faster and more difficult breathing'
    ],
    1: [ // Eyes
        'Eyes bright and alert',
        'Eyes bright and alert',
        'Eyes slightly more dull in appearance; can have a slightly furrowed brow',
        'Dull eyes; worried look',
        'Dull eyes; seems distant or unfocused',
        'Dull eyes; have a pained look'
    ],
    2: [ // Ambulation
        'Moves normally on all four legs with no difficulty or discomfort',
        'Walks normally; may show slight discomfort',
        'Noticeably slower to lie down or rise up; may exhibit "lameness" when walking',
        'Very slow to rise up and lie down; hesitation with movement; difficulty on stairs; reluctant to turn corners; stiff to start out; may be limping',
        'Obvious difficulty rising up or lying down; will not bear weight on affected leg; avoids stairs; obvious lameness',
        'May refuse to get up; may not be able to or willing to take more than a few steps; will not bear weight on affected limb'
    ],
    3: [ // Activity
        'Engages in play and all normal activities',
        'May be slightly slower to lie down or get up',
        'May be a bit restless, having trouble getting comfortable and shifting weight',
        'Do not want to interact but may be in a room with a family member; obvious lameness when walking; may lick painful area',
        'Avoids interaction with family or environment; unwilling to get up or move; may frequently lick a painful area',
        'Difficulty in being distracted from pain, even with gentle touch or something familiar'
    ],
    4: [ // Appetite
        'Eating and drinking normally',
        'Eating and drinking normally',
        'Picky eater; may only want treats or human food',
        'Frequently not interested in eating',
        'Loss of appetite; may not want to drink',
        'No interest in food or water'
    ],
    5: [ // Attitude
        'Happy; interested in surroundings and playing; seeks attention',
        'Happy and alert, though sometimes a bit quiet; overall behaves normally',
        'Less lively; doesn\'t initiate play',
        'Feels unsettled and can\'t sleep well',
        'Scared, anxious, and may act aggressive',
        'Extremely low energy; lying motionless and clearly in pain'
    ],
    6: [ // Posture
        'Comfortable at rest and during play; ears up and wagging tail',
        'May show occasional shifting of position; tail may be down just a little more; ears slightly flatter',
        'Difficulty squatting or lifting leg to urinate; subtle changes in position; tail more tucked and ears more flattened',
        'Abnormal weight distribution when standing; difficulty posturing to urinate; arched back; tucked belly; head hanging low; tucked tail',
        'Tail tucked; ears flattened or pinned back; abnormal posture when standing; may refuse to move or stand',
        'Refuses to lay down or rest on side at all; pained ears; may prefer to be very tucked up or stretched out'
    ],
    7: [ // Palpation
        'Enjoys being touched and petted; no body tension present',
        'Enjoys being touched and petted; no body tension present',
        'Does not mind touch except on painful area; turns head to look where touched; mild body tension',
        'Withdraws from people; may not want to be touched; Pulls away from a hand when touched; moderate body tension when being touched',
        'Significant body tension when painful area is touched; may vocalize in pain; guards a painful area by pulling away in a dramatic manner',
        'Severe body tension when touched; will not tolerate touch of painful area; becomes fearful when other areas that are not painful are touched'
    ]
};

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
        const trimmed = url.trim();
        if (trimmed.startsWith('file://')) return trimmed; // use local file path directly
        if (trimmed.startsWith('http')) return trimmed;
        // Normalize API base (strip trailing slashes and optional /api) then join with leading slash
        const base = (API_BASE_URL || '')
            .replace(/\/+$/, '')
            .replace(/\/api$/, '');
        const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return `${base}${normalizedPath}`;
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
                                {record.image_url && buildImageUrl(record.image_url) && (
                                    <View style={styles.imageSection}>
                                        <Text style={[styles.modalTitle, { marginBottom: 12, fontSize: 18 }]}>Assessment Photo</Text>
                                        <View style={styles.imageContainer}>
                                            <Image
                                                source={{ uri: buildImageUrl(record.image_url) }}
                                                style={styles.assessmentImage}
                                                resizeMode="cover"
                                                onError={(error) => {
                                                    console.log('Failed to load assessment image:', error);
                                                    console.log('Image URL:', buildImageUrl(record.image_url));
                                                }}
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* Questions and Answers */}
                                <Text style={[styles.modalTitle, { marginBottom: 12, fontSize: 18 }]}>Assessment Questions & Answers</Text>
                                
                                {(() => {
                                    // Check if this is a canine assessment with BEAP answers
                                    const petType = (record.pet_type || '').toLowerCase();
                                    const isCanine = petType === 'dog' || petType === 'canine';
                                    
                                    let beaapAnswers: number[][] | null = null;
                                    
                                    if (isCanine && (record as any).assessment_answers) {
                                        try {
                                            const parsed = JSON.parse((record as any).assessment_answers);
                                            if (parsed.beaap_answers && Array.isArray(parsed.beaap_answers)) {
                                                beaapAnswers = parsed.beaap_answers;
                                            }
                                        } catch (e) {
                                            console.log('Error parsing BEAP answers:', e);
                                        }
                                    }
                                    
                                    // Display BEAP categories for canine assessments
                                    if (isCanine && beaapAnswers) {
                                        return beaapCategories.map((category, categoryIndex) => {
                                            const selectedIndices = beaapAnswers![categoryIndex] || [];
                                            let answerText = 'Not answered';
                                            
                                            if (selectedIndices.length > 0) {
                                                const descriptions = selectedIndices.map((imageIndex: number) => {
                                                    return beaapCategoryDescriptions[categoryIndex]?.[imageIndex] || `Selected image ${imageIndex + 1}`;
                                                });
                                                answerText = descriptions.join('; ');
                                            }
                                            
                                            return (
                                                <View key={categoryIndex} style={styles.questionContainer}>
                                                    <Text style={styles.questionText}>
                                                        {categoryIndex + 1}. {category}
                                                    </Text>
                                                    <Text style={styles.answerText}>
                                                        Answer: {answerText}
                                                    </Text>
                                                </View>
                                            );
                                        });
                                    }
                                    
                                    // Display feline questions for other assessments
                                    return painAssessmentQuestions.map((question, index) => {
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
                                    });
                                })()}
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
