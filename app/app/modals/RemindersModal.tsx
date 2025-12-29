import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

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
        marginBottom: 24,
    },
    reminderSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionIcon: {
        marginRight: 8,
    },
    reminderItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    reminderBullet: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        marginRight: 8,
        minWidth: 20,
    },
    reminderText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
    processItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    processNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#045b26',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    processNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    processText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    validityHighlight: {
        backgroundColor: '#e8f5e8',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#045b26',
    },
    validityText: {
        fontSize: 16,
        color: '#045b26',
        fontWeight: '600',
        textAlign: 'center',
    },
    officeSection: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    officeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    officeText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
    },
});

interface RemindersModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function RemindersModal({ 
    visible, 
    onClose 
}: RemindersModalProps) {
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
                    <ScrollView style={styles.modalContent}>
                        {/* Modal Title */}
                        <Text style={styles.modalTitle}>Reminders</Text>
                        
                        {/* Application Timeline Section */}
                        <View style={styles.reminderSection}>
                            <View style={styles.sectionTitle}>
                                <MaterialIcons name="schedule" size={20} color="#045b26" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>Application Timeline</Text>
                            </View>
                            
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderBullet}>•</Text>
                                <Text style={styles.reminderText}>Apply 3-5 days before travel (excluding weekends and holidays)</Text>
                            </View>
                            
                            <View style={styles.reminderItem}>
                                <Text style={styles.reminderBullet}>•</Text>
                                <Text style={styles.reminderText}>Application is processed within 3 working days after submission</Text>
                            </View>
                        </View>
                        
                        {/* Process Section */}
                        <View style={styles.reminderSection}>
                            <View style={styles.sectionTitle}>
                                <MaterialIcons name="list-alt" size={20} color="#045b26" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>Process</Text>
                            </View>
                            
                            <View style={styles.processItem}>
                                <View style={styles.processNumber}>
                                    <Text style={styles.processNumberText}>1</Text>
                                </View>
                                <Text style={styles.processText}>Online Application</Text>
                            </View>
                            
                            <View style={styles.processItem}>
                                <View style={styles.processNumber}>
                                    <Text style={styles.processNumberText}>2</Text>
                                </View>
                                <Text style={styles.processText}>Receipt and Review</Text>
                            </View>
                            
                            <View style={styles.processItem}>
                                <View style={styles.processNumber}>
                                    <Text style={styles.processNumberText}>3</Text>
                                </View>
                                <Text style={styles.processText}>Results</Text>
                            </View>
                        </View>
                        
                        {/* Permit Validity Section */}
                        <View style={styles.reminderSection}>
                            <View style={styles.sectionTitle}>
                                <MaterialIcons name="verified" size={20} color="#045b26" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>Permit Validity</Text>
                            </View>
                            
                            <View style={styles.validityHighlight}>
                                <Text style={styles.validityText}>Valid for 7 days</Text>
                            </View>
                        </View>
                        
                        {/* Processing Office Section */}
                        <View style={styles.reminderSection}>
                            <View style={styles.sectionTitle}>
                                <MaterialIcons name="business" size={20} color="#045b26" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>Processing Office</Text>
                            </View>
                            
                            <View style={styles.officeSection}>
                                <Text style={styles.officeTitle}>BAI - National Veterinary Quarantine Services Division</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
} 