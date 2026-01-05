import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, RefreshControl, FlatList, Animated, TextInput } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getDashboardData, DashboardData } from '../../utils/dashboard.utils';
import { getCurrentUser } from '../../utils/auth.utils';
import { getScheduledVaccinationEvents, VaccinationEvent } from '../../utils/vaccination.utils';
import { medicalRecordsAPI } from '../../utils/medicalRecords.utils';

export default function HomePage({ onSelect }: { onSelect: (label: string) => void }) {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [vaccinationEvents, setVaccinationEvents] = useState<VaccinationEvent[]>([]);
    const [medicalRecordsCount, setMedicalRecordsCount] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    // Super fast entrance animation
    const enterOpacity = useRef(new Animated.Value(0)).current;
    const enterTranslateY = useRef(new Animated.Value(8)).current;
    
    const menuItems = [
        { label: 'Upcoming Vaccination', icon: 'calendar-clock', color: '#228B22' },
        { label: "Owner's Responsibility", icon: 'account-multiple', color: '#228B22' },
        { label: 'Animal Bite', icon: 'needle', color: '#228B22' },
        { label: 'How to Retrieve my dog?', icon: 'home', color: '#228B22' },
        { label: 'Common Signs of Rabies in Pets', icon: 'alert-circle', color: '#228B22' },
        { label: 'Safe Handling Tips for your Pets', icon: 'shield-check', color: '#228B22' },
        { label: 'Law on Pet Ownership', icon: 'gavel', color: '#228B22' },
        { label: "FAQ's and Contact Information", icon: 'help-circle', color: '#228B22' },
    ];

    useEffect(() => {
        // Force refresh on mount to ensure fresh data after login
        const initializeData = async () => {
            console.log('HomePage mounted - initializing data...');
            await loadDashboardData();
        };
        
        initializeData();
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

    // Refresh user data once on mount; further refreshes happen via pull-to-refresh
    useEffect(() => {
        const refreshUserData = async () => {
            try {
                console.log('Refreshing user data...');
                const user = await getCurrentUser();
                console.log('User data loaded:', user ? 'success' : 'failed');
                setUserData(user);
            } catch (error) {
                console.error('Error refreshing user data:', error);
                setUserData(null);
            }
        };

        refreshUserData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            console.log('Loading dashboard data...');
            
            // Load dashboard data, user data, vaccination events, and medical records in parallel
            const [dashboardResult, user, vaccinationResult, medicalRecords] = await Promise.all([
                getDashboardData(),
                getCurrentUser(),
                getScheduledVaccinationEvents(),
                medicalRecordsAPI.getMedicalRecords()
            ]);
            
            if (dashboardResult.success && dashboardResult.data) {
                setDashboardData(dashboardResult.data);
                console.log('Dashboard data loaded successfully');
            } else {
                console.error('Dashboard data error:', dashboardResult.message);
            }
            
            if (vaccinationResult.success && vaccinationResult.data) {
                setVaccinationEvents(vaccinationResult.data);
                console.log('Vaccination events loaded successfully');
            } else {
                console.error('Vaccination events error:', vaccinationResult.message);
            }
            
            // Set medical records count
            setMedicalRecordsCount(medicalRecords.length);
            console.log('Medical records count:', medicalRecords.length);
            
            // Set user data for profile image
            console.log('Setting user data:', user ? 'user found' : 'no user');
            setUserData(user);
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
            Alert.alert('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadDashboardData();
        } finally {
            setRefreshing(false);
        }
    };

    const getUserName = () => {
        // Prefer first name from full name
        if (dashboardData?.user?.name && typeof dashboardData.user.name === 'string') {
            const trimmed = dashboardData.user.name.trim();
            if (trimmed.length > 0) {
                return trimmed.split(' ')[0];
            }
        }
        // Fallback: email prefix
        if (dashboardData?.user?.email) {
            return dashboardData.user.email.split('@')[0];
        }
        return 'User';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (dateString: string) => {
        const eventDate = new Date(dateString);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getDaysRemainingText = (dateString: string) => {
        const days = getDaysRemaining(dateString);
        if (days < 0) {
            return "Done";
        }
        return `${days} days remaining`;
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        
        // If search query is empty, do nothing
        if (!query.trim()) {
            return;
        }

        // Search logic - match against menu items and quick actions
        const searchLower = query.toLowerCase();
        
        // Check menu items
        const menuMatch = menuItems.find(item => 
            item.label.toLowerCase().includes(searchLower)
        );
        
        if (menuMatch) {
            // Navigate to matched menu item
            if (menuMatch.label === 'Upcoming Vaccination') {
                onSelect('Upcoming Vaccination');
            } else if (menuMatch.label === "Owner's Responsibility") {
                onSelect("Owner's Responsibility");
            } else if (menuMatch.label === 'Animal Bite') {
                onSelect('Animal Bite');
            } else if (menuMatch.label === 'How to Retrieve my dog?') {
                onSelect('Retrieve Dog');
            } else if (menuMatch.label === 'Common Signs of Rabies in Pets') {
                onSelect('Common Signs of Rabies in Pets');
            } else if (menuMatch.label === "FAQ's and Contact Information") {
                onSelect('FAQs');
            } else {
                onSelect(menuMatch.label);
            }
            setSearchQuery(''); // Clear search after navigation
            return;
        }

        // Check quick actions
        if (searchLower.includes('pain') || searchLower.includes('assessment')) {
            onSelect('Pain Assessment');
            setSearchQuery('');
            return;
        }
        if (searchLower.includes('appointment') || searchLower.includes('book')) {
            onSelect('Appointment');
            setSearchQuery('');
            return;
        }
        if (searchLower.includes('add') || searchLower.includes('register') || searchLower.includes('new pet')) {
            onSelect('Register Pet');
            setSearchQuery('');
            return;
        }
        if (searchLower.includes('view') || searchLower.includes('my pets') || searchLower.includes('pet profile')) {
            onSelect('Pet profile');
            setSearchQuery('');
            return;
        }

        // If no match found, show alert
        Alert.alert(
            'No Results Found',
            `No matching service found for "${query}". Try searching for: Vaccination, Appointment, Pain Assessment, Pet Profile, etc.`,
            [{ text: 'OK', onPress: () => setSearchQuery('') }]
        );
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <Animated.View style={{ flex: 1, opacity: enterOpacity, transform: [{ translateY: enterTranslateY }] }}>
            <ScrollView style={{ flex: 1, padding: 16 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#045b26"]} />}>
                {/* Search Bar */}
                <View style={{ 
                    marginBottom: 24,
                    paddingHorizontal: 16,
                }}>
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 8,
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        elevation: 1,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 1,
                        },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                    }}>
                        <Ionicons name="search" size={20} color="#888888" style={{ marginRight: 16 }} />
                        <TextInput
                            style={{
                                flex: 1,
                                fontSize: 16,
                                color: '#000000',
                                fontFamily: 'Flink',
                                paddingVertical: 4,
                            }}
                            placeholder="Search for anything"
                            placeholderTextColor="#888888"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={() => handleSearch(searchQuery)}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#888888" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>


                {/* Vaccination Schedule Widget */}
                {vaccinationEvents.length > 0 && (
                    <View style={{ 
                        marginBottom: 24,
                        paddingHorizontal: 16,
                    }}>
                        {/* Header */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 16,
                        }}>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#000',
                                fontFamily: 'Jumper',
                            }}>
                                Upcoming Vaccinations
                            </Text>
                            <TouchableOpacity 
                                style={{ 
                                    backgroundColor: '#045b26',
                                    borderRadius: 20,
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                   
                                }}
                                onPress={() => onSelect('Upcoming Vaccination')}
                            >
                                <Text style={{
                                    color: 'white',
                                    fontSize: 10,
                                    fontWeight: 'bold',
                                    fontFamily: 'Jumper',
                                    marginRight: 2,
                                }}>
                                    View All
                                </Text>
                                <MaterialIcons name="arrow-forward" size={14} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Horizontal Carousel */}
                        <FlatList
                            data={vaccinationEvents}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{
                                paddingRight: 16,
                            }}
                            renderItem={({ item, index }) => (
                                <View style={{
                                    width: 280,
                                    marginRight: 16,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 20,
                                    padding: 20,
                                    borderWidth: 1,
                                    borderColor: '#E8E8E8',
                                }}>
                                    {/* Header with gradient background */}
                            <View style={{ 
                                        backgroundColor: '#045b26',
                                        borderRadius: 16,
                                        padding: 16,
                                        marginBottom: 16,
                                        flexDirection: 'row',
                                alignItems: 'center',
                                    }}>
                                        <View style={{
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            borderRadius: 12,
                                            padding: 8,
                                            marginRight: 12,
                                        }}>
                                            <MaterialCommunityIcons name="calendar-clock" size={24} color="white" />
                            </View>
                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                                color: 'white',
                                                fontFamily: 'Jumper',
                                                marginBottom: 2,
                                            }}>
                                                {item.event_title}
                                            </Text>
                                            <Text style={{
                                                fontSize: 12,
                                                color: 'rgba(255,255,255,0.8)',
                                                fontFamily: 'Flink',
                                            }}>
                                                {index + 1} of {vaccinationEvents.length}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Event Details */}
                                    <View style={{ marginBottom: 16 }}>
                                        <View style={{
                                            backgroundColor: '#F8F9FA',
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 12,
                                        }}>
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginBottom: 6,
                                            }}>
                                                <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                                                <Text style={{
                                                    fontSize: 14,
                                                    color: '#666',
                                                    fontFamily: 'Flink',
                                                    marginLeft: 6,
                                                }}>
                                                    {item.barangay}
                                                </Text>
                                </View>
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}>
                                                <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                                                <Text style={{
                                                    fontSize: 14,
                                                    color: '#666',
                                                    fontFamily: 'Flink',
                                                    marginLeft: 6,
                                                }}>
                                                    {formatDate(item.event_date)}
                                    </Text>
                                            </View>
                                        </View>

                                        {/* Days Remaining Badge */}
                                        <View style={{
                                            backgroundColor: getDaysRemaining(item.event_date) < 0 ? '#E8F5E8' : '#E8F5E8',
                                            borderRadius: 20,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            alignSelf: 'flex-start',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}>
                                            <MaterialCommunityIcons 
                                                name={getDaysRemaining(item.event_date) < 0 ? "check-circle" : "clock-outline"} 
                                                size={16} 
                                                color="#045b26" 
                                            />
                                            <Text style={{
                                                fontSize: 14,
                                                color: '#045b26',
                                                fontFamily: 'Flink',
                                                fontWeight: 'bold',
                                                marginLeft: 6,
                                            }}>
                                                {getDaysRemainingText(item.event_date)}
                                    </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                )}

                {/* Quick Stats Cards */}
                <View style={{ 
                    marginBottom: 24,
                    paddingHorizontal: 16,
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#000',
                        fontFamily: 'Jumper',
                        marginBottom: 16,
                    }}>
                        Quick Stats
                    </Text>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        {/* Total Pets Card */}
                        <View style={{
                            flex: 1,
                            backgroundColor: '#E8F5E8',
                            borderRadius: 16,
                            padding: 16,
                            marginRight: 8,
                            alignItems: 'center',
                        }}>
                            <MaterialCommunityIcons name="paw" size={24} color="#045b26" />
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#045b26',
                                marginTop: 8,
                            }}>
                                {dashboardData?.pets_count || 0}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: '#666',
                                fontFamily: 'Flink',
                                textAlign: 'center',
                            }}>
                                Total Pets
                            </Text>
                        </View>

                        {/* Upcoming Appointments Card */}
                        <View style={{
                            flex: 1,
                            backgroundColor: '#E8F5E8',
                            borderRadius: 16,
                            padding: 16,
                            marginHorizontal: 4,
                            alignItems: 'center',
                        }}>
                            <MaterialCommunityIcons name="calendar-clock" size={24} color="#045b26" />
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#045b26',
                                marginTop: 8,
                            }}>
                                {vaccinationEvents.length}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: '#666',
                                fontFamily: 'Flink',
                                textAlign: 'center',
                            }}>
                                Upcoming Events
                            </Text>
                        </View>

                        {/* Health Records Card */}
                        <View style={{
                            flex: 1,
                            backgroundColor: '#E8F5E8',
                            borderRadius: 16,
                            padding: 16,
                            marginLeft: 8,
                            alignItems: 'center',
                        }}>
                            <MaterialCommunityIcons name="file-document" size={24} color="#045b26" />
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#045b26',
                                marginTop: 8,
                            }}>
                                {medicalRecordsCount}
                            </Text>
                            <Text style={{
                                fontSize: 12,
                                color: '#666',
                                fontFamily: 'Flink',
                                textAlign: 'center',
                            }}>
                                Health Records
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={{ 
                    marginBottom: 24,
                    paddingHorizontal: 16,
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#000',
                        fontFamily: 'Jumper',
                        marginBottom: 16,
                    }}>
                        Quick Actions
                    </Text>
                <View style={{ 
                    flexDirection: 'row', 
                    flexWrap: 'wrap', 
                    justifyContent: 'space-between',
                    }}>
                        {/* Pain Assessment */}
                        <TouchableOpacity style={{
                            width: '48%',
                            backgroundColor: '#045b26',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            alignItems: 'center',
                            elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        }} onPress={() => onSelect('Pain Assessment')}>
                            <MaterialCommunityIcons name="heart-pulse" size={32} color="white" />
                            <Text style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 14,
                                textAlign: 'center',
                                fontFamily: 'Jumper',
                                marginTop: 8,
                            }}>
                                Pain Assessment
                            </Text>
                        </TouchableOpacity>

                        {/* Book Appointment */}
                        <TouchableOpacity style={{
                            width: '48%',
                            backgroundColor: '#045b26',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            alignItems: 'center',
                            elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        }} onPress={() => onSelect('Appointment')}>
                            <MaterialCommunityIcons name="calendar-plus" size={32} color="white" />
                            <Text style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 14,
                                textAlign: 'center',
                                fontFamily: 'Jumper',
                                marginTop: 8,
                            }}>
                                Book Appointment
                            </Text>
                        </TouchableOpacity>

                        {/* Add Pet */}
                        <TouchableOpacity style={{
                            width: '48%',
                            backgroundColor: '#045b26',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            alignItems: 'center',
                            elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        }} onPress={() => onSelect('Register Pet')}>
                            <MaterialCommunityIcons name="plus-circle" size={32} color="white" />
                            <Text style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 14,
                                textAlign: 'center',
                                fontFamily: 'Jumper',
                                marginTop: 8,
                            }}>
                                Add Pet
                            </Text>
                        </TouchableOpacity>

                        {/* View Pets */}
                        <TouchableOpacity style={{
                            width: '48%',
                            backgroundColor: '#045b26',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            alignItems: 'center',
                            elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        }} onPress={() => onSelect('Pet profile')}>
                            <MaterialCommunityIcons name="paw" size={32} color="white" />
                            <Text style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 14,
                                textAlign: 'center',
                                fontFamily: 'Jumper',
                                marginTop: 8,
                            }}>
                                View Pets
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Emergency Contacts */}
                <View style={{ 
                    marginBottom: 24,
                    paddingHorizontal: 16,
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#000',
                        fontFamily: 'Jumper',
                        marginBottom: 16,
                    }}>
                        Emergency Contacts
                    </Text>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        <TouchableOpacity style={{
                            flex: 1,
                            backgroundColor: '#E8F5E8',
                            borderRadius: 16,
                            padding: 16,
                            marginRight: 8,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#C8E6C9',
                        }}>
                            <MaterialCommunityIcons name="phone" size={24} color="#045b26" />
                            <Text style={{
                                fontSize: 12,
                                fontWeight: 'bold',
                                color: '#045b26',
                                fontFamily: 'Jumper',
                                marginTop: 8,
                                textAlign: 'center',
                            }}>
                                City Vet Hotline
                            </Text>
                            <Text style={{
                                fontSize: 10,
                                color: '#666',
                                fontFamily: 'Flink',
                                textAlign: 'center',
                            }}>
                                Tel. 8808-2020
                                Local 109
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{
                            flex: 1,
                            backgroundColor: '#E8F5E8',
                            borderRadius: 16,
                            padding: 16,
                            marginLeft: 8,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#C8E6C9',
                        }}>
                            <MaterialCommunityIcons name="hospital" size={24} color="#045b26" />
                            <Text style={{
                                fontSize: 12,
                                fontWeight: 'bold',
                                color: '#045b26',
                                fontFamily: 'Jumper',
                                marginTop: 8,
                                textAlign: 'center',
                            }}>
                                City Vet Office
                            </Text>
                            <Text style={{
                                fontSize: 10,
                                color: '#666',
                                fontFamily: 'Flink',
                                textAlign: 'center',
                            }}>
                                cvosanpedro0324@gmail.com
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* More Services */}
                <View style={{ 
                    marginBottom: 100,
                    paddingHorizontal: 16,
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#000',
                        fontFamily: 'Jumper',
                        marginBottom: 16,
                    }}>
                        More Services
                    </Text>
                    <View style={{ 
                        flexDirection: 'row', 
                        flexWrap: 'wrap', 
                        justifyContent: 'space-between',
                    }}>
                        {menuItems.map((item, index) => (
                    <TouchableOpacity
                            key={item.label}
                        style={{
                                width: '48%',
                                backgroundColor: '#045b26',
                                borderRadius: 16,
                                padding: 16,
                                marginBottom: 16,
                                alignItems: 'center',
                                elevation: 2,
                                minHeight: 100,
                                justifyContent: 'center'
                        }}
                            onPress={() => {
                                if (item.label === 'Upcoming Vaccination') {
                                    onSelect('Upcoming Vaccination');
                                } else if (item.label === "Owner's Responsibility") {
                                    onSelect("Owner's Responsibility");
                                } else if (item.label === 'Animal Bite') {
                                    onSelect('Animal Bite');
                                } else if (item.label === 'How to Retrieve my dog?') {
                                    onSelect('Retrieve Dog');
                                } else if (item.label === 'Common Signs of Rabies in Pets') {
                                    onSelect('Common Signs of Rabies in Pets');
                                } else if (item.label === "FAQ's and Contact Information") {
                                    onSelect('FAQs');
                                } else {
                                    onSelect(item.label);
                                }
                            }}
                    >
                            <MaterialCommunityIcons 
                                name={item.icon as any} 
                                size={28} 
                                color="white" 
                                style={{ marginBottom: 8 }}
                            />
                            <Text style={{ 
                                color: 'white', 
                                fontWeight: 'bold', 
                                fontSize: 12,
                                textAlign: 'center',
                                lineHeight: 16,
                                fontFamily: 'Jumper'
                            }}>
                                {item.label}
                            </Text>
                    </TouchableOpacity>
                ))}
                    </View>
            </View>
            </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}
