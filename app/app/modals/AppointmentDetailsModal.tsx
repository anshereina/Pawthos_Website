import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PetData, getPetById } from '../../utils/pets.utils';
import { formatAppointmentDate, formatAppointmentTime } from '../../utils/appointments.utils';

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
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#045b26',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

interface AppointmentDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    appointmentData: {
        id: number;
        pet_id?: number;
        user_id?: number;
        type: string;
        date: string;
        time: string;
        veterinarian?: string;
        notes?: string;
        location?: string;
        status: string;
        created_at: string;
        updated_at?: string;
    };
}

export default function AppointmentDetailsModal({ 
    visible, 
    onClose, 
    appointmentData 
}: AppointmentDetailsModalProps) {
    const [petData, setPetData] = useState<PetData | null>(null);
    const [loadingPet, setLoadingPet] = useState(false);

    useEffect(() => {
        if (visible && appointmentData.pet_id) {
            loadPetData();
        }
    }, [visible, appointmentData.pet_id]);

    const loadPetData = async () => {
        if (!appointmentData.pet_id) return;
        
        setLoadingPet(true);
        try {
            const result = await getPetById(appointmentData.pet_id);
            if (result.success && result.data) {
                setPetData(Array.isArray(result.data) ? result.data[0] : result.data);
            }
        } catch (error) {
            console.error('Error loading pet data:', error);
        } finally {
            setLoadingPet(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
            case 'scheduled':
                return '#045b26';
            case 'completed':
                return '#28a745';
            case 'cancelled':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const calculateAge = (dateOfBirth: string) => {
        if (!dateOfBirth) return 'Unknown';
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        const ageInYears = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return `${ageInYears - 1} years`;
        }
        return `${ageInYears} years`;
    };

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
                        <Text style={styles.modalTitle}>Appointment Update</Text>
                        <View style={styles.modalTitleUnderline} />
                        
                        {/* Appointment Information */}
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Date:</Text>
                            <Text style={styles.modalFieldValue}>{formatAppointmentDate(appointmentData.date)}</Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Time:</Text>
                            <Text style={styles.modalFieldValue}>{formatAppointmentTime(appointmentData.time)}</Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Type of Appointment:</Text>
                            <Text style={styles.modalFieldValue}>{appointmentData.type}</Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Status:</Text>
                            <View style={styles.statusContainer}>
                                <Text style={styles.modalFieldValue}>{appointmentData.status.toLowerCase() === 'scheduled' ? 'To be Approved' : appointmentData.status}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointmentData.status) }]}>
                                    <Text style={styles.statusText}>{appointmentData.status.toLowerCase() === 'scheduled' ? 'To be Approved' : appointmentData.status}</Text>
                                </View>
                            </View>
                        </View>
                        
                        {/* Message / Remarks from website */}
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Message / Remarks:</Text>
                            <Text style={styles.modalFieldValue}>
                                {appointmentData.notes && appointmentData.notes.trim().length > 0 
                                    ? appointmentData.notes 
                                    : 'No remarks yet.'}
                            </Text>
                        </View>
                        
                        <View style={styles.modalField}>
                            <Text style={styles.modalFieldLabel}>Veterinarian:</Text>
                            <Text style={styles.modalFieldValue}>Dr. Ma Fe Templado</Text>
                        </View>
                        
                        {/* Pet Information */}
                        {loadingPet ? (
                            <View style={styles.modalField}>
                                <Text style={styles.modalFieldLabel}>Pet Information:</Text>
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#045b26" />
                                    <Text style={styles.modalFieldValue}>Loading pet details...</Text>
                                </View>
                            </View>
                        ) : petData ? (
                            <>
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Pet Name:</Text>
                                    <Text style={styles.modalFieldValue}>{petData.name}</Text>
                                </View>
                                
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Pet ID:</Text>
                                    <Text style={styles.modalFieldValue}>{petData.pet_id}</Text>
                                </View>
                                
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Species:</Text>
                                    <Text style={styles.modalFieldValue}>{petData.species}</Text>
                                </View>
                                
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Age:</Text>
                                    <Text style={styles.modalFieldValue}>{calculateAge(petData.date_of_birth || '')}</Text>
                                </View>
                                
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Date of Birth:</Text>
                                    <Text style={styles.modalFieldValue}>
                                        {petData.date_of_birth ? formatAppointmentDate(petData.date_of_birth) : 'Not specified'}
                                    </Text>
                                </View>
                                
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Gender:</Text>
                                    <Text style={styles.modalFieldValue}>{petData.gender || 'Not specified'}</Text>
                                </View>
                                
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Reproductive Status:</Text>
                                    <Text style={styles.modalFieldValue}>{petData.reproductive_status || 'Not specified'}</Text>
                                </View>
                                
                                {petData.breed && (
                                    <View style={styles.modalField}>
                                        <Text style={styles.modalFieldLabel}>Breed:</Text>
                                        <Text style={styles.modalFieldValue}>{petData.breed}</Text>
                                    </View>
                                )}
                                
                                {petData.color && (
                                    <View style={styles.modalField}>
                                        <Text style={styles.modalFieldLabel}>Color:</Text>
                                        <Text style={styles.modalFieldValue}>{petData.color}</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.modalField}>
                                <Text style={styles.modalFieldLabel}>Pet Information:</Text>
                                <Text style={styles.modalFieldValue}>Pet information not available</Text>
                            </View>
                        )}
                        
                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => {
                                onClose();
                                // Add cancel appointment logic here
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
} 