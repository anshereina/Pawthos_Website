import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getPetById, updatePet, PetData } from '../../utils/pets.utils';
import { isAuthenticated } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../utils/config';
import EditPetProfileModal from '../modals/EditPetProfileModal';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        position: 'absolute',
        top: 50, // Adjusted for full-screen - moved higher
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButton: {
        position: 'absolute',
        top: 50, // Adjusted for full-screen - moved higher
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Hero Image Section
    heroSection: {
        height: height * 0.65, // Increased for better full-screen experience
        position: 'relative',
        overflow: 'hidden',
    },
    petImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 30,
    },
    petName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Jumper',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    petId: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: 'System', // Use system font for numbers
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F0F8F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Content Section
    contentSection: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: 10, // Added padding between pet name/ID and container
        paddingTop: 32,
        paddingHorizontal: 24,
        flex: 1,
    },
    
    // Quick Stats Bar
    quickStatsBar: {
        flexDirection: 'row',
        backgroundColor: '#F8FFF8',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E8F5E8',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Flink',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'System', // Use system font for numeric values
        textAlign: 'center',
    },
    // Action Buttons
    actionButtonsContainer: {
        marginBottom: 24,
    },
    actionButton: {
        backgroundColor: '#045b26',
        borderRadius: 16,
        paddingVertical: 16,
        marginBottom: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    actionButtonSecondary: {
        backgroundColor: '#F8FFF8',
        borderWidth: 1,
        borderColor: '#E8F5E8',
    },
    actionButtonIcon: {
        marginRight: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Jumper',
    },
    actionButtonTextSecondary: {
        color: '#045b26',
    },
    
    // Info Cards
    infoCardsContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
        marginBottom: 16,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        width: (width - 64) / 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        alignItems: 'center',
    },
    infoCardIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    infoCardLabel: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Flink',
        marginBottom: 4,
        textAlign: 'center',
    },
    infoCardValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'System', // Use system font for values that may contain numbers
        textAlign: 'center',
    },
    
    // Loading and Error States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#DC3545',
        textAlign: 'center',
        fontFamily: 'Flink',
        marginVertical: 16,
    },
    retryButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: 'Jumper',
    },
});

