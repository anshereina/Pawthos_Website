import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions, Animated, Easing, BackHandler } from "react-native";
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
// Navigation using expo-router
import { useRouter } from "expo-router";
import { useFonts } from 'expo-font';
import BottomNavigationBar from './components/BottomNavigationBar';
import BottomGradient from './components/BottomGradient';
import HomePage from './pages/HomePage';
import { API_BASE_URL } from '../utils/config';
import FAQsPage from './pages/FAQsPage';
import MyAccountPage from './pages/MyAccountPage';
import AppointmentPage from './pages/AppointmentPage';
import AppointmentSchedulingPage from './pages/AppointmentSchedulingPage';
import PetProfilePage from './pages/PetProfilePage';
import RegisterPetPage from './pages/RegisterPetPage';
import PetDetailsPage from './pages/PetDetailsPage';
import PetVacCardPage from './pages/PetVacCardPage';
import PetMedRecordsPage from './pages/PetMedRecordsPage';
import VaccineRecordsPage from './pages/VaccineRecordsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import VetHealthPage from './pages/VetHealthPage';
import CertificatePage from './pages/CertificatePage';
import NotificationPage from './pages/NotificationPage';
import UpcomingVaccinationPage from './pages/UpcomingVaccinationPage';
import OwnersResponsibilityPage from './pages/OwnersResponsibilityPage';
import AnimalBitePage from './pages/AnimalBitePage';
import LawOnPetOwnershipPage from './pages/LawOnPetOwnershipPage';
import SafeHandlingTipsPage from './pages/SafeHandlingTipsPage';
import SignOfRabiesPage from './pages/SignOfRabiesPage';
import IntegrationPage from './pages/IntegrationPage';
import PainAssessmentLandingPage from './pages/PainAssessmentLandingPage';
import ConfirmLogoutModal from './modals/ConfirmLogoutModal';
import { logout as performLogout, getCurrentUser } from '../utils/auth.utils';
import { getDashboardData, DashboardData } from '../utils/dashboard.utils';
import { getUserAlerts } from '../utils/alerts.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CanineIntegrationPage from './pages/CanineIntegrationPage';
import CanineGuidelineIntegrationPage from './pages/CanineGuidelineIntegrationPage';
import CanineIntegrationQuestionPage from './pages/CanineIntegrationQuestionPage';
import CanineIntegrationResultPage from './pages/CanineIntegrationResultPage';
import IntegrationQuestionsPage from './pages/IntegrationQuestionsPage';
import IntegrationPicturePage from './pages/IntegrationPicturePage';
import IntegrationImageResultPage from './pages/IntegrationImageResultPage';
import IntegrationScanningPage from './pages/IntegrationScanningPage';
import IntegrationResultPage from './pages/IntegrationResultPage';
import RetrieveDogPage from './pages/RetrieveDogPage';
import PainAssessmentPage from './pages/PainAssessmentPage';

