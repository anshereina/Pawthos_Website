import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, ScrollView, Image, RefreshControl, Animated, TextInput } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getPets, PetData } from '../../utils/pets.utils';
import { isAuthenticated } from '../../utils/auth.utils';
import { getApiUrl } from '../../utils/config';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#ffffff' 
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: '#fff',
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#000',
        fontFamily: 'Jumper',
    },
    addPetBtn: {
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    addPetText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 12,
        fontFamily: 'Jumper',
    },
    // Search Bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginTop: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchInput: { 
        flex: 1,
        fontSize: 16,
        color: '#000',
        fontFamily: 'Flink',
        marginLeft: 16,
        paddingVertical: 0,
    },
    searchPlaceholder: {
        color: '#888888',
    },
    
    // Quick Stats
    statsContainer: {
        marginBottom: 24,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'Jumper',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: '#E8F5E8',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    statIcon: {
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Flink',
        textAlign: 'center',
    },
    // Filter Tabs
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 4,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    filterTabActive: {
        backgroundColor: '#045b26',
    },
    filterTabInactive: {
        backgroundColor: 'transparent',
    },
    filterTabLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Jumper',
        marginLeft: 8,
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    filterTextInactive: {
        color: '#666',
    },
    filterCount: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    filterCountActive: {
        color: '#FFFFFF',
    },
    filterCountInactive: {
        color: '#045b26',
    },
    // Pet Cards
    petsContainer: {
        paddingBottom: 24,
    },
    petCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        flexDirection: 'row',
        alignItems: 'center',
    },
    petImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
        overflow: 'hidden',
    },
    petImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        resizeMode: 'cover',
    },
    petInfoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'Jumper',
        marginBottom: 4,
    },
    petInfo: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Flink',
        marginBottom: 2,
    },
    petId: {
        fontSize: 12,
        color: '#045b26',
        fontWeight: '600',
        fontFamily: 'Flink',
    },
    
    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        fontFamily: 'Jumper',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'Flink',
        textAlign: 'center',
    },
    
    // Loading State
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontFamily: 'Flink',
        textAlign: 'center',
    },
});

