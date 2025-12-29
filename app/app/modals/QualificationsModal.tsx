import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
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
        maxHeight: '90%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#045b26',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalQualificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    modalQualificationNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        marginRight: 12,
        minWidth: 24,
    },
    modalQualificationText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
    modalSubPoint: {
        fontSize: 14,
        color: '#666',
        marginLeft: 36,
        marginTop: 4,
        fontStyle: 'italic',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
    },
});

interface QualificationsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function QualificationsModal({ 
    visible, 
    onClose 
}: QualificationsModalProps) {
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
                    
                    {/* Modal Handle */}
                    <View style={styles.modalHandle} />
                    
                    {/* Modal Content */}
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Qualifications</Text>
                        
                        <View style={styles.modalQualificationItem}>
                            <Text style={styles.modalQualificationNumber}>1.</Text>
                            <Text style={styles.modalQualificationText}>Pet must be at least 3½ months old</Text>
                        </View>
                        
                        <View style={styles.modalQualificationItem}>
                            <Text style={styles.modalQualificationNumber}>2.</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalQualificationText}>Rabies vaccination must be done:</Text>
                                <Text style={styles.modalSubPoint}>At least 14 days before travel, OR</Text>
                                <Text style={styles.modalSubPoint}>More than 1 year before the travel date</Text>
                            </View>
                        </View>
                        
                        <View style={styles.modalQualificationItem}>
                            <Text style={styles.modalQualificationNumber}>3.</Text>
                            <Text style={styles.modalQualificationText}>Only 1 VHC, 1 Destination, and 1 Shipping Permit per policy</Text>
                        </View>
                        
                        <View style={styles.modalQualificationItem}>
                            <Text style={styles.modalQualificationNumber}>4.</Text>
                            <Text style={styles.modalQualificationText}>If bringing more than 1 pet (dog/cat), list all pets with their full details in one application</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
} 