const MENU_STRUCTURE = [
    { label: 'Home', icon: 'home' },
    { label: 'My account', icon: 'person' },
    { label: 'Appointment', icon: 'event' },
    {
        label: 'My Pets', icon: 'pets', children: [
            { label: 'Pet profile', icon: 'pets' },
            { label: 'Pain Assessment', icon: 'healing' },
            { label: 'Pain Assessment History', icon: 'history' },
            { label: 'Vaccine Records', icon: 'vaccines' },
            { label: 'Medical Records', icon: 'medical-services' },
            { label: 'Health Certificate', icon: 'verified' },
        ]
    },
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    contentContainer: { flex: 1 },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // changed from 'space-between'
        backgroundColor: '#ffffff',
        height: 125, // increased height
        paddingHorizontal: 16,
        paddingTop: 32,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }, // logoRow now floats right
    logo: { width: 36, height: 36, marginLeft: 8 },
    appName: {
        fontSize: 24, 
        color: '#000000',
        fontWeight: 'bold',
        // fontFamily: 'IrishGrover', // Made optional to prevent crashes
    },
    homeHeaderLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: 8,
    },
    avatarButton: {
        padding: 4,
        marginRight: 12,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    defaultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#045b26',
        alignItems: 'center',
        justifyContent: 'center',
    },
    greetingContainer: {
        flex: 1,
    },
    greetingText: {
        fontSize: 24,
        color: '#045b26',
        fontWeight: 'bold',
        // fontFamily: 'IrishGrover', // Made optional to prevent crashes
    },
    petsCountText: {
        fontSize: 14,
        color: '#000000',
        // fontFamily: 'IrishGrover', // Made optional to prevent crashes
        fontWeight: 'bold',
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    notificationButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    notificationBadgeText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    menuButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    pageTitle: {
        fontSize: 20,
        color: '#045b26',
        fontWeight: 'bold',
        // fontFamily: 'IrishGrover', // Made optional to prevent crashes
        flex: 1,
        textAlign: 'center',
    },
    drawerOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 10,
    },
    drawer: {
        position: 'absolute',
        top: 0, 
        right: 0, 
        bottom: 0,
        width: 280,
        backgroundColor: '#FFFFFF',
        zIndex: 100,
        paddingTop: 50,
        paddingHorizontal: 0,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    drawerHeader: {
        backgroundColor: '#045b26',
        marginHorizontal: 12,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    drawerHeaderText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
        // fontFamily: 'IrishGrover', // Made optional to prevent crashes
        marginBottom: 2,
    },
    drawerSubtext: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        // fontFamily: 'IrishGrover', // Made optional to prevent crashes
    },
    menuSection: {
        marginBottom: 4,
    },
    menuCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 12,
        marginVertical: 2,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F8F0',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
    },
    menuItemActive: {
        backgroundColor: '#F8FFF8',
        borderLeftWidth: 3,
        borderLeftColor: '#045b26',
    },
    menuIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F0F8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuIconContainerActive: {
        backgroundColor: '#045b26',
    },
    menuText: {
        fontSize: 15,
        color: '#2D3748',
        fontWeight: '600',
        // fontFamily: 'IrishGrover', // Made optional to prevent crashes
        flex: 1,
    },
    menuTextActive: {
        color: '#045b26',
        fontWeight: 'bold',
    },
    expandIcon: {
        marginLeft: 6,
    },
    submenu: {
        backgroundColor: '#FAFAFA',
        paddingLeft: 12,
    },
    submenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        paddingLeft: 44,
    },
    submenuText: {
        fontSize: 14,
        color: '#4A5568',
        // fontFamily: 'IrishGrover', // Made optional to prevent crashes
        marginLeft: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F8F0',
        marginHorizontal: 16,
        marginVertical: 8,
    },
    logout: {
        position: 'absolute',
        bottom: 16,
        left: 12,
        right: 12,
    },
    logoutCard: {
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FED7D7',
        overflow: 'hidden',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    logoutIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#FED7D7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    logoutText: {
        fontSize: 15,
        color: '#E53E3E',
        fontWeight: 'bold',
        // fontFamily: 'IrishGrover', // Made optional to prevent crashes
    },
});

