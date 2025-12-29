import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import QualificationsModal from '../modals/QualificationsModal';
import StepByStepGuideModal from '../modals/StepByStepGuideModal';
import RemindersModal from '../modals/RemindersModal';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f7f7f7' 
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#fff',
        elevation: 2,
    },
    title: { 
        fontSize: 25, 
        fontWeight: 'bold', 
        color: '#000',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    qualificationsSection: {
        backgroundColor: '#e0ffe6',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 16,
    },
    qualificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    qualificationNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        marginRight: 8,
        minWidth: 20,
    },
    qualificationText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
    subPoint: {
        fontSize: 14,
        color: '#666',
        marginLeft: 28,
        marginTop: 4,
        fontStyle: 'italic',
    },
    stepByStepSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        borderWidth: 2,
        borderColor: '#045b26',
    },
    stepByStepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    pawIcon: {
        marginRight: 12,
    },
    stepByStepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        flex: 1,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    pinIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    requirementText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
    reminderSection: {
        backgroundColor: '#e0ffe6',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
    },
    reminderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 16,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    timelineBullet: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        marginRight: 8,
        minWidth: 20,
    },
    timelineText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
    linksSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
    },
    linkTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 16,
    },
    onlineApplicationLink: {
        backgroundColor: '#045b26',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    onlineApplicationText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    permitTypesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    permitTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    permitTypeButton: {
        backgroundColor: '#e0ffe6',
        borderRadius: 8,
        padding: 6,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#045b26',
    },
    permitTypeText: {
        color: '#045b26',
        fontSize: 11,
        fontWeight: 'bold',
    },
});

export default function VetHealthPage({ onNavigate }: { onNavigate?: (page: string, appointmentType?: string) => void }) {
    const [qualificationsModalVisible, setQualificationsModalVisible] = useState(false);
    const [stepByStepModalVisible, setStepByStepModalVisible] = useState(false);
    const [remindersModalVisible, setRemindersModalVisible] = useState(false);

    const handleOnlineApplication = () => {
        Linking.openURL('https://bit.ly/registerdogcat');
    };

    const handleVetHealthCertificate = () => {
        if (onNavigate) {
            onNavigate('Appointment Scheduling', 'VetHealth');
        }
    };

    return (
        <View style={styles.container}>

            <ScrollView style={styles.content}>
                {/* Qualifications Section */}
                <TouchableOpacity 
                    style={styles.qualificationsSection}
                    onPress={() => setQualificationsModalVisible(true)}
                >
                    <Text style={styles.sectionTitle}>Qualifications</Text>
                    
                    <View style={styles.qualificationItem}>
                        <Text style={styles.qualificationNumber}>1.</Text>
                        <Text style={styles.qualificationText}>Pet must be at least 3½ months old</Text>
                    </View>
                    
                    <View style={styles.qualificationItem}>
                        <Text style={styles.qualificationNumber}>2.</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.qualificationText}>Rabies vaccination must be done:</Text>
                            <Text style={styles.subPoint}>At least 14 days before travel OR</Text>
                            <Text style={styles.subPoint}>Within the last 12 months</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Step-by-Step Guide Section */}
                <TouchableOpacity 
                    style={styles.stepByStepSection}
                    onPress={() => setStepByStepModalVisible(true)}
                >
                    <View style={styles.stepByStepHeader}>
                        <FontAwesome5 name="paw" size={20} color="#045b26" style={styles.pawIcon} />
                        <Text style={styles.stepByStepTitle}>Local Shipment of Dogs and Cats: Step-by-Step Guide</Text>
                    </View>
                    
                    <Text style={styles.requirementText}>Requirements:</Text>
                    
                    <View style={styles.requirementItem}>
                        <MaterialIcons name="push-pin" size={20} color="#ff0000" style={styles.pinIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.requirementText}>Veterinary Health Certificate (VHC)</Text>
                            <Text style={styles.subPoint}>Must be issued by a government-accredited veterinarian</Text>
                        </View>
                    </View>
                    
                    <View style={styles.requirementItem}>
                        <MaterialIcons name="push-pin" size={20} color="#ff0000" style={styles.pinIcon} />
                        <Text style={styles.requirementText}>Shipping Permit from Bureau of Animal Industry (BAI)</Text>
                    </View>
                    
                    <View style={styles.requirementItem}>
                        <MaterialIcons name="push-pin" size={20} color="#ff0000" style={styles.pinIcon} />
                        <Text style={styles.requirementText}>Valid ID of pet owner</Text>
                    </View>
                    
                    <View style={styles.requirementItem}>
                        <MaterialIcons name="push-pin" size={20} color="#ff0000" style={styles.pinIcon} />
                        <Text style={styles.requirementText}>Proof of rabies vaccination</Text>
                    </View>
                </TouchableOpacity>

                {/* Reminder Section */}
                <TouchableOpacity 
                    style={styles.reminderSection}
                    onPress={() => setRemindersModalVisible(true)}
                >
                    <Text style={styles.reminderTitle}>Reminder</Text>
                    
                    <Text style={styles.reminderTitle}>Application Timeline</Text>
                    
                    <View style={styles.timelineItem}>
                        <Text style={styles.timelineBullet}>•</Text>
                        <Text style={styles.timelineText}>Apply 3-5 days before travel (excluding weekends and holidays)</Text>
                    </View>
                    
                    <View style={styles.timelineItem}>
                        <Text style={styles.timelineBullet}>•</Text>
                        <Text style={styles.timelineText}>Application is processed within 3 working days after submission</Text>
                    </View>
                </TouchableOpacity>

                {/* Links and Actions Section */}
                <View style={styles.linksSection}>
                    <Text style={styles.linkTitle}>Online Application</Text>
                    
                    <TouchableOpacity 
                        style={styles.onlineApplicationLink}
                        onPress={handleOnlineApplication}
                    >
                        <Text style={styles.onlineApplicationText}>https://bit.ly/registerdogcat</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.permitTypesTitle}>Request your permits here:</Text>
                    
                    <View style={styles.permitTypeContainer}>
                        <TouchableOpacity 
                            style={styles.permitTypeButton}
                            onPress={handleVetHealthCertificate}
                        >
                            <Text style={styles.permitTypeText}>Vet Health Certificate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Modals */}
            <QualificationsModal 
                visible={qualificationsModalVisible}
                onClose={() => setQualificationsModalVisible(false)}
            />
            
            <StepByStepGuideModal 
                visible={stepByStepModalVisible}
                onClose={() => setStepByStepModalVisible(false)}
            />
            
            <RemindersModal 
                visible={remindersModalVisible}
                onClose={() => setRemindersModalVisible(false)}
            />
        </View>
    );
}