export default function PetDetailsPage({ 
    onNavigate, 
    petId 
}: { 
    onNavigate: (page: string) => void;
    petId?: number;
}) {
    const [petData, setPetData] = useState<PetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    
    // Animation references removed for cleaner experience

    useEffect(() => {
        if (petId) {
            loadPetDetails();
        } else {
            setError('No pet ID provided');
            setLoading(false);
        }
    }, [petId]);

    const loadPetDetails = async () => {
        if (!petId) return;

        try {
            setLoading(true);
            setError(null);

            const authenticated = await isAuthenticated();
            if (!authenticated) {
                Alert.alert(
                    'Authentication Required',
                    'Please login to view pet details',
                    [{ text: 'OK', onPress: () => onNavigate('Login') }]
                );
                return;
            }

            console.log('Loading pet details for ID:', petId);
            const result = await getPetById(petId);
            console.log('Pet details result:', result);

            if (result.success && result.data) {
                setPetData(result.data as PetData);
                // Animation removed for immediate display
            } else {
                const errorMsg = result.message || 'Failed to load pet details';
                setError(errorMsg);
                Alert.alert('Error', errorMsg);
            }
        } catch (err) {
            const errorMessage = 'Failed to load pet details. Please try again.';
            setError(errorMessage);
            console.error('Load pet details error:', err);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatPetAge = (dateOfBirth: string | undefined) => {
        if (!dateOfBirth) return 'Unknown';
        
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
                return months === 1 ? '1 month old' : `${months} months old`;
            } else if (years === 1 && months === 0) {
                return '1 year old';
            } else if (months === 0) {
                return `${years} years old`;
            } else {
                return `${years}y ${months}m old`;
            }
        } catch (error) {
            return 'Unknown';
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Unknown';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Unknown';
        }
    };

    const handleSavePet = async (updatedPetData: Partial<PetData>) => {
        if (!petId || !petData) return false;

        try {
            const result = await updatePet(petId, updatedPetData);
            
            if (result.success && result.data) {
                setPetData(result.data as PetData);
                console.log('Pet updated successfully:', result.data);
                return true;
            }
            throw new Error(result.message || 'Failed to update pet');
        } catch (error) {
            console.error('Update pet error:', error);
            return false;
        }
    };

    // Debug log for modal
    console.log('=== PET DETAILS DEBUG ===', { editModalVisible, petData });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => onNavigate('Pet profile')}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#045b26" />
                </TouchableOpacity>
                <ActivityIndicator size="large" color="#045b26" />
                <Text style={{ marginTop: 16, color: '#666', fontSize: 16, fontFamily: 'Flink' }}>Loading pet details...</Text>
            </View>
        );
    }

    if (error || !petData) {
        return (
            <View style={styles.errorContainer}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => onNavigate('Pet profile')}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#045b26" />
                </TouchableOpacity>
                <MaterialIcons name="error-outline" size={64} color="#DC3545" />
                <Text style={styles.errorText}>
                    {error || 'Pet not found'}
                </Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => onNavigate('Pet profile')}
                >
                    <Text style={styles.retryButtonText}>Back to Pets</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Back Button - Fixed Position */}
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => onNavigate('Pet profile')}
            >
                <MaterialIcons name="arrow-back" size={24} color="#045b26" />
            </TouchableOpacity>

            {/* Edit Button - Fixed Position */}
            <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setEditModalVisible(true)}
            >
                <MaterialIcons name="edit" size={24} color="#045b26" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Image Section */}
                <View style={styles.heroSection}>
                    {(petData as any).photo_url ? (
                        <Image 
                            source={{ 
                                uri: (petData as any).photo_url.startsWith('http') 
                                    ? (petData as any).photo_url 
                                    : `${API_BASE_URL.replace('/api', '')}${(petData as any).photo_url}` 
                            }} 
                            style={styles.petImage}
                            onError={(error) => {
                                console.log('Error loading pet image:', error);
                                console.log('Attempted URL:', (petData as any).photo_url.startsWith('http') 
                                    ? (petData as any).photo_url 
                                    : `${API_BASE_URL.replace('/api', '')}${(petData as any).photo_url}`);
                            }}
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialCommunityIcons name="camera-off" size={64} color="#999" />
                        </View>
                    )}
                    
                    {/* Gradient Overlay with Pet Name */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.heroGradient}
                    >
                        <Text style={styles.petName}>{petData.name}</Text>
                        <Text style={styles.petId}>Pet ID: {petData.pet_id}</Text>
                    </LinearGradient>
                </View>

                {/* Content Section */}
                <View style={styles.contentSection}>
                    {/* Quick Stats Bar */}
                    <View style={styles.quickStatsBar}>
                        <View style={styles.statItem}>
                            <View style={styles.statIcon}>
                                <MaterialCommunityIcons name="calendar" size={20} color="#045b26" />
                            </View>
                            <Text style={styles.statLabel}>Age</Text>
                            <Text style={styles.statValue}>{formatPetAge(petData.date_of_birth)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={styles.statIcon}>
                                <MaterialCommunityIcons name="paw" size={20} color="#045b26" />
                            </View>
                            <Text style={styles.statLabel}>Species</Text>
                            <Text style={styles.statValue}>{petData.species}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <View style={styles.statIcon}>
                                <MaterialCommunityIcons name="gender-male-female" size={20} color="#045b26" />
                            </View>
                            <Text style={styles.statLabel}>Gender</Text>
                            <Text style={styles.statValue}>{petData.gender ? petData.gender.charAt(0).toUpperCase() + petData.gender.slice(1) : 'Unknown'}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => onNavigate('Pet MedRecords')}
                        >
                            <MaterialCommunityIcons name="file-document-outline" size={24} color="#FFFFFF" style={styles.actionButtonIcon} />
                            <Text style={styles.actionButtonText}>Medical History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.actionButtonSecondary]}
                            onPress={() => onNavigate('Pet VacCard')}
                        >
                            <MaterialCommunityIcons name="shield-check" size={24} color="#045b26" style={styles.actionButtonIcon} />
                            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Vaccination Records</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Pet Information Cards */}
                    <View style={styles.infoCardsContainer}>
                        <Text style={styles.sectionTitle}>Pet Information</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoCard}>
                                <View style={styles.infoCardIcon}>
                                    <MaterialCommunityIcons name="cake-variant" size={24} color="#045b26" />
                                </View>
                                <Text style={styles.infoCardLabel}>Birthday</Text>
                                <Text style={styles.infoCardValue}>{formatDate(petData.date_of_birth)}</Text>
                            </View>
                            <View style={styles.infoCard}>
                                <View style={styles.infoCardIcon}>
                                    <MaterialCommunityIcons name="palette" size={24} color="#045b26" />
                                </View>
                                <Text style={styles.infoCardLabel}>Color</Text>
                                <Text style={styles.infoCardValue}>{petData.color || 'Unknown'}</Text>
                            </View>
                            <View style={styles.infoCard}>
                                <View style={styles.infoCardIcon}>
                                    <MaterialCommunityIcons name="dna" size={24} color="#045b26" />
                                </View>
                                <Text style={styles.infoCardLabel}>Breed</Text>
                                <Text style={styles.infoCardValue}>{petData.breed || 'Mixed Breed'}</Text>
                            </View>
                            <View style={styles.infoCard}>
                                <View style={styles.infoCardIcon}>
                                    <MaterialCommunityIcons name="heart" size={24} color="#045b26" />
                                </View>
                                <Text style={styles.infoCardLabel}>Status</Text>
                                <Text style={styles.infoCardValue}>{petData.reproductive_status || 'Unknown'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Edit Pet Profile Modal */}
            <EditPetProfileModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                petData={petData}
                onSave={handleSavePet}
            />
        </View>
    );
} 