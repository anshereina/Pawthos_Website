import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PetData } from '../../utils/pets.utils';

interface EditPetProfileModalProps {
    visible: boolean;
    onClose: () => void;
    petData: PetData | null;
    onSave: (updatedPetData: Partial<PetData>) => Promise<void>;
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
        padding: 24,
        width: '90%',
        height: '85%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
    },
    closeButton: {
        padding: 4,
    },
    formContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'red',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    inputError: {
        borderColor: '#ff6b6b',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 12,
        marginTop: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    pickerText: {
        fontSize: 16,
        color: '#333',
    },
    pickerPlaceholder: {
        fontSize: 16,
        color: '#999',
    },
    pickerOptions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        zIndex: 1000,
        elevation: 5,
    },
    pickerOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    pickerOptionText: {
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingVertical: 14,
        marginRight: 8,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingVertical: 14,
        marginLeft: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
});

export default function EditPetProfileModal({
    visible,
    onClose,
    petData,
    onSave
}: EditPetProfileModalProps) {
    const [formData, setFormData] = useState<Partial<PetData>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [showSpeciesPicker, setShowSpeciesPicker] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);

    const speciesOptions = ['Dog', 'Cat'];
    const genderOptions = ['male', 'female'];

    useEffect(() => {
        console.log('=== EDIT MODAL DEBUG ===');
        console.log('Modal visible:', visible);
        console.log('Pet data received:', petData);
        
        if (visible && petData) {
            const initialData = {
                name: petData.name || '',
                species: petData.species || '',
                breed: petData.breed || '',
                color: petData.color || '',
                gender: petData.gender || '',
                date_of_birth: petData.date_of_birth || '',
                owner_birthday: petData.owner_birthday || '',
            };
            console.log('Setting form data:', initialData);
            setFormData(initialData);
            setErrors({});
        }
    }, [visible, petData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Pet name is required';
        } else if (!validateTextInput(formData.name, 'Pet name')) {
            newErrors.name = 'Pet name contains invalid characters';
        }

        if (!formData.species) {
            newErrors.species = 'Pet type is required';
        }

        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        if (!formData.date_of_birth) {
            newErrors.date_of_birth = 'Date of birth is required';
        }

        // Validate breed and color if they have values
        if (formData.breed && !validateTextInput(formData.breed, 'Breed')) {
            newErrors.breed = 'Breed contains invalid characters';
        }

        if (formData.color && !validateTextInput(formData.color, 'Color')) {
            newErrors.color = 'Color contains invalid characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            Alert.alert('Success', 'Pet profile updated successfully!');
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to update pet profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const validateTextInput = (text: string, fieldName: string) => {
        // Allow letters, spaces, and hyphens only - exclude quotes, numbers, and special characters
        const validPattern = /^[A-Za-z\s\-]+$/;
        if (!validPattern.test(text)) {
            Alert.alert('Validation Error', `${fieldName} can only contain letters, spaces, and hyphens. Numbers, quotes, and special characters are not allowed.`);
            return false;
        }
        return true;
    };

    const filterTextInput = (text: string) => {
        // Remove all characters except letters, spaces, and hyphens
        return text.replace(/[^A-Za-z\s\-]/g, '');
    };

    const handleInputChange = (field: keyof PetData, value: string) => {
        // Apply text filtering for specific fields
        if (field === 'name' || field === 'breed' || field === 'color') {
            const filteredValue = filterTextInput(value);
            setFormData(prev => ({ ...prev, [field]: filteredValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return dateString;
        }
    };

    if (!petData) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Edit Pet Profile</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={{ flex: 1 }} 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 20 }}
                    >
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Pet's Name</Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                placeholder="Enter pet's name"
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Species</Text>
                            <TouchableOpacity
                                style={[styles.pickerContainer, errors.species && styles.inputError]}
                                onPress={() => setShowSpeciesPicker(!showSpeciesPicker)}
                            >
                                <View style={styles.pickerButton}>
                                    <Text style={formData.species ? styles.pickerText : styles.pickerPlaceholder}>
                                        {formData.species || 'Select species'}
                                    </Text>
                                    <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                                </View>
                            </TouchableOpacity>
                            {showSpeciesPicker && (
                                <View style={styles.pickerOptions}>
                                    {speciesOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.pickerOption}
                                            onPress={() => {
                                                handleInputChange('species', option);
                                                setShowSpeciesPicker(false);
                                            }}
                                        >
                                            <Text style={styles.pickerOptionText}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {errors.species && <Text style={styles.errorText}>{errors.species}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Breed</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.breed}
                                onChangeText={(value) => handleInputChange('breed', value)}
                                placeholder="Enter breed"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Color</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.color}
                                onChangeText={(value) => handleInputChange('color', value)}
                                placeholder="Enter color"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Gender</Text>
                            <TouchableOpacity
                                style={[styles.pickerContainer, errors.gender && styles.inputError]}
                                onPress={() => setShowGenderPicker(!showGenderPicker)}
                            >
                                <View style={styles.pickerButton}>
                                    <Text style={formData.gender ? styles.pickerText : styles.pickerPlaceholder}>
                                        {formData.gender || 'Select gender'}
                                    </Text>
                                    <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                                </View>
                            </TouchableOpacity>
                            {showGenderPicker && (
                                <View style={styles.pickerOptions}>
                                    {genderOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={styles.pickerOption}
                                            onPress={() => {
                                                handleInputChange('gender', option);
                                                setShowGenderPicker(false);
                                            }}
                                        >
                                            <Text style={styles.pickerOptionText}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Pet's Date of Birth</Text>
                            <TextInput
                                style={[styles.input, errors.date_of_birth && styles.inputError]}
                                value={formData.date_of_birth}
                                onChangeText={(value) => handleInputChange('date_of_birth', value)}
                                placeholder="YYYY-MM-DD"
                            />
                            {errors.date_of_birth && <Text style={styles.errorText}>{errors.date_of_birth}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Owner's Birthday</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.owner_birthday as string}
                                onChangeText={(value) => handleInputChange('owner_birthday', value)}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.saveButton} 
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#045b26" />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
