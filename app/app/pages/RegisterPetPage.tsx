import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Modal, TouchableWithoutFeedback, Pressable, Image, Alert, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createPet, uploadPetPhoto } from '../../utils/pets.utils';
import { getCurrentUser } from '../../utils/auth.utils';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#ffffff' 
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#000',
        fontFamily: 'Jumper',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(26, 26, 26, 0.7)',
        fontFamily: 'Flink',
        textAlign: 'center',
        marginTop: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    
    // Progress Indicator
    progressContainer: {
        marginBottom: 24,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
        marginBottom: 12,
        textAlign: 'center',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E8F5E8',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#045b26',
        borderRadius: 3,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    formSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
        marginBottom: 12,
    },
    sectionIcon: {
        marginRight: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    questionText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#045b26',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        backgroundColor: '#045b26',
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    radioText: {
        fontSize: 16,
        color: '#333',
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
        fontFamily: 'Flink',
        color: '#000',
    },
    inputFieldFocused: {
        borderColor: '#045b26',
        backgroundColor: '#F8FFF8',
    },
    inputFieldError: {
        borderColor: '#DC3545',
        backgroundColor: '#FFF5F5',
    },
    inputFieldDisabled: {
        backgroundColor: '#F8F9FA',
        color: '#6C757D',
        borderColor: '#E9ECEF',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Jumper',
        marginBottom: 6,
    },
    inputHelpText: {
        fontSize: 12,
        color: '#6C757D',
        fontFamily: 'Flink',
        marginTop: 4,
        fontStyle: 'italic',
    },
    inputErrorText: {
        fontSize: 12,
        color: '#DC3545',
        fontFamily: 'Flink',
        marginTop: 4,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dropdownContainerActive: {
        borderColor: '#045b26',
        backgroundColor: '#F8FFF8',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    dropdownText: {
        color: '#6C757D',
        fontSize: 16,
        fontFamily: 'Flink',
    },
    dropdownTextSelected: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'Flink',
    },
    dropdownOptions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        zIndex: 1000,
        maxHeight: 200,
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownOptionPressed: {
        backgroundColor: '#f0f8f0',
    },
    dropdownOptionLast: {
        borderBottomWidth: 0,
    },
    dropdownOptionText: {
        fontSize: 16,
        color: '#333',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidthField: {
        width: '48%',
    },
    pictureContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
        backgroundColor: '#f9f9f9',
        marginTop: 8,
    },
    pictureText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    petImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    removePhotoButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 12,
        alignSelf: 'center',
    },
    changePhotoText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    registerButton: {
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 3,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default function RegisterPetPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const [petName, setPetName] = useState('');
    const [species, setSpecies] = useState('Please Select');
    const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
    const [breed, setBreed] = useState('');
    const [color, setColor] = useState('');
    const [ownerBirthday, setOwnerBirthday] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Please Select');
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);
    const [reproductiveStatus, setReproductiveStatus] = useState<'Intact' | 'Castrated/Spayed' | null>(null);
    const [petPhoto, setPetPhoto] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Form validation states
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);
    
    // Entrance animations
    const enterOpacity = useRef(new Animated.Value(0)).current;
    const enterTranslateY = useRef(new Animated.Value(8)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const speciesOptions = ['Canine', 'Feline'];
    const genderOptions = ['Male', 'Female'];
    
    // Add entrance animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(enterOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(enterTranslateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Calculate form completion progress
    const calculateProgress = () => {
        const fields = [
            petName.trim(),
            species !== 'Please Select',
            gender !== 'Please Select',
            reproductiveStatus,
        ];
        const completed = fields.filter(Boolean).length;
        return (completed / fields.length) * 100;
    };

    // Update progress animation
    useEffect(() => {
        const progress = calculateProgress();
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [petName, species, gender, reproductiveStatus]);

    // Function to filter out invalid characters (numbers and special characters except spaces, hyphens, apostrophes)
    const filterTextInput = (text: string) => {
        // Remove all characters except letters, spaces, and hyphens
        return text.replace(/[^A-Za-z\s\-]/g, '');
    };

    // Enhanced input handlers with validation
    const handlePetNameChange = (text: string) => {
        const filtered = filterTextInput(text);
        setPetName(filtered);
        
        // Clear error when user starts typing
        if (fieldErrors.petName) {
            setFieldErrors(prev => ({ ...prev, petName: '' }));
        }
    };

    const handleBreedChange = (text: string) => {
        const filtered = filterTextInput(text);
        setBreed(filtered);
        
        if (fieldErrors.breed) {
            setFieldErrors(prev => ({ ...prev, breed: '' }));
        }
    };

    const handleColorChange = (text: string) => {
        const filtered = filterTextInput(text);
        setColor(filtered);
        
        if (fieldErrors.color) {
            setFieldErrors(prev => ({ ...prev, color: '' }));
        }
    };

    // Field focus handlers
    const handleFieldFocus = (fieldName: string) => {
        setFocusedField(fieldName);
    };

    const handleFieldBlur = () => {
        setFocusedField(null);
    };

    const handleSpeciesSelect = (selectedSpecies: string) => {
        setSpecies(selectedSpecies);
        setShowSpeciesDropdown(false);
    };

    const handleGenderSelect = (selectedGender: string) => {
        setGender(selectedGender);
        setShowGenderDropdown(false);
    };

    const formatDateInput = (text: string) => {
        // Normalize dashes to slashes
        const normalized = text.replace(/-/g, '/');
        // Remove all non-numeric and non-slash characters
        const cleaned = normalized.replace(/[^0-9/]/g, '');
        const digits = cleaned.replace(/\//g, '');
        // Format as DD/MM/YYYY progressively
        if (digits.length <= 2) {
            return digits;
        } else if (digits.length <= 4) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        } else {
            return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
        }
    };

    const getDaysInMonth = (year: number, monthIndexZeroBased: number) => {
        return new Date(year, monthIndexZeroBased + 1, 0).getDate();
    };

    const calculateAge = (dobInput: string) => {
        // Accept DD/MM/YYYY or DD-MM-YYYY
        const normalized = dobInput.replace(/-/g, '/');
        if (normalized.length !== 10) return '';
        const parts = normalized.split('/');
        if (parts.length !== 3) return '';
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
        if (day < 1 || month < 1 || month > 12) return '';
        const birthDate = new Date(year, month - 1, day);
        if (isNaN(birthDate.getTime())) return '';
        const today = new Date();
        // Future dates are invalid
        if (birthDate > today) return '';
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - (birthDate.getMonth());
        let days = today.getDate() - birthDate.getDate();
        if (days < 0) {
            // borrow days from previous month
            const prevMonthIndex = (today.getMonth() - 1 + 12) % 12;
            const prevMonthYear = prevMonthIndex === 11 ? today.getFullYear() - 1 : today.getFullYear();
            const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);
            days += daysInPrevMonth;
            months -= 1;
        }
        if (months < 0) {
            months += 12;
            years -= 1;
        }
        const partsOut: string[] = [];
        if (years > 0) partsOut.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months > 0) partsOut.push(`${months} month${months > 1 ? 's' : ''}`);
        if (days > 0 || partsOut.length === 0) partsOut.push(`${days} day${days !== 1 ? 's' : ''}`);
        return partsOut.join(' ');
    };

    const handleDateOfBirthChange = (text: string) => {
        const formatted = formatDateInput(text);
        setDateOfBirth(formatted);
        const calculatedAge = calculateAge(formatted);
        setAge(calculatedAge);
    };

    const handleOwnerBirthdayChange = (text: string) => {
        const formatted = formatDateInput(text);
        setOwnerBirthday(formatted);
    };

    const requestPermissions = async () => {
        // Check permission first, only request if needed
        const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (existingStatus !== 'granted') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Sorry, we need camera roll permissions to select photos.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        Alert.alert(
            'Select Photo',
            'Choose how you want to add a photo',
            [
                {
                    text: 'Camera',
                    onPress: openCamera,
                },
                {
                    text: 'Photo Library',
                    onPress: openImageLibrary,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const openCamera = async () => {
        // Check permission first, only request if needed
        const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
        if (existingStatus !== 'granted') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Sorry, we need camera permissions to take photos.',
                    [{ text: 'OK' }]
                );
                return;
            }
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setPetPhoto(result.assets[0].uri);
        }
    };

    const openImageLibrary = async () => {
        // Check permission first, only request if needed
        const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (existingStatus !== 'granted') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Sorry, we need camera roll permissions to select photos.',
                    [{ text: 'OK' }]
                );
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setPetPhoto(result.assets[0].uri);
        }
    };

    const removePhoto = () => {
        Alert.alert(
            'Remove Photo',
            'Are you sure you want to remove this photo?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => setPetPhoto(null),
                },
            ]
        );
    };

    const generatePetId = () => {
        // Generate a simple pet ID format: P-YYYY-XXXX
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        return `P-${year}-${randomNum}`;
    };

    // Validation function to check for letters, spaces, and hyphens only
    const validateTextInput = (text: string, fieldName: string) => {
        // Allow letters, spaces, and hyphens only - exclude quotes, numbers, and special characters
        const validPattern = /^[A-Za-z\s\-]+$/;
        if (!validPattern.test(text)) {
            Alert.alert('Validation Error', `${fieldName} can only contain letters, spaces, and hyphens. Numbers, quotes, and special characters are not allowed.`);
            return false;
        }
        return true;
    };

    const validateForm = () => {
        // Check required fields
        if (!petName.trim()) {
            Alert.alert('Validation Error', 'Please enter pet name');
            return false;
        }

        // Validate pet name
        if (!validateTextInput(petName.trim(), 'Pet name')) {
            return false;
        }
        
        if (species === 'Please Select') {
            Alert.alert('Validation Error', 'Please select pet species');
            return false;
        }

        // Validate breed if provided
        if (breed.trim() && !validateTextInput(breed.trim(), 'Breed')) {
            return false;
        }

        // Validate color if provided
        if (color.trim() && !validateTextInput(color.trim(), 'Color')) {
            return false;
        }

        if (gender === 'Please Select') {
            Alert.alert('Validation Error', 'Please select pet gender');
            return false;
        }

        if (!reproductiveStatus) {
            Alert.alert('Validation Error', 'Please select reproductive status');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            setIsRegistering(true);

            // Always generate a new pet ID for registration
            const finalPetId = generatePetId();

            // Get current user info for owner name
            const currentUser = await getCurrentUser();
            const ownerName = currentUser?.name || 'Pet Owner';

            // Convert date from DD/MM/YYYY (or DD-MM-YYYY) to YYYY-MM-DD format for backend
            let formattedDateOfBirth = undefined;
            if (dateOfBirth && dateOfBirth.length === 10) {
                const normalized = dateOfBirth.replace(/-/g, '/');
                const parts = normalized.split('/');
                if (parts.length === 3) {
                    // Convert DD/MM/YYYY to YYYY-MM-DD
                    formattedDateOfBirth = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }

            let formattedOwnerBirthday = undefined;
            if (ownerBirthday && ownerBirthday.length === 10) {
                const normalized = ownerBirthday.replace(/-/g, '/');
                const parts = normalized.split('/');
                if (parts.length === 3) {
                    formattedOwnerBirthday = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }

            const petData = {
                pet_id: finalPetId,
                name: petName.trim(),
                owner_name: ownerName,
                owner_birthday: formattedOwnerBirthday,
                species: species,
                date_of_birth: formattedDateOfBirth,
                color: color.trim() || undefined,
                breed: breed.trim() || undefined,
                gender: gender.toLowerCase(),
                reproductive_status: reproductiveStatus?.toLowerCase(),
            };

            console.log('Registering pet with data:', petData);

            // Create pet first
            const result = await createPet(petData);

            if (result.success) {
                const createdPet = result.data as any;
                const petId = createdPet.id;
                
                // If there's a photo, upload it after pet creation
                if (petPhoto) {
                    console.log('Uploading pet photo for pet ID:', petId, 'Photo URI:', petPhoto);
                    const photoResult = await uploadPetPhoto(petId, petPhoto);
                    
                    if (photoResult.success) {
                        console.log('Photo uploaded successfully:', photoResult.photo_url);
                    } else {
                        console.warn('Photo upload failed:', photoResult.message);
                        // Don't fail the entire registration if photo upload fails
                    }
                }

                // Use returned pet ID if available
                const returnedId = createdPet?.pet_id || finalPetId;
                Alert.alert(
                    'Success!',
                    `${petName} has been registered successfully with ID: ${returnedId}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Reset form
                                setPetName('');
                                setSpecies('Please Select');
                                setBreed('');
                                setColor('');
                                setDateOfBirth('');
                                setAge('');
                                setGender('Please Select');
                                setReproductiveStatus(null);
                                setPetPhoto(null);
                                
                                // Navigate back to pet profile or main page
                                if (onNavigate) {
                                    onNavigate('Pet profile');
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Registration Failed', result.message || 'Failed to register pet. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'An error occurred while registering the pet. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={() => { setShowSpeciesDropdown(false); setShowGenderDropdown(false); }}>
                <Animated.View style={{ flex: 1, opacity: enterOpacity, transform: [{ translateY: enterTranslateY }] }}>
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Register Your Pet</Text>
                            <Text style={styles.subtitle}>Complete the form to add your pet to your profile</Text>
                        </View>

                        {/* Progress Indicator */}
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressTitle}>
                                Registration Progress ({Math.round(calculateProgress())}% complete)
                            </Text>
                            <View style={styles.progressBar}>
                                <Animated.View 
                                    style={[
                                        styles.progressFill, 
                                        { 
                                            width: progressAnim.interpolate({
                                                inputRange: [0, 100],
                                                outputRange: ['0%', '100%']
                                            })
                                        }
                                    ]} 
                                />
                            </View>
                        </View>

                        <View style={styles.formContainer}>
                            {/* Pet's Name */}
                            <View style={styles.formSection}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="dog" size={20} color="#045b26" style={styles.sectionIcon} />
                                    <Text style={styles.sectionTitle}>Pet's Name</Text>
                                </View>
                                <TextInput
                                    style={[
                                        styles.inputField,
                                        focusedField === 'petName' && styles.inputFieldFocused,
                                        fieldErrors.petName && styles.inputFieldError
                                    ]}
                                    placeholder="Enter your pet's name"
                                    placeholderTextColor="#6C757D"
                                    value={petName}
                                    onChangeText={handlePetNameChange}
                                    onFocus={() => handleFieldFocus('petName')}
                                    onBlur={handleFieldBlur}
                                    maxLength={50}
                                />
                                <Text style={styles.inputHelpText}>Required • Letters, spaces, and hyphens only</Text>
                                {fieldErrors.petName && (
                                    <Text style={styles.inputErrorText}>{fieldErrors.petName}</Text>
                                )}
                            </View>

                            {/* Type of Species */}
                            <View style={styles.formSection}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="paw" size={20} color="#045b26" style={styles.sectionIcon} />
                                    <Text style={styles.sectionTitle}>Type of Species</Text>
                                </View>
                                <View style={{ position: 'relative' }}>
                            <TouchableOpacity 
                                style={[
                                    styles.dropdownContainer,
                                    showSpeciesDropdown && styles.dropdownContainerActive
                                ]}
                                onPress={() => setShowSpeciesDropdown(!showSpeciesDropdown)}
                            >
                                <Text style={[
                                    species === 'Please Select' ? styles.dropdownText : styles.dropdownTextSelected
                                ]}>
                                    {species}
                                </Text>
                                <MaterialIcons 
                                    name={showSpeciesDropdown ? "arrow-drop-up" : "arrow-drop-down"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                            
                            {showSpeciesDropdown && (
                                <View style={styles.dropdownOptions}>
                                    {speciesOptions.map((option, index) => (
                                        <Pressable 
                                            key={option}
                                            style={({ pressed }) => [
                                                styles.dropdownOption,
                                                index === speciesOptions.length - 1 && styles.dropdownOptionLast,
                                                pressed && styles.dropdownOptionPressed
                                            ]}
                                            onPress={() => handleSpeciesSelect(option)}
                                        >
                                            <Text style={styles.dropdownOptionText}>{option}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Breed and Color */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Breed and Color</Text>
                        <View style={styles.rowContainer}>
                            <TextInput
                                style={[styles.inputField, styles.halfWidthField]}
                                placeholder="Breed"
                                placeholderTextColor="#999"
                                value={breed}
                                onChangeText={handleBreedChange}
                            />
                            <TextInput
                                style={[styles.inputField, styles.halfWidthField]}
                                placeholder="Color"
                                placeholderTextColor="#999"
                                value={color}
                                onChangeText={handleColorChange}
                            />
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Owner's Birthday</Text>
                        <TextInput
                            style={styles.inputField}
                            placeholder="DD/MM/YYYY"
                            placeholderTextColor="#999"
                            value={ownerBirthday}
                            onChangeText={handleOwnerBirthdayChange}
                            keyboardType="numeric"
                            maxLength={10}
                        />
                    </View>

                    {/* Date of Birth and Age */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Pet's Date of Birth and Age</Text>
                        <View style={styles.rowContainer}>
                            <TextInput
                                style={[styles.inputField, styles.halfWidthField]}
                                placeholder="DD/MM/YYYY"
                                placeholderTextColor="#999"
                                value={dateOfBirth}
                                onChangeText={handleDateOfBirthChange}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                            <TextInput
                                style={[styles.inputField, styles.halfWidthField, styles.inputFieldDisabled]}
                                placeholder="Age"
                                placeholderTextColor="#999"
                                value={age}
                                editable={false}
                            />
                        </View>
                    </View>

                    {/* Gender */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Gender</Text>
                        <View style={{ position: 'relative' }}>
                            <TouchableOpacity 
                                style={[
                                    styles.dropdownContainer,
                                    showGenderDropdown && styles.dropdownContainerActive
                                ]}
                                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                            >
                                <Text style={[
                                    gender === 'Please Select' ? styles.dropdownText : styles.dropdownTextSelected
                                ]}>
                                    {gender}
                                </Text>
                                <MaterialIcons 
                                    name={showGenderDropdown ? "arrow-drop-up" : "arrow-drop-down"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                            
                            {showGenderDropdown && (
                                <View style={styles.dropdownOptions}>
                                    {genderOptions.map((option, index) => (
                                        <Pressable 
                                            key={option}
                                            style={({ pressed }) => [
                                                styles.dropdownOption,
                                                index === genderOptions.length - 1 && styles.dropdownOptionLast,
                                                pressed && styles.dropdownOptionPressed
                                            ]}
                                            onPress={() => handleGenderSelect(option)}
                                        >
                                            <Text style={styles.dropdownOptionText}>{option}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Reproductive Status</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity 
                                style={styles.radioOption}
                                onPress={() => setReproductiveStatus('Intact')}
                            >
                                <View style={[
                                    styles.radioButton,
                                    reproductiveStatus === 'Intact' && styles.radioButtonSelected
                                ]}>
                                    {reproductiveStatus === 'Intact' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>Intact</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.radioOption}
                                onPress={() => setReproductiveStatus('Castrated/Spayed')}
                            >
                                <View style={[
                                    styles.radioButton,
                                    reproductiveStatus === 'Castrated/Spayed' && styles.radioButtonSelected
                                ]}>
                                    {reproductiveStatus === 'Castrated/Spayed' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>Castrated/Spayed</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Picture Upload */}
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Attached Picture here</Text>
                        {petPhoto ? (
                            <View>
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: petPhoto }} style={styles.petImage} />
                                    <TouchableOpacity 
                                        style={styles.removePhotoButton}
                                        onPress={removePhoto}
                                    >
                                        <MaterialIcons name="close" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity 
                                    style={styles.changePhotoButton}
                                    onPress={pickImage}
                                >
                                    <Text style={styles.changePhotoText}>Change Photo</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                style={styles.pictureContainer}
                                onPress={pickImage}
                            >
                                <MaterialIcons name="add-photo-alternate" size={48} color="#ccc" />
                                <Text style={styles.pictureText}>Tap to add photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Register Button */}
                <TouchableOpacity 
                    style={[styles.registerButton, isRegistering && { opacity: 0.7 }]}
                    onPress={handleRegister}
                    disabled={isRegistering}
                >
                    {isRegistering ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.registerButtonText}>Registering...</Text>
                        </View>
                    ) : (
                        <Text style={styles.registerButtonText}>Register</Text>
                    )}
                </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
} 