function CollapsibleMenu({ open, onClose, setSelectedMenu, onRequestLogout, addToHistory }: { open: boolean, onClose: () => void, setSelectedMenu: (label: string) => void, onRequestLogout: () => void, addToHistory: (page: string, data?: any) => void }) {
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const slideAnim = useRef(new Animated.Value(280)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (open) {
            setIsVisible(true);
            const duration = hasAnimated ? 300 : 0; // No animation on first render
            
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: duration,
                    easing: Easing.out(Easing.bezier(0.25, 0.46, 0.45, 0.94)),
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: duration,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (!hasAnimated) setHasAnimated(true);
            });
        } else {
            const duration = hasAnimated ? 250 : 0;
            
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 280,
                    duration: duration,
                    easing: Easing.in(Easing.bezier(0.55, 0.055, 0.675, 0.19)),
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: duration,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (duration > 0) {
                    setIsVisible(false);
                } else {
                    setIsVisible(false);
                }
            });
        }
    }, [open, hasAnimated]);

    const handleExpand = (label: string) => {
        setExpanded((prev: { [key: string]: boolean }) => ({ ...prev, [label]: !prev[label] }));
    };

    const handleMenuSelect = (label: string) => {
        if (label === 'Logout') {
            onClose();
            onRequestLogout();
        } else if (label === 'Health Certificate') {
            addToHistory('Vet Health Cert');
            setSelectedMenu('Vet Health Cert');
            onClose();
        } else {
            addToHistory(label);
            setSelectedMenu(label);
            onClose();
        }
    };

    return (
        <>
            {isVisible && (
                <Animated.View 
                    style={[styles.drawerOverlay, { opacity: overlayOpacity }]}
                >
                    <TouchableOpacity 
                        style={{ flex: 1 }}
                        onPress={onClose} 
                        activeOpacity={1} 
                    />
                </Animated.View>
            )}
            {isVisible && (
                <Animated.View style={[
                    styles.drawer, 
                    { 
                        transform: [{ translateX: slideAnim }] 
                    }
                ]}> 
                {/* Modern Header */}
                <View style={styles.drawerHeader}>
                    <Text style={styles.drawerHeaderText}>Menu</Text>
                    <Text style={styles.drawerSubtext}>Navigate through the app</Text>
                </View>
                
                <ScrollView 
                    style={{ flex: 1 }} 
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                >
                    {MENU_STRUCTURE.map((item, idx) => (
                        <View key={item.label} style={styles.menuSection}>
                            <View style={styles.menuCard}>
                                <TouchableOpacity
                                    style={[
                                        styles.menuItem,
                                        // Add active state styling if needed
                                    ]}
                                    onPress={() => item.children ? handleExpand(item.label) : handleMenuSelect(item.label)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.menuIconContainer,
                                        // Add active icon container styling if needed
                                    ]}>
                                        <MaterialIcons 
                                            name={item.icon as any} 
                                            size={20} 
                                            color="#045b26" 
                                        />
                                    </View>
                                    <Text style={[
                                        styles.menuText,
                                        // Add active text styling if needed
                                    ]}>{item.label}</Text>
                                    {item.children && (
                                        <MaterialIcons
                                            name={expanded[item.label] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                            size={20}
                                            color="#4A5568"
                                            style={styles.expandIcon}
                                        />
                                    )}
                                </TouchableOpacity>
                                {item.children && expanded[item.label] && (
                                    <View style={styles.submenu}>
                                        {item.children.map((sub, subIdx) => (
                                            <TouchableOpacity
                                                key={sub.label}
                                                style={styles.submenuItem}
                                                onPress={() => handleMenuSelect(sub.label)}
                                                activeOpacity={0.7}
                                            >
                                                <MaterialIcons 
                                                    name={sub.icon as any} 
                                                    size={16} 
                                                    color="#4A5568" 
                                                />
                                                <Text style={styles.submenuText}>{sub.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                            {idx < MENU_STRUCTURE.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </ScrollView>
                
                {/* Modern Logout Section */}
                <View style={styles.logout}>
                    <View style={styles.logoutCard}>
                        <TouchableOpacity
                            style={styles.logoutBtn}
                            onPress={() => {
                                onClose();
                                onRequestLogout();
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={styles.logoutIconContainer}>
                                <MaterialIcons name="logout" size={18} color="#E53E3E" />
                            </View>
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
            )}
        </>
    );
}

export default function MainApp() {
    const router = useRouter();
    const [fontsLoaded] = useFonts({
        IrishGrover: require('../assets/fonts/IrishGrover-Regular.ttf'),
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('Home');
    const [appointmentType, setAppointmentType] = useState<string | undefined>(undefined);
    const [navigationData, setNavigationData] = useState<any>({});
    const [selectedPetType, setSelectedPetType] = useState<string>('dog');
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [activeBottomTab, setActiveBottomTab] = useState('home');
    const [userData, setUserData] = useState<any>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [currentQuestionCategory, setCurrentQuestionCategory] = useState<string>('');
    const [navigationHistory, setNavigationHistory] = useState<{page: string, data?: any}[]>([{page: 'Home'}]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    
    // Simplified sidebar - no animations needed

    // Function to get proper page title
    const getPageTitle = (menu: string) => {
        switch (menu) {
            case 'CanineIntegration':
                return "Dog's Pain Assessment";
            case 'CanineGuidelineIntegration':
                return "Canine Pain Assessment Guide";
            case 'CanineIntegrationQuestion':
                return currentQuestionCategory || "Assessment Questions";
            case 'CanineIntegrationResult':
                return "Results";
            case 'IntegrationResult':
                return "Result";
            case 'IntegrationQuestionsCat':
                return "Cat's Pain Assessment";
            default:
                return menu;
        }
    };

    // Handle category change from question page
    const handleCategoryChange = (category: string) => {
        setCurrentQuestionCategory(category);
    };

    // Add page to navigation history
    const addToHistory = (page: string, data?: any) => {
        setNavigationHistory(prev => {
            // Don't add the same page consecutively
            if (prev[prev.length - 1]?.page === page) {
                return prev;
            }
            // Keep only last 10 pages to prevent memory issues
            const newHistory = [...prev, {page, data}];
            return newHistory.slice(-10);
        });
    };

    // Get the previous page from history
    const getPreviousPage = () => {
        if (navigationHistory.length <= 1) {
            return {page: 'Home'};
        }
        // Return the second to last page (since last is current page)
        return navigationHistory[navigationHistory.length - 2];
    };

    // Navigate back to previous page
    const navigateBack = () => {
        if (navigationHistory.length <= 1) {
            // Always go to Home, never to login
            setNavigationHistory([{page: 'Home'}]);
            setSelectedMenu('Home');
            return;
        }
        
        // Remove current page from history and go to previous
        const newHistory = navigationHistory.slice(0, -1);
        setNavigationHistory(newHistory);
        const previousPageInfo = newHistory[newHistory.length - 1];
        
        // Restore navigation data if it exists
        if (previousPageInfo.data) {
            setNavigationData(previousPageInfo.data);
        }
        
        setSelectedMenu(previousPageInfo.page);
    };
    

    // Function to refresh user data (exposed for pages to call)
    const refreshUserData = async () => {
        try {
            console.log('Refreshing user data...');
            const user = await getCurrentUser();
            console.log('User data refreshed:', user);
            setUserData(user);
        } catch (error) {
            console.error('Error loading user data:', error);
            setUserData(null);
        }
    };

    // Function to refresh dashboard data
    const refreshDashboardData = async () => {
        try {
            console.log('Refreshing dashboard data...');
            const result = await getDashboardData();
            if (result.success && result.data) {
                setDashboardData(result.data);
                console.log('Dashboard data refreshed, pets count:', result.data.pets_count);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setDashboardData(null);
        }
    };

    // Function to refresh notification count
    const refreshNotificationCount = async () => {
        try {
            const user = await getCurrentUser();
            if (user && user.email) {
                const alerts = await getUserAlerts(user.email);
                
                // Load read and cleared notification IDs from AsyncStorage (same keys as NotificationPage)
                const READ_NOTIFICATIONS_KEY = '@read_notifications';
                const CLEARED_NOTIFICATIONS_KEY = '@cleared_notifications';
                
                const [readStoredData, clearedStoredData] = await Promise.all([
                    AsyncStorage.getItem(READ_NOTIFICATIONS_KEY),
                    AsyncStorage.getItem(CLEARED_NOTIFICATIONS_KEY)
                ]);
                
                const readIds = readStoredData ? new Set(JSON.parse(readStoredData)) : new Set();
                const clearedIds = clearedStoredData ? new Set(JSON.parse(clearedStoredData)) : new Set();
                
                // Filter out cleared notifications and count only unread ones
                const unreadCount = alerts.filter(alert => 
                    !clearedIds.has(alert.id) && !readIds.has(alert.id)
                ).length;
                
                setNotificationCount(unreadCount);
                console.log('Notification count refreshed - Total:', alerts.length, 'Unread:', unreadCount);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            setNotificationCount(0);
        }
    };

    // Handle Android back button
    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Prevent default behavior (app exit)
            // Instead, navigate back within the app
            navigateBack();
            return true; // Prevent default back action
        });

        return () => backHandler.remove();
    }, [navigationHistory]);

    // Load user data and dashboard data on mount
    React.useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = await getCurrentUser();
                setUserData(user);
            } catch (error) {
                console.error('Error loading user data:', error);
                setUserData(null);
            }
        };

        loadUserData();
        refreshDashboardData();
        refreshNotificationCount();
    }, []);

    // Refresh data when navigating from My account or Pet profile pages
    React.useEffect(() => {
        const previousPage = navigationHistory[navigationHistory.length - 2]?.page;
        
        // Refresh user data when coming from My account page
        if (selectedMenu === 'My account' || previousPage === 'My account') {
            console.log('Detected navigation involving My account, refreshing user data...');
            refreshUserData();
        }
        
        // Refresh dashboard data when coming from Pet-related pages
        if (selectedMenu === 'Home' || 
            previousPage === 'Pet profile' || 
            previousPage === 'Register Pet' ||
            previousPage === 'Pet Details') {
            console.log('Detected navigation involving Pets, refreshing dashboard data...');
            refreshDashboardData();
        }

        // Refresh notification count when coming from Notification page OR navigating to Home
        if (previousPage === 'Notification' || selectedMenu === 'Home') {
            console.log('Detected navigation involving notifications, refreshing notification count...');
            refreshNotificationCount();
        }
    }, [selectedMenu]);

    // Update bottom tab state whenever selectedMenu changes
    React.useEffect(() => {
        updateBottomTabState(selectedMenu);
    }, [selectedMenu]);

    const requestLogout = () => setLogoutVisible(true);
    const cancelLogout = () => setLogoutVisible(false);
    const confirmLogout = async () => {
        try {
            console.log('Logging out user...');
            await performLogout();
            setLogoutVisible(false);
            // Use router.replace to navigate to login and prevent going back
            router.replace('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still navigate to login even if logout fails
            setLogoutVisible(false);
            router.replace('/login');
        }
    };

    const handleNavigation = (page: string, appointmentTypeParam?: string) => {
        if (appointmentTypeParam) {
            setAppointmentType(appointmentTypeParam);
        }
        addToHistory(page);
        setSelectedMenu(page);
    };

    const navigateWithData = (page: string, data?: any) => {
        setNavigationData(data || {});
        addToHistory(page, data);
        setSelectedMenu(page);
    };

    const getUserName = () => {
        if (userData?.name) {
            return userData.name;
        }
        if (userData?.email) {
            // Extract name from email if no name is set
            return userData.email.split('@')[0];
        }
        return 'User';
    };

    // Map page names to bottom tab states
    const getBottomTabForPage = (page: string): string => {
        switch (page) {
            case 'Home':
                return 'home';
            case 'Appointment':
            case 'Appointment Scheduling':
                return 'appointments';
            case 'Pain Assessment':
            case 'Integration':
            case 'CanineIntegration':
            case 'CanineGuidelineIntegration':
            case 'CanineIntegrationQuestion':
            case 'CanineIntegrationResult':
            case 'IntegrationQuestionsDog':
            case 'IntegrationQuestionsCat':
            case 'IntegrationPicture':
            case 'IntegrationScanning':
            case 'IntegrationImageResult':
            case 'IntegrationResult':
                return 'pain-assessment';
            case 'Pet profile':
            case 'Register Pet':
            case 'Pet Details':
            case 'Pet VacCard':
            case 'Pet MedRecords':
            case 'Vaccine Records':
            case 'Medical Records':
                return 'pets';
            case 'My account':
                return 'profile';
            default:
                // For other pages, try to maintain current tab if it makes sense
                return activeBottomTab;
        }
    };

    // Update bottom tab state when page changes
    const updateBottomTabState = (page: string) => {
        const newTab = getBottomTabForPage(page);
        setActiveBottomTab(newTab);
    };

    const handleBottomTabPress = (tab: string) => {
        setActiveBottomTab(tab);
        let targetPage = '';
        switch (tab) {
            case 'home':
                targetPage = 'Home';
                break;
            case 'appointments':
                targetPage = 'Appointment';
                break;
            case 'pain-assessment':
                targetPage = 'Pain Assessment';
                break;
            case 'pets':
                targetPage = 'Pet profile';
                break;
            case 'profile':
                targetPage = 'My account';
                break;
            default:
                break;
        }
        if (targetPage) {
            addToHistory(targetPage);
            setSelectedMenu(targetPage);
        }
    };

    // Don't block on font loading - proceed anyway
    // if (!fontsLoaded) return null;

    // Navigation wrapper that tracks history
    const navigateToPage = (page: string) => {
        addToHistory(page);
        setSelectedMenu(page);
    };

    // Modular page mapping
    const pageMap: Record<string, any> = {
        Home: <HomePage onSelect={navigateToPage} />, 
        "My account": <MyAccountPage onUserDataUpdate={refreshUserData} />, 
        "Appointment": <AppointmentPage onNavigate={navigateWithData} />, 
        "Appointment Scheduling": <AppointmentSchedulingPage key={navigationData.appointmentToEdit?.id || 'new'} initialAppointmentType={appointmentType} onBack={navigateBack} onNavigate={navigateToPage} {...navigationData} />, 
        "Pet profile": <PetProfilePage onNavigate={navigateWithData} />,
        "Register Pet": <RegisterPetPage onNavigate={navigateToPage} />, 
        "Pet Details": <PetDetailsPage onNavigate={navigateWithData as any} petId={navigationData.petId} />, 
        "Pet VacCard": <PetVacCardPage onNavigate={navigateWithData} />, 
        "Pet MedRecords": <PetMedRecordsPage onNavigate={navigateWithData} petId={navigationData.petId} />, 
        "Vaccine Records": <VaccineRecordsPage onNavigate={navigateToPage} />, 
        "Medical Records": <MedicalRecordsPage onNavigate={navigateToPage} />, 
        "Vet Health Cert": <VetHealthPage onNavigate={handleNavigation} />, 
        "Certificate": <CertificatePage />, 
        "Vet Health": <VetHealthPage onNavigate={handleNavigation} />, 
        "FAQs": <FAQsPage />, 
        "Notification": <NotificationPage />,
        "Upcoming Vaccination": <UpcomingVaccinationPage onBack={navigateBack} />,
        "Owner's Responsibility": <OwnersResponsibilityPage onBack={navigateBack} />,
        "Animal Bite": <AnimalBitePage onBack={navigateBack} />,
        "Safe Handling Tips for your Pets": <SafeHandlingTipsPage onBack={navigateBack} />,
        "Law on Pet Ownership": <LawOnPetOwnershipPage onBack={navigateBack} />,
        "Retrieve Dog": <RetrieveDogPage onBack={navigateBack} />,
                    "Common Signs of Rabies in Pets": <SignOfRabiesPage onBack={navigateBack} />,
            "Pain Assessment": <PainAssessmentLandingPage onGetStarted={() => navigateToPage('Integration')} onBack={navigateBack} onViewHistory={() => navigateToPage('Pain Assessment History')} />,
            "Pain Assessment History": <PainAssessmentPage onNavigate={navigateToPage} />,
            "Integration": <IntegrationPage onSelect={navigateToPage} />,
                "CanineIntegration": <CanineIntegrationPage onSelect={navigateToPage} />,
    "CanineGuidelineIntegration": <CanineGuidelineIntegrationPage onSelect={navigateToPage} />,
    "CanineIntegrationQuestion": <CanineIntegrationQuestionPage 
        onSelect={(label, data) => {
            if (data) {
                setNavigationData(data);
            }
            navigateToPage(label);
        }} 
        onCategoryChange={handleCategoryChange}
    />,
    "CanineIntegrationResult": <CanineIntegrationResultPage 
        onSecondOpinion={() => navigateToPage('CanineIntegration')}
        onHome={() => navigateToPage('Home')} 
        onSecondOpinionAppointment={async () => {
            try {
                // First try to read from saved pet info (after assessment was saved)
                let petInfoString = await AsyncStorage.getItem('canineAssessmentPetInfo');
                if (!petInfoString) {
                    // Fallback to current assessment data (before saving)
                    petInfoString = await AsyncStorage.getItem('currentAssessmentData');
                }
                
                if (petInfoString) {
                    const petData = JSON.parse(petInfoString);
                    // Store pet data for appointment scheduling
                    setNavigationData({
                        prefilledPet: {
                            pet_id: petData.pet_id,
                            pet_name: petData.pet_name,
                            pet_type: petData.pet_type || 'dog'
                        }
                    });
                }
            } catch (error) {
                console.error('Error reading pet data for second opinion:', error);
            }
            setAppointmentType('Consultation');
            navigateToPage('Appointment Scheduling');
        }}
        selectedAnswers={navigationData.beaap_answers || []}
    />,
    "IntegrationQuestionsDog": <IntegrationQuestionsPage petType="dog" onBack={() => navigateToPage('CanineIntegration')} onNext={() => { setSelectedPetType('dog'); navigateToPage('IntegrationPicture'); }} />,
        "IntegrationQuestionsCat": <IntegrationQuestionsPage petType="cat" onBack={() => navigateToPage('Integration')} onNext={() => { setSelectedPetType('cat'); navigateToPage('IntegrationPicture'); }} />,
        "IntegrationPicture": <IntegrationPicturePage 
            onStartScan={(imageUri: string) => { setNavigationData({ capturedImage: imageUri }); navigateToPage('IntegrationScanning'); }}
            onResult={(result, imageUri) => { setNavigationData({ painLevel: result, capturedImage: imageUri }); navigateToPage('IntegrationImageResult'); }} 
            onBack={() => navigateToPage('Integration')} 
        />,
        "IntegrationScanning": <IntegrationScanningPage 
            imageUri={navigationData.capturedImage}
            onDone={(result: any, imageUri?: string) => { setNavigationData(prev => ({ ...prev, apiResult: result, capturedImage: imageUri || prev.capturedImage })); navigateToPage('IntegrationResult'); }}
            onCancel={() => navigateToPage('IntegrationPicture')}
        />,
        "IntegrationImageResult": <IntegrationImageResultPage onRetake={() => navigateToPage('IntegrationPicture')} onSeeResult={() => navigateToPage('IntegrationResult')} capturedImage={navigationData.capturedImage} />,
        "IntegrationResult": (() => {
          console.log('🔍 IntegrationResult - navigationData:', navigationData);
          console.log('🔍 IntegrationResult - apiResult:', navigationData.apiResult);
          return <IntegrationResultPage 
            onSecondOpinion={() => navigateToPage('IntegrationPicture')} 
            onHome={() => navigateToPage('Home')} 
            onSave={() => navigateToPage('Pain Assessment')}
            onTakeAnotherPicture={() => navigateToPage('IntegrationPicture')}
            painLevel={navigationData.apiResult?.pain_level}
            fgsBreakdown={navigationData.apiResult?.fgs_breakdown}
            detailedExplanation={navigationData.apiResult?.detailed_explanation}
            actionableAdvice={navigationData.apiResult?.actionable_advice}
            landmarkAnalysis={navigationData.apiResult?.landmark_analysis}
            visualLandmarks={navigationData.apiResult?.visual_landmarks}
            capturedImage={navigationData.capturedImage}
            apiResult={navigationData.apiResult}
            onSecondOpinionAppointment={async () => {
                try {
                    // First try to read from saved feline pet info (after assessment was saved)
                    let petInfoString = await AsyncStorage.getItem('felineAssessmentPetInfo');
                    if (!petInfoString) {
                        // Fallback to current assessment data (before saving), if it still exists
                        petInfoString = await AsyncStorage.getItem('currentAssessmentData');
                    }
                    
                    if (petInfoString) {
                        const petData = JSON.parse(petInfoString);
                        const petRegisteredFlag = petData?.pet_registered || petData?.petRegistered;
                        console.log('Using felineAssessmentPetInfo for Second Opinion appointment:', petData);

                        // Only lock the pet dropdown when the cat is registered.
                        if (petRegisteredFlag === 'yes') {
                            setNavigationData({
                                prefilledPet: {
                                    pet_id: petData.pet_id,
                                    pet_name: petData.pet_name,
                                    pet_type: petData.pet_type || 'cat'
                                }
                            });
                        } else {
                            // Unregistered cat: ensure the appointment form stays free-text for pet name
                            setNavigationData((prev) => ({ ...prev, prefilledPet: undefined }));
                        }
                    } else {
                        console.warn('No felineAssessmentPetInfo or currentAssessmentData found for Second Opinion');
                    }
                } catch (error) {
                    console.error('Error reading feline pet data for second opinion:', error);
                }
                setAppointmentType('Consultation');
                navigateToPage('Appointment Scheduling');
            }}
            petType={selectedPetType} 
            severityLevel="Unknown"
          />;
        })(),
        // Add more pages here as you modularize them
    };

    let content = pageMap[selectedMenu] || (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, color: '#045b26', fontWeight: 'bold' }}>{selectedMenu} (placeholder)</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Hide navbar for Pet Details and Integration pages to enable full-screen experience */}
            {selectedMenu !== 'Pet Details' && 
             !selectedMenu.includes('Integration') && 
             !selectedMenu.includes('Canine') && (
                <View style={styles.navbar}>
                    {(selectedMenu === 'Home' || selectedMenu === 'Appointment' || selectedMenu === 'Pain Assessment' || selectedMenu === 'Pet profile' || selectedMenu === 'My account') ? (
                        // Base pages layout (Home, Appointment, Pain Assessment, Pet profile, My account, Integration)
                        <>
                            <View style={styles.homeHeaderLeft}>
                                <TouchableOpacity style={styles.avatarButton} onPress={() => navigateToPage('My account')}>
                                    {userData?.photo_url ? (
                                        <Image 
                                            key={userData.photo_url}
                                            source={{ 
                                                uri: (userData.photo_url.startsWith('http') 
                                                    ? userData.photo_url 
                                                    : `${API_BASE_URL.replace('/api', '')}${userData.photo_url}`) + `?t=${Date.now()}`
                                            }} 
                                            style={styles.headerAvatar}
                                            onError={(error) => {
                                                console.log('Error loading header avatar:', error);
                                                console.log('Attempted URL:', userData.photo_url.startsWith('http') 
                                                    ? userData.photo_url 
                                                    : `${API_BASE_URL.replace('/api', '')}${userData.photo_url}`);
                                            }}
                                        />
                                    ) : (
                                        <View style={styles.defaultAvatar}>
                                            <MaterialIcons name="person" size={24} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <View style={styles.greetingContainer}>
                                    <Text style={styles.greetingText}>{getUserName()}</Text>
                                    <Text style={styles.petsCountText}>You have {dashboardData?.pets_count || 0} pets.</Text>
                                </View>
                            </View>
                            <View style={styles.headerRight}>
                                <TouchableOpacity style={styles.notificationButton} onPress={() => navigateToPage('Notification')}>
                                    <Ionicons name="notifications" size={20} color="#045b26" />
                                    {notificationCount > 0 && (
                                        <View style={styles.notificationBadge}>
                                            <Text style={styles.notificationBadgeText}>
                                                {notificationCount > 99 ? '99+' : notificationCount}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
                                    <Ionicons name="menu" size={20} color="#045b26" />
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        // Other pages layout
                        <>
                            <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
                                <MaterialIcons name="arrow-back" size={24} color="#045b26" />
                            </TouchableOpacity>
                            <Text style={styles.pageTitle}>{getPageTitle(selectedMenu)}</Text>
                            <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
                                <Ionicons name="menu" size={20} color="#045b26" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}
            <CollapsibleMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                setSelectedMenu={setSelectedMenu}
                onRequestLogout={requestLogout}
                addToHistory={addToHistory}
            />
            <View style={styles.contentContainer}>
                {content}
            </View>
            {selectedMenu !== 'Integration' && selectedMenu !== 'CanineIntegration' && selectedMenu !== 'CanineGuidelineIntegration' && selectedMenu !== 'CanineIntegrationQuestion' && selectedMenu !== 'CanineIntegrationResult' && selectedMenu !== 'IntegrationQuestionsCat' && selectedMenu !== 'IntegrationPicture' && selectedMenu !== 'IntegrationScanning' && selectedMenu !== 'IntegrationImageResult' && selectedMenu !== 'Pet Details' && (
                <>
                    <BottomGradient />
                    <BottomNavigationBar
                        activeTab={activeBottomTab}
                        onTabPress={handleBottomTabPress}
                        userData={userData}
                    />
                </>
            )}
            <ConfirmLogoutModal
                visible={logoutVisible}
                onConfirm={confirmLogout}
                onCancel={cancelLogout}
            />
        </View>
    );
}
