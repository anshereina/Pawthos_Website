import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 20,
        maxWidth: 320,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    errorIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    closeButton: {
        backgroundColor: '#d32f2f',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 100,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

interface ErrorModalProps {
    visible: boolean;
    message: string;
    onClose: () => void;
}

export default function ErrorModal({ 
    visible, 
    message, 
    onClose 
}: ErrorModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <MaterialIcons 
                        name="error-outline" 
                        size={48} 
                        color="#d32f2f" 
                        style={styles.errorIcon}
                    />
                    
                    <Text style={styles.modalTitle}>Error</Text>
                    
                    <Text style={styles.modalMessage}>
                        {message}
                    </Text>
                    
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
