import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#f0f8f0',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalTitleUnderline: {
        height: 3,
        backgroundColor: '#045b26',
        marginBottom: 24,
        borderRadius: 2,
    },
    modalField: {
        backgroundColor: '#d0e6d0',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    modalFieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    modalFieldValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    modalSubField: {
        marginTop: 8,
        paddingLeft: 16,
    },
    modalSubFieldLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#666',
        marginBottom: 4,
    },
    modalSubFieldValue: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    cancelButton: {
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
    },
});

interface MedicalVisitDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    medicalVisitData: {
        petName: string;
        age: string;
        dateOfBirth: string;
        gender: string;
        reasonForVisit: string;
        dateVisited: string;
        dateOfNextVisit: string;
        proceduresDone: string;
        findings: string;
        recommendations: string;
        medications: string;
        vaccineUsed: string;
    };
}

export default function MedicalVisitDetailsModal({ 
    visible, 
    onClose, 
    medicalVisitData 
}: MedicalVisitDetailsModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalTitle}>Medical Visit Details</Text>
                        <View style={styles.modalTitleUnderline} />
                        
                        {/* Visit Details */}
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Reason for Visit:</Text>
                            <Text style={styles.modalFieldValue}>{medicalVisitData.reasonForVisit}</Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Date Visited:</Text>
                            <Text style={styles.modalFieldValue}>{medicalVisitData.dateVisited}</Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Date of Next Visit:</Text>
                            <Text style={styles.modalFieldValue}>{medicalVisitData.dateOfNextVisit}</Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Procedures Done:</Text>
                            <Text style={styles.modalFieldValue}>{medicalVisitData.proceduresDone}</Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Findings:</Text>
                            <Text style={styles.modalFieldValue}>{medicalVisitData.findings}</Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Recommendations:</Text>
                            <Text style={styles.modalFieldValue}>{medicalVisitData.recommendations}</Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Medication/s:</Text>
                            <Text style={styles.modalFieldValue}>{medicalVisitData.medications}</Text>
                            <View style={styles.modalSubField}>
                                <Text style={styles.modalSubFieldLabel}>Vaccine/ Medicine Used:</Text>
                                <Text style={styles.modalSubFieldValue}>{medicalVisitData.vaccineUsed}</Text>
                            </View>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => {
                                onClose();
                                // Add any additional logic here
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
} 