export default function PetProfilePage({ onNavigate, isDarkMode = false }: { onNavigate: (page: string, data?: any) => void; isDarkMode?: boolean }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [pets, setPets] = useState<PetData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Entrance animations
    const enterOpacity = useRef(new Animated.Value(0)).current;
    const enterTranslateY = useRef(new Animated.Value(8)).current;

    useEffect(() => {
        checkAuthAndLoadPets();
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(enterOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(enterTranslateY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [enterOpacity, enterTranslateY]);

    const checkAuthAndLoadPets = async () => {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            Alert.alert(
                'Authentication Required',
                'Please login to view your pets',
                [{ text: 'OK', onPress: () => onNavigate('Login') }]
            );
            return;
        }
        loadPets();
    };

    const loadPets = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Loading pets from API...');
            const result = await getPets();
            console.log('API response:', result);
            
            if (result.success && Array.isArray(result.data)) {
                setPets(result.data);
                console.log(`Loaded ${result.data.length} pets`);
                // Debug: Log pet data to see photo_url
                result.data.forEach((pet, index) => {
                    console.log(`Pet ${index + 1}:`, {
                        name: pet.name,
                        photo_url: pet.photo_url,
                        hasPhoto: !!pet.photo_url,
                        fullPhotoUrl: getPhotoUrl(pet.photo_url)
                    });
                });
            } else {
                const errorMsg = result.message || 'Failed to load pets';
                setError(errorMsg);
                console.error('Failed to load pets:', errorMsg);
                
                // Only show alert if it's not a simple "no pets" case
                if (!errorMsg.includes('No authentication token') && result.data !== null) {
                    Alert.alert('Error', errorMsg);
                }
            }
        } catch (err) {
            const errorMessage = 'Failed to load pets. Please try again.';
            setError(errorMessage);
            console.error('Load pets error:', err);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadPets();
        } finally {
            setRefreshing(false);
        }
    }, [loadPets]);



    const handlePetPress = (pet: PetData) => {
        try {
            console.log('Pet selected:', pet);
            if (!pet || !pet.id) {
                console.error('Invalid pet data:', pet);
                Alert.alert('Error', 'Invalid pet data. Please try again.');
                return;
            }
            // Navigate to pet details page with pet ID
            if (onNavigate) {
                console.log('Navigating to Pet Details with petId:', pet.id);
                onNavigate('Pet Details', { petId: pet.id });
            } else {
                console.error('onNavigate is not defined');
                Alert.alert('Error', 'Navigation is not available. Please try again.');
            }
        } catch (error) {
            console.error('Error navigating to pet details:', error);
            Alert.alert('Error', 'Failed to open pet details. Please try again.');
        }
    };

    const handleTabPress = (tabName: string) => {
        console.log('Tab pressed:', tabName);
        setActiveFilter(tabName);
        
        // Optional: Add analytics or additional logic here
        switch (tabName) {
            case 'All':
                console.log('Showing all pets');
                break;
            case 'Cats':
                console.log('Filtering to show only cats');
                break;
            case 'Dogs':
                console.log('Filtering to show only dogs');
                break;
            default:
                console.log('Unknown tab:', tabName);
        }
    };

    const getFilteredPets = () => {
        let filtered = pets;
        
        // Apply species filter
        switch (activeFilter) {
            case 'Cats':
                filtered = pets.filter(pet => {
                    const species = pet.species.toLowerCase();
                    return species === 'cat' || species === 'feline';
                });
                break;
            case 'Dogs':
                filtered = pets.filter(pet => {
                    const species = pet.species.toLowerCase();
                    return species === 'dog' || species === 'canine';
                });
                break;
            default:
                filtered = pets;
        }
        
        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(pet =>
                pet.name.toLowerCase().includes(query) ||
                pet.species.toLowerCase().includes(query) ||
                pet.pet_id.toLowerCase().includes(query) ||
                (pet.breed && pet.breed.toLowerCase().includes(query))
            );
        }
        
        return filtered;
    };

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const formatPetAge = (dateOfBirth: string | undefined) => {
        if (!dateOfBirth) return '';
        
        try {
            // Assuming dateOfBirth is in YYYY-MM-DD format from backend
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
            return '';
        }
    };

    const formatSpeciesLabel = (species: string | undefined) => {
        if (!species) return 'Unknown';
        const lower = species.toLowerCase();
        if (lower.includes('feline') || lower.includes('cat')) return 'Feline';
        if (lower.includes('canine') || lower.includes('dog')) return 'Canine';
        return species.charAt(0).toUpperCase() + species.slice(1);
    };

    // Helper function to construct full photo URL
    const getPhotoUrl = (photoUrl: string | undefined) => {
        if (!photoUrl) return null;
        
        // If it's already a full URL, return as is
        if (photoUrl.startsWith('http')) {
            return photoUrl;
        }
        
        // If it starts with /uploads/, construct full URL
        if (photoUrl.startsWith('/uploads/')) {
            const baseUrl = getApiUrl().replace('/api', '');
            return `${baseUrl}${photoUrl}`;
        }
        
        // If it's just a filename, assume it's in uploads
        const baseUrl = getApiUrl().replace('/api', '');
        return `${baseUrl}/uploads/${photoUrl}`;
    };

    const filteredPets = getFilteredPets();
    const totalPets = pets.length;
    const filteredCount = filteredPets.length;
    const cats = pets.filter(pet => {
        const species = pet.species.toLowerCase();
        return species === 'cat' || species === 'feline';
    }).length;
    const dogs = pets.filter(pet => {
        const species = pet.species.toLowerCase();
        return species === 'dog' || species === 'canine';
    }).length;
    
    // Show filtered counts when searching
    const displayStats = searchQuery.trim() ? {
        total: filteredCount,
        cats: filteredPets.filter(pet => {
            const species = pet.species.toLowerCase();
            return species === 'cat' || species === 'feline';
        }).length,
        dogs: filteredPets.filter(pet => {
            const species = pet.species.toLowerCase();
            return species === 'dog' || species === 'canine';
        }).length,
        isFiltered: true
    } : {
        total: totalPets,
        cats: cats,
        dogs: dogs,
        isFiltered: false
    };

    const backgroundColor = isDarkMode ? '#000000' : '#ffffff';
    const cardBackground = isDarkMode ? '#1a1a1a' : '#fff';
    const textColor = isDarkMode ? '#FFFFFF' : '#000';
    const secondaryTextColor = isDarkMode ? '#CCCCCC' : '#666';
    const borderColor = isDarkMode ? '#333333' : '#E0E0E0';
    const iconColor = isDarkMode ? '#045b26' : '#045b26';
    const lightBackground = isDarkMode ? '#1a1a1a' : '#E8F5E8';
    
    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            {/* Header Section */}
            <View style={[styles.header, { backgroundColor: cardBackground }]}>
                <Text style={[styles.title, { color: textColor }]}>My Pets</Text>
                <TouchableOpacity 
                    style={[styles.addPetBtn, { backgroundColor: iconColor }]}
                    onPress={() => {
                        try {
                            if (onNavigate && typeof onNavigate === 'function') {
                                console.log('Navigating to Register Pet');
                                // Use setTimeout to ensure navigation happens after current render cycle
                                setTimeout(() => {
                                    try {
                                        onNavigate('Register Pet');
                                    } catch (navError) {
                                        console.error('Navigation execution error:', navError);
                                        Alert.alert('Error', 'Failed to navigate. Please try again.');
                                    }
                                }, 100);
                            } else {
                                console.error('onNavigate is not defined or not a function');
                                Alert.alert('Error', 'Navigation is not available. Please try again.');
                            }
                        } catch (error) {
                            console.error('Navigation error:', error);
                            Alert.alert('Error', 'Failed to navigate. Please try again.');
                        }
                    }}
                >
                    <Text style={styles.addPetText}>Add Pet</Text>
                </TouchableOpacity>
            </View>

            <Animated.View style={{ flex: 1, opacity: enterOpacity, transform: [{ translateY: enterTranslateY }] }}>
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[iconColor]} />
                    }
                >
                    {/* Search Bar */}
                    <View style={[styles.searchBar, { backgroundColor: cardBackground, borderColor }]}>
                        <MaterialIcons name="search" size={20} color={secondaryTextColor} />
                        <TextInput
                            style={[styles.searchInput, { color: textColor }]}
                            placeholder="Search pets..."
                            placeholderTextColor={secondaryTextColor}
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
                                <MaterialIcons name="clear" size={20} color={secondaryTextColor} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Tabs with Counts */}
                    <View style={styles.filterContainer}>
                        {/* All Pets Tab */}
                        <TouchableOpacity 
                            style={[
                                styles.filterTab, 
                                activeFilter === 'All' ? { backgroundColor: iconColor } : { backgroundColor: 'transparent' }
                            ]}
                            onPress={() => handleTabPress('All')}
                        >
                            <View style={styles.filterTabLeft}>
                                <MaterialCommunityIcons 
                                    name="paw" 
                                    size={20} 
                                    color={activeFilter === 'All' ? '#FFFFFF' : iconColor} 
                                />
                                <Text style={[
                                    styles.filterText, 
                                    { color: activeFilter === 'All' ? '#FFFFFF' : secondaryTextColor }
                                ]}>
                                    All
                                </Text>
                            </View>
                            <Text style={[
                                styles.filterCount,
                                { color: activeFilter === 'All' ? '#FFFFFF' : iconColor }
                            ]}>
                                {displayStats.total}
                            </Text>
                        </TouchableOpacity>
                        
                        {/* Cats Tab */}
                        <TouchableOpacity 
                            style={[
                                styles.filterTab, 
                                activeFilter === 'Cats' ? { backgroundColor: iconColor } : { backgroundColor: 'transparent' }
                            ]}
                            onPress={() => handleTabPress('Cats')}
                        >
                            <View style={styles.filterTabLeft}>
                                <MaterialCommunityIcons 
                                    name="cat" 
                                    size={20} 
                                    color={activeFilter === 'Cats' ? '#FFFFFF' : iconColor} 
                                />
                                <Text style={[
                                    styles.filterText, 
                                    { color: activeFilter === 'Cats' ? '#FFFFFF' : secondaryTextColor }
                                ]}>
                                    Cats
                                </Text>
                            </View>
                            <Text style={[
                                styles.filterCount,
                                { color: activeFilter === 'Cats' ? '#FFFFFF' : iconColor }
                            ]}>
                                {displayStats.cats}
                            </Text>
                        </TouchableOpacity>
                        
                        {/* Dogs Tab */}
                        <TouchableOpacity 
                            style={[
                                styles.filterTab, 
                                activeFilter === 'Dogs' ? { backgroundColor: iconColor } : { backgroundColor: 'transparent' }
                            ]}
                            onPress={() => handleTabPress('Dogs')}
                        >
                            <View style={styles.filterTabLeft}>
                                <MaterialCommunityIcons 
                                    name="dog" 
                                    size={20} 
                                    color={activeFilter === 'Dogs' ? '#FFFFFF' : iconColor} 
                                />
                                <Text style={[
                                    styles.filterText, 
                                    { color: activeFilter === 'Dogs' ? '#FFFFFF' : secondaryTextColor }
                                ]}>
                                    Dogs
                                </Text>
                            </View>
                            <Text style={[
                                styles.filterCount,
                                { color: activeFilter === 'Dogs' ? '#FFFFFF' : iconColor }
                            ]}>
                                {displayStats.dogs}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Loading State */}
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={iconColor} />
                            <Text style={[styles.loadingText, { color: textColor }]}>Loading pets...</Text>
                        </View>
                    )}

                    {/* Error State */}
                    {!loading && error && (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons 
                                name="error-outline" 
                                size={64} 
                                color="#E0E0E0" 
                                style={styles.emptyIcon} 
                            />
                            <Text style={styles.emptyTitle}>Error Loading Pets</Text>
                            <Text style={styles.emptyText}>{error}</Text>
                            <TouchableOpacity 
                                style={styles.addPetBtn}
                                onPress={loadPets}
                            >
                                <Text style={styles.addPetText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Pets List */}
                    {!loading && !error && (
                        <>
                            {filteredPets.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <MaterialCommunityIcons 
                                        name="paw-off" 
                                        size={64} 
                                        color={secondaryTextColor} 
                                        style={styles.emptyIcon} 
                                    />
                                    <Text style={[styles.emptyTitle, { color: textColor }]}>
                                        {activeFilter === 'All' ? 'No Pets Found' : `No ${activeFilter} Found`}
                                    </Text>
                                    <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                                        {activeFilter === 'All' 
                                            ? 'You haven\'t registered any pets yet.' 
                                            : `You don't have any ${activeFilter.toLowerCase()} registered.`}
                                    </Text>
                                    {activeFilter === 'All' && (
                                        <TouchableOpacity 
                                            style={[styles.addPetBtn, { backgroundColor: iconColor }]}
                                            onPress={() => onNavigate('Register Pet')}
                                        >
                                            <Text style={styles.addPetText}>Add Your First Pet</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.petsContainer}>
                                    {filteredPets.map((pet) => (
                                        <TouchableOpacity 
                                            key={pet.id} 
                                            style={[styles.petCard, { backgroundColor: cardBackground, borderColor }]}
                                            onPress={() => handlePetPress(pet)}
                                            activeOpacity={0.9}
                                        >
                                            <View style={[styles.petImageContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#F5F5F5' }]}>
                                                {pet.photo_url ? (
                                                    <Image 
                                                        source={{ uri: getPhotoUrl(pet.photo_url) || '' }} 
                                                        style={styles.petImage}
                                                        onError={() => console.log('Failed to load pet image:', pet.photo_url, 'Full URL:', getPhotoUrl(pet.photo_url))}
                                                        onLoad={() => console.log('Successfully loaded pet image:', pet.photo_url, 'Full URL:', getPhotoUrl(pet.photo_url))}
                                                    />
                                                ) : (
                                                    <MaterialCommunityIcons 
                                                        name="camera-off" 
                                                        size={40} 
                                                        color={secondaryTextColor} 
                                                    />
                                                )}
                                            </View>
                                            <View style={styles.petInfoContainer}>
                                                <Text style={[styles.petName, { color: textColor }]}>{pet.name}</Text>
                                                <Text style={[styles.petInfo, { color: secondaryTextColor }]}>{formatSpeciesLabel(pet.species)} • {formatPetAge(pet.date_of_birth)}</Text>
                                                <Text style={[styles.petId, { color: iconColor }]}>ID: {pet.pet_id}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}
