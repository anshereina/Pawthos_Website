import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getPets, PetData } from '../../utils/pets.utils';
import { createAppointment, updateAppointment, AppointmentCreate } from '../../utils/appointments.utils';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f7f7f7' 
    },
    header: {
        paddingHorizontal: 5,
        paddingVertical: 16,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    calendarContainer: {
        backgroundColor: '#045b26',
        borderRadius: 16,
        padding: 25,
        marginBottom: 24,
        elevation: 3,
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    monthYear: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.5,
    },
    navigationArrows: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowBtn: {
        padding: 8,
        marginHorizontal: 4,
    },
    daysHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    dayHeader: {
        flex: 1,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
    },
    dayText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
    },
    formSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 8,
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        color: '#999',
        fontSize: 16,
    },
    dropdownOption: {
        borderWidth: 1,
        borderColor: '#eee',
        borderTopWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    dropdownOptionSelected: {
        backgroundColor: '#e0ffe6',
        borderColor: '#045b26',
    },
    dropdownOptionText: {
        color: '#333',
        fontSize: 16,
    },
    dropdownOptionTextSelected: {
        color: '#045b26',
        fontWeight: 'bold',
    },
    inputField: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    radioGroup: {
        flexDirection: 'row',
        marginTop: 8,
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
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    scheduleButton: {
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 3,
    },
    scheduleButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchableDropdownContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        maxHeight: 200,
        zIndex: 1000,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    petOption: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    petOptionSelected: {
        backgroundColor: '#e0ffe6',
    },
    petOptionText: {
        fontSize: 16,
        color: '#333',
    },
    petOptionTextSelected: {
        color: '#045b26',
        fontWeight: 'bold',
    },
    petDetailsText: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    inputFieldDisabled: {
        backgroundColor: '#f5f5f5',
        color: '#666',
    },
});

