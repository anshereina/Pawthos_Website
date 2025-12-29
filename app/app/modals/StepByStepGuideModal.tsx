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
    section: {
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
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        marginRight: 8,
        minWidth: 20,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        lineHeight: 22,
    },
    subItem: {
        marginLeft: 28,
        marginBottom: 4,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
    },
});

interface StepByStepGuideModalProps {
    visible: boolean;
    onClose: () => void;
}

const StepByStepGuideModal: React.FC<StepByStepGuideModalProps> = ({ visible, onClose }) => {
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
                    <View style={styles.modalHandle} />
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Local Shipment of Dogs and Cats: Step-by-Step Guide</Text>
                        {/* Section 1: Veterinary Health Certificate */}
                        <View style={styles.section}>
                            <View style={styles.sectionTitle}>
                                <FontAwesome5 name="file-medical" size={20} color="#045b26" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>1. Veterinary Health Certificate (VHC)</Text>
                            </View>
                            <View style={styles.itemRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.itemText}>Obtain from a government or private veterinarian.</Text>
                            </View>
                            <View style={styles.itemRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.itemText}>Valid for only three days after issuance.</Text>
                            </View>
                            <View style={styles.itemRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.itemText}>Apply for the shipping permit within this three-day validity period.</Text>
                            </View>
                        </View>
                        {/* Section 2: Animal Pet Vaccination Records */}
                        <View style={styles.section}>
                            <View style={styles.sectionTitle}>
                                <FontAwesome5 name="syringe" size={20} color="#045b26" style={styles.sectionIcon} />
                                <Text style={styles.sectionTitle}>2. Animal Pet Vaccination Records</Text>
                            </View>
                            <View style={styles.itemRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.itemText}>Must have a complete vaccination record for your pet, including:</Text>
                            </View>
                            <View style={styles.subItem}>
                                <Text style={[styles.itemText, {fontWeight: 'bold'}]}>Pet Details:</Text>
                                <Text style={styles.itemText}>- Name</Text>
                                <Text style={styles.itemText}>- Breed</Text>
                                <Text style={styles.itemText}>- Sex</Text>
                                <Text style={styles.itemText}>- Age/Birthdate</Text>
                                <Text style={styles.itemText}>- Marking</Text>
                                <Text style={styles.itemText}>- Name of the owner</Text>
                            </View>
                            <View style={styles.subItem}>
                                <Text style={[styles.itemText, {fontWeight: 'bold'}]}>Vaccination Details:</Text>
                                <Text style={styles.itemText}>- Vaccine name and date</Text>
                                <Text style={styles.itemText}>- Weight of the pet</Text>
                                <Text style={styles.itemText}>- Vaccine sticker or rabies vaccine used</Text>
                                <Text style={styles.itemText}>- Manufacturer</Text>
                                <Text style={styles.itemText}>- Lot and serial number</Text>
                            </View>
                            <View style={styles.subItem}>
                                <Text style={[styles.itemText, {fontWeight: 'bold'}]}>Veterinarian's Information:</Text>
                                <Text style={styles.itemText}>- Signature</Text>
                                <Text style={styles.itemText}>- License number and date of expiry</Text>
                                <Text style={styles.itemText}>- TIN (Taxpayer Identification Number)</Text>
                                <Text style={styles.itemText}>- PTR (Professional Tax Receipt) number</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default StepByStepGuideModal; 