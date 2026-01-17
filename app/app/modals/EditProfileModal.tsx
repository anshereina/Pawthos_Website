import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuthToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../utils/config';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (userData: any) => void;
    userData: any;
    loading?: boolean;
}

export default function EditProfileModal({
    visible,
    onClose,
    onSave,
    userData,
    loading = false
}: EditProfileModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        photo_url: ''
    });
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [newImageUri, setNewImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone_number: userData.phone_number || '',
                address: userData.address || '',
                photo_url: userData.photo_url || ''
            });
            // Set the server URL for display, but clear any pending new image
            const serverUrl = userData.photo_url ? (userData.photo_url.startsWith('http') ? userData.photo_url : `${API_BASE_URL.replace('/api', '')}${userData.photo_url}`) : null;
            console.log('EditProfileModal: Setting image URI from userData:', serverUrl);
            setImageUri(serverUrl);
            setNewImageUri(null);
        }
    }, [userData]);

    const pickImage = async () => {
        try {
            // Check permission first, only request if needed
            const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (existingStatus !== 'granted') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Photo library permission is required to select images');
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'] as any,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                // Store the new local URI temporarily for preview
                setImageUri(result.assets[0].uri);
                setNewImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Pick image error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            // Check permission first, only request if needed
            const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
            if (existingStatus !== 'granted') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Camera permission is required to take a photo');
                    return;
                }
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                // Store the new local URI temporarily for preview
                setImageUri(result.assets[0].uri);
                setNewImageUri(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const uploadImage = async (uri: string): Promise<string | null> => {
        try {
            setUploading(true);
            
            console.log('Starting image upload...');
            console.log('Image URI:', uri);
            console.log('API_BASE_URL:', API_BASE_URL);
            
            // Create form data with the image
            const formData = new FormData();
            const filename = uri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg';
            
            console.log('Filename:', filename);
            console.log('Type:', type);
            
            formData.append('file', {
                uri: uri,
                name: filename,
                type: type,
            } as any);

            // Get auth token
            const token = await getAuthToken();
            if (!token) {
                console.error('No auth token found');
                Alert.alert('Error', 'Authentication required');
                return null;
            }
            
            console.log('Auth token present:', token ? 'Yes' : 'No');

            // Upload to server
            const uploadUrl = `${API_BASE_URL}/upload-user-photo`;
            console.log('Upload URL:', uploadUrl);
            
            // Note: Do NOT set Content-Type header - React Native needs to set it with multipart boundary
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Explicitly don't set Content-Type - let React Native set it with boundary
                } as any,
                body: formData,
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                let errorMessage = `Upload failed with status ${response.status}`;
                try {
                    const errorText = await response.text();
                    console.error('Upload failed response:', errorText);
                    
                    // Try to parse as JSON for structured error
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.detail || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                } catch (e) {
                    console.error('Error reading error response:', e);
                }
                
                console.error('Upload failed:', errorMessage);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Upload response:', data);
            
            if (!data.photo_url) {
                throw new Error('Server did not return photo_url');
            }
            
            return data.photo_url; // Returns server URL like "/uploads/user_123_timestamp.jpg"
            
        } catch (error) {
            console.error('Image upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert('Upload Error', `Failed to upload image: ${errorMessage}`);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        // Basic email format validation
        const trimmedEmail = (formData.email || '').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
            Alert.alert('Invalid email', 'Please enter a valid email address (e.g., user@example.com).');
            return;
        }

        // Normalize and validate phone number: digits only, must be exactly 11 digits if provided
        let normalizedPhone = formData.phone_number;
        if (normalizedPhone && normalizedPhone.trim().length > 0) {
            const digitsOnly = normalizedPhone.replace(/\D/g, '');
            if (digitsOnly.length !== 11) {
                Alert.alert('Invalid phone number', 'Phone number must be exactly 11 digits.');
                return;
            }
            normalizedPhone = digitsOnly;
        } else {
            normalizedPhone = undefined as any;
        }

        const payload = { 
            ...formData, 
            email: trimmedEmail,
            phone_number: normalizedPhone,
        };

        // If there's a new image, upload it first
        if (newImageUri) {
            const serverUrl = await uploadImage(newImageUri);
            if (serverUrl) {
                // Update formData with the server URL
                const updatedData = { ...payload, photo_url: serverUrl };
                onSave(updatedData);
            } else {
                Alert.alert('Error', 'Failed to upload profile picture. Save without image?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Save Without Image', onPress: () => onSave(payload) }
                ]);
            }
        } else {
            // No new image, just save the other fields
            onSave(payload);
        }
    };

    const showImagePicker = () => {
        Alert.alert(
            'Choose Photo',
            'Select a photo from your gallery or take a new one',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Gallery', onPress: pickImage },
                { text: 'Camera', onPress: takePhoto },
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <MaterialIcons name="close" size={24} color="#045b26" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity 
                        onPress={handleSave} 
                        style={styles.saveButton}
                        disabled={loading || uploading}
                    >
                        {(loading || uploading) ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.photoSection}>
                        <TouchableOpacity onPress={showImagePicker} style={styles.photoContainer}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={styles.photo} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <MaterialIcons name="person" size={40} color="#ccc" />
                                </View>
                            )}
                            <View style={styles.photoEditButton}>
                                <MaterialIcons name="camera-alt" size={16} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.photoLabel}>Tap to change photo</Text>
                    </View>

                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                placeholder="Enter your name"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#f3f4f6' }]}
                                value={formData.email}
                                editable={false}
                                selectTextOnFocus={false}
                                placeholder="Email (read-only)"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phone_number}
                                onChangeText={(text) => {
                                    const digitsOnly = text.replace(/\D/g, '');
                                    if (digitsOnly.length <= 11) {
                                        setFormData(prev => ({ ...prev, phone_number: digitsOnly }));
                                    }
                                }}
                                maxLength={11}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.address}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                                placeholder="Enter your address"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
    },
    saveButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    photoPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoEditButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#045b26',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    photoLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    formSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
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
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
});