export default function AppointmentSchedulingPage({ initialAppointmentType, onBack, onNavigate, appointmentToEdit }: { initialAppointmentType?: string, onBack?: () => void, onNavigate?: (page: string) => void, appointmentToEdit?: any }) {
    const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [appointmentFor, setAppointmentFor] = useState(initialAppointmentType || 'Please Select');
    const [species, setSpecies] = useState('Please Select');
    const [vaccinationType, setVaccinationType] = useState('Please Select');
    const [selectedTime, setSelectedTime] = useState('Please Select');
    const [petName, setPetName] = useState('');
    const [petId, setPetId] = useState('');
    const [age, setAge] = useState('');
    const [birthday, setBirthday] = useState('');
    const [gender, setGender] = useState<'Female' | 'Male' | null>(null);
    const [reproductiveStatus, setReproductiveStatus] = useState<'Intact' | 'Castrated/Spayed' | null>(null);
    const [description, setDescription] = useState('');
    
    // Pet selection states
    const [userPets, setUserPets] = useState<PetData[]>([]);
    const [showPetDropdown, setShowPetDropdown] = useState(false);
    const [petSearchQuery, setPetSearchQuery] = useState('');
    const [selectedPet, setSelectedPet] = useState<PetData | null>(null);
    const [isLoadingPets, setIsLoadingPets] = useState(false);
    
    // Calendar states
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Refs
    const descriptionInputRef = useRef<TextInput>(null);
    
    // Loading state
    const [isScheduling, setIsScheduling] = useState(false);
    
    // Dropdown visibility states
    const [showAppointmentOptions, setShowAppointmentOptions] = useState(false);
    const [showSpeciesOptions, setShowSpeciesOptions] = useState(false);
    const [showVaccinationOptions, setShowVaccinationOptions] = useState(false);
    const [showTimeOptions, setShowTimeOptions] = useState(false);

    const appointmentOptions = ['Consultation', 'Deworming', 'Vaccination', 'VetHealth'];
    const speciesOptions = ['Canine', 'Feline'];
    const vaccinationOptions = ['Anti-Rabies', '4in1 (Tricats)', '4in1 (Anti-Parasites)', '5in1(Parvo)', '8in1(All Viruses)'];
    const timeOptions = [
        '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM'
    ];

    // Fetch user's pets on component mount
    useEffect(() => {
        fetchUserPets();
    }, []);

    // Prefill when rescheduling
    useEffect(() => {
        if (appointmentToEdit) {
            setEditingAppointmentId(appointmentToEdit.id);
            setAppointmentFor(appointmentToEdit.type || 'Please Select');
            if (appointmentToEdit.date) {
                const [y, m, d] = String(appointmentToEdit.date).split('-').map((v: string) => parseInt(v, 10));
                if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
                    setSelectedDate(new Date(y, m - 1, d));
                }
            }
            if (appointmentToEdit.time) {
                setSelectedTime(appointmentToEdit.time);
            }
            // Lock non-date/time fields by disabling UI already done via selectedPet and disabled inputs
        }
    }, [appointmentToEdit]);

    const fetchUserPets = async () => {
        setIsLoadingPets(true);
        try {
            const result = await getPets();
            if (result.success && result.data && Array.isArray(result.data)) {
                setUserPets(result.data);
            }
        } catch (error) {
            console.error('Error fetching pets:', error);
        } finally {
            setIsLoadingPets(false);
        }
    };

    const calculateAge = (dateOfBirth: string | undefined) => {
        if (!dateOfBirth) return '';
        
        try {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            
            let years = today.getFullYear() - birthDate.getFullYear();
            let months = today.getMonth() - birthDate.getMonth();
            
            if (today.getDate() < birthDate.getDate()) {
                months--;
            }
            
            if (months < 0) {
                years--;
                months += 12;
            }
            
            if (years === 0) {
                return months === 1 ? '1 month' : `${months} months`;
            } else if (years === 1 && months === 0) {
                return '1 year';
            } else if (months === 0) {
                return `${years} years`;
            } else {
                return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
            }
        } catch (error) {
            return '';
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return '';
        }
    };

    const handlePetSelect = (pet: PetData) => {
        console.log('Selected pet data:', pet);
        console.log('Pet gender:', pet.gender);
        console.log('Pet reproductive status:', pet.reproductive_status);
        
        setSelectedPet(pet);
        setPetName(pet.name);
        setPetId(pet.pet_id);
        setAge(calculateAge(pet.date_of_birth));
        setBirthday(formatDate(pet.date_of_birth));
        
        // Map gender with proper case formatting
        if (pet.gender) {
            const genderLower = pet.gender.toLowerCase();
            if (genderLower === 'female' || genderLower === 'f') {
                setGender('Female');
            } else if (genderLower === 'male' || genderLower === 'm') {
                setGender('Male');
            } else {
                setGender(null);
            }
        } else {
            setGender(null);
        }
        
        // Map reproductive status with proper case formatting
        if (pet.reproductive_status) {
            const statusLower = pet.reproductive_status.toLowerCase();
            if (statusLower === 'intact' || statusLower === 'not neutered' || statusLower === 'not spayed') {
                setReproductiveStatus('Intact');
            } else if (statusLower === 'castrated' || statusLower === 'spayed' || statusLower === 'neutered' || statusLower === 'castrated/spayed') {
                setReproductiveStatus('Castrated/Spayed');
            } else {
                setReproductiveStatus(null);
            }
        } else {
            setReproductiveStatus(null);
        }
        
        setSpecies(pet.species === 'Canine' ? 'Canine' : pet.species === 'Feline' ? 'Feline' : 'Please Select');
        setShowPetDropdown(false);
        setPetSearchQuery('');
    };

    const filteredPets = userPets.filter(pet => 
        pet.name.toLowerCase().includes(petSearchQuery.toLowerCase()) ||
        pet.pet_id.toLowerCase().includes(petSearchQuery.toLowerCase())
    );

    const validateForm = () => {
        if (appointmentFor === 'Please Select') {
            Alert.alert('Error', 'Please select appointment type');
            return false;
        }
        if (!selectedPet) {
            Alert.alert('Error', 'Please select a pet');
            return false;
        }
        if (!selectedDate) {
            Alert.alert('Error', 'Please select a date');
            return false;
        }
        if (isWeekend(selectedDate)) {
            Alert.alert('Unavailable', 'Appointments cannot be scheduled on Saturdays or Sundays.');
            return false;
        }
        if (isBeforeToday(selectedDate)) {
            Alert.alert('Invalid date', 'Please choose a date that is today or later.');
            return false;
        }
        if (selectedTime === 'Please Select') {
            Alert.alert('Error', 'Please select a time');
            return false;
        }
        if (appointmentFor === 'Vaccination' && vaccinationType === 'Please Select') {
            Alert.alert('Error', 'Please select vaccination type');
            return false;
        }
        return true;
    };

    const formatDateForAPI = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Local YYYY-MM-DD without timezone shifts
    };

    const handleScheduleAppointment = async () => {
        if (!validateForm()) return;

        try {
            setIsScheduling(true);

            const appointmentData: AppointmentCreate = {
                pet_id: selectedPet?.id,
                type: appointmentFor === 'Vaccination' ? `${appointmentFor} - ${vaccinationType}` : appointmentFor,
                date: formatDateForAPI(selectedDate!),
                time: selectedTime,
                veterinarian: 'Dr. Smith', // Default veterinarian, you can add selection later
                notes: description,
                // Pet details
                pet_name: selectedPet?.name,
                pet_species: selectedPet?.species,
                pet_breed: selectedPet?.breed,
                pet_age: calculateAge(selectedPet?.date_of_birth),
                pet_gender: selectedPet?.gender,
                pet_weight: selectedPet?.weight?.toString(),
                owner_name: selectedPet?.owner_name
            };

            console.log('Creating appointment with data:', appointmentData);

            let result;
            if (editingAppointmentId) {
                result = await updateAppointment(editingAppointmentId, appointmentData);
            } else {
                result = await createAppointment(appointmentData);
            }
            
            if (result.success && result.data) {
                Alert.alert(
                    'Success', 
                    editingAppointmentId ? 'Appointment rescheduled successfully!' : 'Appointment scheduled successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                if (onNavigate) {
                                    onNavigate('Appointment');
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to schedule appointment');
            }
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            Alert.alert('Error', 'Failed to schedule appointment. Please try again.');
        } finally {
            setIsScheduling(false);
        }
    };

    // Date validation helpers (placed after functions used above)
    const isWeekend = (date: Date) => {
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
    };

    const isBeforeToday = (date: Date) => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return date < todayStart;
    };

    // Calendar helper functions
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };
    
    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };
    
    const formatMonthYear = (date: Date) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };
    
    const goToPreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        setSelectedDate(null); // Clear selection when changing months
    };
    
    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        setSelectedDate(null); // Clear selection when changing months
    };
    
    const isSameDay = (date1: Date | null, date2: Date | null) => {
        if (!date1 || !date2) return false;
        return date1.getDate() === date2.getDate() && 
               date1.getMonth() === date2.getMonth() && 
               date1.getFullYear() === date2.getFullYear();
    };
    
    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && 
               currentDate.getMonth() === today.getMonth() && 
               currentDate.getFullYear() === today.getFullYear();
    };

    const renderCalendarDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(
                <View key={`empty-${i}`} style={styles.calendarDay}>
                    <Text style={[styles.dayText, { opacity: 0.3 }]}></Text>
                </View>
            );
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = isSameDay(selectedDate, dayDate);
            const isTodayDate = isToday(day);
            const disabledDay = isWeekend(dayDate) || isBeforeToday(dayDate);
            
            days.push(
                <TouchableOpacity
                    key={day}
                    style={[
                        styles.calendarDay,
                        isSelected && { backgroundColor: '#fff', borderRadius: 20 },
                        isTodayDate && !isSelected && { backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 20 },
                        disabledDay && { opacity: 0.35 }
                    ]}
                    disabled={disabledDay}
                    onPress={() => {
                        if (!disabledDay) setSelectedDate(dayDate);
                    }}
                >
                    <Text style={[
                        styles.dayText,
                        isSelected && { color: '#045b26', fontWeight: 'bold' },
                        isTodayDate && !isSelected && { fontWeight: 'bold' },
                        disabledDay && { color: 'rgba(255,255,255,0.6)' }
                    ]}>
                        {day}
                    </Text>
                </TouchableOpacity>
            );
        }
        
        return days;
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView 
                    style={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                <View style={styles.header}>
                </View>

                {/* Calendar Component */}
                <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                        <Text style={styles.monthYear}>{formatMonthYear(currentDate)}</Text>
                        <View style={styles.navigationArrows}>
                            <TouchableOpacity style={styles.arrowBtn} onPress={goToPreviousMonth}>
                                <MaterialIcons name="chevron-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.arrowBtn} onPress={goToNextMonth}>
                                <MaterialIcons name="chevron-right" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    <View style={styles.daysHeader}>
                        {daysOfWeek.map((day) => (
                            <Text key={day} style={styles.dayHeader}>{day}</Text>
                        ))}
                    </View>
                    
                    <View style={styles.calendarGrid}>
                        {renderCalendarDays()}
                    </View>
                </View>

                {/* Appointment Form */}
                <View style={styles.formContainer}>
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Time</Text>
                        <TouchableOpacity 
                            style={styles.dropdownContainer}
                            onPress={() => setShowTimeOptions(!showTimeOptions)}
                        >
                            <Text style={styles.dropdownText}>{selectedTime}</Text>
                            <MaterialIcons 
                                name={showTimeOptions ? "arrow-drop-up" : "arrow-drop-down"} 
                                size={24} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                        {showTimeOptions && timeOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.dropdownOption,
                                    selectedTime === option && styles.dropdownOptionSelected
                                ]}
                                onPress={() => {
                                    setSelectedTime(option);
                                    setShowTimeOptions(false);
                                }}
                            >
                                <Text style={[
                                    styles.dropdownOptionText,
                                    selectedTime === option && styles.dropdownOptionTextSelected
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Appointment for</Text>
                        <TouchableOpacity 
                            style={styles.dropdownContainer}
                            onPress={() => setShowAppointmentOptions(!showAppointmentOptions)}
                        >
                            <Text style={styles.dropdownText}>{appointmentFor}</Text>
                            <MaterialIcons 
                                name={showAppointmentOptions ? "arrow-drop-up" : "arrow-drop-down"} 
                                size={24} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                        {showAppointmentOptions && appointmentOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.dropdownOption,
                                    appointmentFor === option && styles.dropdownOptionSelected
                                ]}
                                onPress={() => {
                                    setAppointmentFor(option);
                                    setShowAppointmentOptions(false);
                                }}
                            >
                                <Text style={[
                                    styles.dropdownOptionText,
                                    appointmentFor === option && styles.dropdownOptionTextSelected
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Conditional Vaccination Type Form */}
                    {appointmentFor === 'Vaccination' && (
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>Type of Vaccination</Text>
                            <TouchableOpacity 
                                style={styles.dropdownContainer}
                                onPress={() => setShowVaccinationOptions(!showVaccinationOptions)}
                            >
                                <Text style={styles.dropdownText}>{vaccinationType}</Text>
                                <MaterialIcons 
                                    name={showVaccinationOptions ? "arrow-drop-up" : "arrow-drop-down"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                            {showVaccinationOptions && vaccinationOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.dropdownOption,
                                        vaccinationType === option && styles.dropdownOptionSelected
                                    ]}
                                    onPress={() => {
                                        setVaccinationType(option);
                                        setShowVaccinationOptions(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.dropdownOptionText,
                                        vaccinationType === option && styles.dropdownOptionTextSelected
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Name of Pet</Text>
                        <TouchableOpacity 
                            style={styles.dropdownContainer}
                            onPress={() => setShowPetDropdown(!showPetDropdown)}
                        >
                            <Text style={styles.dropdownText}>
                                {selectedPet ? selectedPet.name : 'Select a pet'}
                            </Text>
                            <MaterialIcons 
                                name={showPetDropdown ? "arrow-drop-up" : "arrow-drop-down"} 
                                size={24} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                        
                        {showPetDropdown && (
                            <View style={styles.searchableDropdownContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search pets by name or ID..."
                                    placeholderTextColor="#999"
                                    value={petSearchQuery}
                                    onChangeText={setPetSearchQuery}
                                    autoFocus
                                />
                                <ScrollView style={{ maxHeight: 150 }}>
                                    {isLoadingPets ? (
                                        <View style={styles.petOption}>
                                            <Text style={styles.petOptionText}>Loading pets...</Text>
                                        </View>
                                    ) : filteredPets.length === 0 ? (
                                        <View style={styles.petOption}>
                                            <Text style={styles.petOptionText}>
                                                {petSearchQuery ? 'No pets found' : 'No pets registered'}
                                            </Text>
                                        </View>
                                    ) : (
                                        filteredPets.map((pet) => (
                                            <TouchableOpacity
                                                key={pet.id}
                                                style={[
                                                    styles.petOption,
                                                    selectedPet?.id === pet.id && styles.petOptionSelected
                                                ]}
                                                onPress={() => handlePetSelect(pet)}
                                            >
                                                <Text style={[
                                                    styles.petOptionText,
                                                    selectedPet?.id === pet.id && styles.petOptionTextSelected
                                                ]}>
                                                    {pet.name}
                                                </Text>
                                                <Text style={styles.petDetailsText}>
                                                    ID: {pet.pet_id} • {pet.species}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Type of Species</Text>
                        <TouchableOpacity 
                            style={styles.dropdownContainer}
                            onPress={() => setShowSpeciesOptions(!showSpeciesOptions)}
                        >
                            <Text style={styles.dropdownText}>{species}</Text>
                            <MaterialIcons 
                                name={showSpeciesOptions ? "arrow-drop-up" : "arrow-drop-down"} 
                                size={24} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                        {showSpeciesOptions && speciesOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.dropdownOption,
                                    species === option && styles.dropdownOptionSelected
                                ]}
                                onPress={() => {
                                    setSpecies(option);
                                    setShowSpeciesOptions(false);
                                }}
                            >
                                <Text style={[
                                    styles.dropdownOptionText,
                                    species === option && styles.dropdownOptionTextSelected
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Pet ID</Text>
                        <TextInput
                            style={[styles.inputField, styles.inputFieldDisabled]}
                            placeholder="Enter pet ID"
                            placeholderTextColor="#999"
                            value={petId}
                            editable={false}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Age</Text>
                        <TextInput
                            style={[styles.inputField, styles.inputFieldDisabled]}
                            placeholder="Enter age"
                            placeholderTextColor="#999"
                            value={age}
                            editable={false}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Birthday</Text>
                        <TextInput
                            style={[styles.inputField, styles.inputFieldDisabled]}
                            placeholder="Enter birthday"
                            placeholderTextColor="#999"
                            value={birthday}
                            editable={false}
                        />
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Gender</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity 
                                style={styles.radioOption}
                                disabled={!!selectedPet}
                            >
                                <View style={[
                                    styles.radioButton,
                                    gender === 'Female' && styles.radioButtonSelected,
                                    selectedPet && { opacity: 0.6 }
                                ]}>
                                    {gender === 'Female' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={[styles.radioText, selectedPet && { opacity: 0.6 }]}>Female</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.radioOption}
                                disabled={!!selectedPet}
                            >
                                <View style={[
                                    styles.radioButton,
                                    gender === 'Male' && styles.radioButtonSelected,
                                    selectedPet && { opacity: 0.6 }
                                ]}>
                                    {gender === 'Male' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={[styles.radioText, selectedPet && { opacity: 0.6 }]}>Male</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Reproductive Status</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity 
                                style={styles.radioOption}
                                disabled={!!selectedPet}
                            >
                                <View style={[
                                    styles.radioButton,
                                    reproductiveStatus === 'Intact' && styles.radioButtonSelected,
                                    selectedPet && { opacity: 0.6 }
                                ]}>
                                    {reproductiveStatus === 'Intact' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={[styles.radioText, selectedPet && { opacity: 0.6 }]}>Intact</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.radioOption}
                                disabled={!!selectedPet}
                            >
                                <View style={[
                                    styles.radioButton,
                                    reproductiveStatus === 'Castrated/Spayed' && styles.radioButtonSelected,
                                    selectedPet && { opacity: 0.6 }
                                ]}>
                                    {reproductiveStatus === 'Castrated/Spayed' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={[styles.radioText, selectedPet && { opacity: 0.6 }]}>Castrated/Spayed</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <TextInput
                            ref={descriptionInputRef}
                            style={styles.textArea}
                            placeholder="e.g vomiting"
                            placeholderTextColor="#999"
                            multiline
                            value={description}
                            onChangeText={setDescription}
                            returnKeyType="done"
                            blurOnSubmit={true}
                        />
                    </View>
                </View>

                {/* Schedule Button */}
                <TouchableOpacity 
                    style={[styles.scheduleButton, isScheduling && { opacity: 0.7 }]}
                    onPress={handleScheduleAppointment}
                    disabled={isScheduling}
                >
                    {isScheduling ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.scheduleButtonText}>Scheduling...</Text>
                        </View>
                    ) : (
                        <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
                    )}
                </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 