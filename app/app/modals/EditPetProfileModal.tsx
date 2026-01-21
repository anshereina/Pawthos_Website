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
    Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PetData, uploadPetPhoto } from '../../utils/pets.utils';
import { API_BASE_URL } from '../../utils/config';

interface EditPetProfileModalProps {
    visible: boolean;
    onClose: () => void;
    petData: PetData | null;
    onSave: (updatedPetData: Partial<PetData>) => Promise<boolean>;
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
        color: '#000',
    },
    dateInput: {
        backgroundColor: '#fff',
        fontWeight: '600',
        color: '#045b26',
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
    photoSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    photoWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    petPhoto: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    photoPlaceholderIcon: {
        opacity: 0.5,
    },
    photoButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#045b26',
        flexDirection: 'row',
        alignItems: 'center',
    },
    photoButtonText: {
        color: '#045b26',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
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
    const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const speciesOptions = ['Canine', 'Feline'];
    const genderOptions = ['male', 'female'];

    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch {
            return dateString;
        }
    };

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
                date_of_birth: formatDateForInput(petData.date_of_birth || ''),
                owner_birthday: formatDateForInput(petData.owner_birthday || ''),
            };
            console.log('Setting form data:', initialData);
            setFormData(initialData);
            setErrors({});
            setLocalPhotoUri(null);
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
            let newPhotoUrl: string | undefined;

            // If a new photo was selected, upload it first
            if (localPhotoUri && petData) {
                setUploadingPhoto(true);
                const result = await uploadPetPhoto(petData.id, localPhotoUri);
                setUploadingPhoto(false);

                if (result.success && result.photo_url) {
                    newPhotoUrl = result.photo_url;
                } else if (!result.success && result.message) {
                    Alert.alert('Photo Upload Failed', result.message);
                }
            }

            const payload: Partial<PetData> = {
                ...formData,
                ...(newPhotoUrl ? { photo_url: newPhotoUrl } : {}),
            };

            const saved = await onSave(payload);
            if (saved) {
                Alert.alert('Success', 'Pet profile updated successfully!');
                onClose();
            } else {
                Alert.alert('Error', 'Failed to update pet profile. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update pet profile. Please try again.');
        } finally {
            setLoading(false);
            setUploadingPhoto(false);
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

    const formatDateInput = (value: string) => {
        // Remove all non-numeric characters
        const numbers = value.replace(/\D/g, '');
        
        // Format as YYYY-MM-DD
        if (numbers.length <= 4) {
            return numbers;
        } else if (numbers.length <= 6) {
            return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        } else {
            return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
        }
    };

    const handleInputChange = (field: keyof PetData, value: string) => {
        // Apply text filtering for specific fields
        if (field === 'name' || field === 'breed' || field === 'color') {
            const filteredValue = filterTextInput(value);
            setFormData(prev => ({ ...prev, [field]: filteredValue }));
        } else if (field === 'date_of_birth' || field === 'owner_birthday') {
            // Format date input to YYYY-MM-DD
            const formattedValue = formatDateInput(value);
            setFormData(prev => ({ ...prev, [field]: formattedValue }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
        
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const requestMediaLibraryPermission = async () => {
        const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (existingStatus !== 'granted') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'We need access to your photos to update your pet picture.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        }
        return true;
    };

    const requestCameraPermission = async () => {
        const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
        if (existingStatus !== 'granted') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'We need camera permission to take a new pet photo.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        }
        return true;
    };

    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setLocalPhotoUri(result.assets[0].uri);
        }
    };

    const openImageLibrary = async () => {
        const hasPermission = await requestMediaLibraryPermission();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setLocalPhotoUri(result.assets[0].uri);
        }
    };

    const handlePickPhoto = () => {
        Alert.alert(
            'Update Pet Photo',
            'Choose how you want to update the pet picture',
            [
                { text: 'Camera', onPress: openCamera },
                { text: 'Photo Library', onPress: openImageLibrary },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleRemovePhoto = () => {
        Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove this photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setLocalPhotoUri(null);
                        // Removing photo on backend is optional; leave existing server photo_url unchanged here.
                    },
                },
            ]
        );
    };

    const getDisplayPhotoUri = () => {
        if (localPhotoUri) return localPhotoUri;
        if (petData?.photo_url) {
            if (petData.photo_url.startsWith('http')) {
                return petData.photo_url;
            }
            return `${API_BASE_URL.replace('/api', '')}${petData.photo_url}`;
        }
        return null;
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

                    {/* Photo preview and actions */}
                    <View style={styles.photoSection}>
                        <View style={styles.photoWrapper}>
                            {getDisplayPhotoUri() ? (
                                <Image
                                    source={{ uri: getDisplayPhotoUri() as string }}
                                    style={styles.petPhoto}
                                />
                            ) : (
                                <MaterialIcons
                                    name="pets"
                                    size={36}
                                    color="#999"
                                    style={styles.photoPlaceholderIcon}
                                />
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.photoButton}
                            onPress={handlePickPhoto}
                            disabled={loading || uploadingPhoto}
                        >
                            <MaterialIcons name="photo-camera" size={18} color="#045b26" />
                            <Text style={styles.photoButtonText}>
                                {getDisplayPhotoUri() ? 'Change Photo' : 'Add Photo'}
                            </Text>
                        </TouchableOpacity>
                        {getDisplayPhotoUri() && (
                            <TouchableOpacity
                                onPress={handleRemovePhoto}
                                disabled={loading || uploadingPhoto}
                                style={{ marginTop: 6 }}
                            >
                                <Text style={{ fontSize: 12, color: '#666', textDecorationLine: 'underline' }}>
                                    Remove current photo
                                </Text>
                            </TouchableOpacity>
                        )}
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
                                style={[styles.input, styles.dateInput, errors.date_of_birth && styles.inputError]}
                                value={formData.date_of_birth}
                                onChangeText={(value) => handleInputChange('date_of_birth', value)}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                            {errors.date_of_birth && <Text style={styles.errorText}>{errors.date_of_birth}</Text>}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Owner's Birthday</Text>
                            <TextInput
                                style={[styles.input, styles.dateInput]}
                                value={formData.owner_birthday as string}
                                onChangeText={(value) => handleInputChange('owner_birthday', value)}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
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
