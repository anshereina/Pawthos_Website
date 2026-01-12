import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Alert, Modal, ScrollView, Animated, RefreshControl } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppointmentDetailsModal from '../modals/AppointmentDetailsModal';
import { getAppointments, updateAppointmentStatus, filterUpcomingAppointments, getAllAppointments, formatAppointmentDate, formatAppointmentTime, AppointmentData } from '../../utils/appointments.utils';

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
    addAppointmentBtn: {
        backgroundColor: '#045b26',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    addAppointmentText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 10,
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
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchText: { 
        flex: 1,
        fontSize: 16,
        color: '#888888',
        fontFamily: 'Flink',
        marginLeft: 16,
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
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: '#045b26',
    },
    filterTabInactive: {
        backgroundColor: 'transparent',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Jumper',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    filterTextInactive: {
        color: '#666',
    },
    // Appointment Cards
    appointmentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    appointmentDate: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Jumper',
    },
    appointmentDetails: {
        marginBottom: 12,
    },
    appointmentType: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'Jumper',
        marginBottom: 4,
    },
    appointmentTime: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Flink',
        marginBottom: 8,
    },
    appointmentPet: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Flink',
    },
    appointmentActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    primaryButton: {
        backgroundColor: '#045b26',
    },
    secondaryButton: {
        backgroundColor: '#E8F5E8',
        borderWidth: 1,
        borderColor: '#045b26',
    },
    dangerButton: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#DC3545',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Jumper',
    },
    primaryButtonText: {
        color: '#FFFFFF',
    },
    secondaryButtonText: {
        color: '#045b26',
    },
    dangerButtonText: {
        color: '#DC3545',
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
    // Modal Styles
    actionModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    actionModalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    actionModalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        fontFamily: 'Jumper',
        textAlign: 'center',
        marginBottom: 12,
    },
    actionModalButton: {
        backgroundColor: '#045b26',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    actionModalCancelButton: {
        backgroundColor: '#e6f3ea',
    },
    actionModalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Jumper',
    },
    modalField: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    modalFieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Jumper',
        marginBottom: 4,
    },
    modalFieldValue: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Flink',
        fontStyle: 'italic',
    },
});

export default function AppointmentPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
    const [activeFilter, setActiveFilter] = useState('Upcoming');
    const [modalVisible, setModalVisible] = useState(false);
    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    // Super fast entrance animation
    const enterOpacity = useRef(new Animated.Value(0)).current;
    const enterTranslateY = useRef(new Animated.Value(8)).current;

    useEffect(() => {
        loadAppointments();
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

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const result = await getAppointments();
            if (result.success && result.data) {
                setAppointments(result.data);
            } else {
                Alert.alert('Error', result.message || 'Failed to load appointments');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            Alert.alert('Error', 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadAppointments();
        } finally {
            setRefreshing(false);
        }
    };

    const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
        try {
            const result = await updateAppointmentStatus(appointmentId, newStatus);
            if (result.success) {
                // Refresh appointments list
                await loadAppointments();
                Alert.alert('Success', `Appointment ${newStatus} successfully`);
            } else {
                Alert.alert('Error', result.message || 'Failed to update appointment status');
            }
        } catch (error) {
            console.error('Error updating appointment status:', error);
            Alert.alert('Error', 'Failed to update appointment status');
        }
    };

    const getFilteredAppointments = () => {
        if (activeFilter === 'Upcoming') {
            return filterUpcomingAppointments(appointments);
        } else {
            // Exclude pending from Lists tab; show only non-pending
            const nonPending = appointments.filter(
                (a) => (a.status || '').toLowerCase() !== 'pending'
            );
            return getAllAppointments(nonPending);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#ffc107'; // Yellow for pending
            case 'scheduled':
                return '#045b26'; // Green for scheduled
            case 'cancelled':
                return '#dc3545'; // Red for cancelled
            default:
                return '#6c757d';
        }
    };

    const canModifyAppointment = (status: string) => {
        return status.toLowerCase() === 'pending' || status.toLowerCase() === 'scheduled';
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return { backgroundColor: '#FFF3CD', borderColor: '#FFEAA7' };
            case 'scheduled':
                return { backgroundColor: '#E8F5E8', borderColor: '#C8E6C9' };
            case 'cancelled':
                return { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' };
            default:
                return { backgroundColor: '#F8F9FA', borderColor: '#E9ECEF' };
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#856404';
            case 'scheduled':
                return '#045b26';
            case 'cancelled':
                return '#DC3545';
            default:
                return '#6C757D';
        }
    };

    const filteredAppointments = getFilteredAppointments();
    const upcomingCount = filterUpcomingAppointments(appointments).length;
    const totalCount = appointments.length;
    const cancelledCount = appointments.filter(a => a.status?.toLowerCase() === 'cancelled').length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.title}>Appointments</Text>
                <TouchableOpacity 
                    style={styles.addAppointmentBtn}
                    onPress={() => onNavigate('Appointment Scheduling')}
                >
                    <Text style={styles.addAppointmentText}>Add New Appointment</Text>
                </TouchableOpacity>
            </View>

            <Animated.View style={{ flex: 1, opacity: enterOpacity, transform: [{ translateY: enterTranslateY }] }}>
            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#045b26']}
                        tintColor="#045b26"
                    />
                }
            >
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={20} color="#888888" />
                    <Text style={styles.searchText}>Search appointments...</Text>
                </View>

                {/* Quick Stats removed as requested */}

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.filterTab, 
                            activeFilter === 'Upcoming' ? styles.filterTabActive : styles.filterTabInactive
                        ]}
                        onPress={() => setActiveFilter('Upcoming')}
                    >
                        <Text style={[
                            styles.filterText, 
                            activeFilter === 'Upcoming' ? styles.filterTextActive : styles.filterTextInactive
                        ]}>
                            Upcoming
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterTab, 
                            activeFilter === 'Lists' ? styles.filterTabActive : styles.filterTabInactive
                        ]}
                        onPress={() => setActiveFilter('Lists')}
                    >
                        <Text style={[
                            styles.filterText, 
                            activeFilter === 'Lists' ? styles.filterTextActive : styles.filterTextInactive
                        ]}>
                            All Appointments
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Loading State */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#045b26" />
                        <Text style={styles.loadingText}>Loading appointments...</Text>
                    </View>
                )}

                {/* Appointments List */}
                {!loading && (
                    <>
                        {filteredAppointments.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <MaterialCommunityIcons 
                                    name="calendar-blank" 
                                    size={64} 
                                    color="#E0E0E0" 
                                    style={styles.emptyIcon} 
                                />
                                <Text style={styles.emptyTitle}>
                                    {activeFilter === 'Upcoming' ? 'No Upcoming Appointments' : 'No Appointments Found'}
                                </Text>
                                <Text style={styles.emptyText}>
                                    {activeFilter === 'Upcoming' 
                                        ? 'You have no upcoming appointments scheduled.' 
                                        : 'No appointments match your current filter.'}
                                </Text>
                            </View>
                        ) : (
                            filteredAppointments.map((item) => (
                                <View key={item.id} style={styles.appointmentCard}>
                                    <View style={styles.appointmentHeader}>
                                        <Text style={styles.appointmentDate}>
                                            {formatAppointmentDate(item.date)}
                                        </Text>
                                        <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
                                            <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
                                                {item.status.toLowerCase() === 'scheduled' ? 'To be Approved' : item.status}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.appointmentDetails}>
                                        <Text style={styles.appointmentType}>{item.type}</Text>
                                        <Text style={styles.appointmentTime}>
                                            Time: {item.time || 'N/A'}
                                        </Text>
                                        <Text style={styles.appointmentPet}>
                                            Pet: {item.pet_name || 'N/A'}
                                        </Text>
                                        {item.pet_species && (
                                            <Text style={styles.appointmentPet}>
                                                Species: {item.pet_species}
                                            </Text>
                                        )}
                                        {item.pet_breed && (
                                            <Text style={styles.appointmentPet}>
                                                Breed: {item.pet_breed}
                                            </Text>
                                        )}
                                        {item.owner_name && (
                                            <Text style={styles.appointmentPet}>
                                                Owner: {item.owner_name}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.appointmentActions}>
                                        {/* View Details is always available */}
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.secondaryButton]}
                                            onPress={() => {
                                                setSelectedAppointment(item);
                                                setModalVisible(true);
                                            }}
                                        >
                                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                                                View Details
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Reschedule and Cancel only when modifiable */}
                                        {canModifyAppointment(item.status) && (
                                            <>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.primaryButton]}
                                                    onPress={() => {
                                                        setSelectedAppointment(item);
                                                        onNavigate('Appointment Scheduling', { appointmentToEdit: item });
                                                    }}
                                                >
                                                    <Text style={[styles.buttonText, styles.primaryButtonText]}>
                                                        Reschedule
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.dangerButton]}
                                                    onPress={async () => {
                                                        await handleStatusUpdate(item.id, 'cancelled');
                                                    }}
                                                >
                                                    <Text style={[styles.buttonText, styles.dangerButtonText]}>
                                                        Cancel
                                                    </Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}
            </ScrollView>
            </Animated.View>

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <AppointmentDetailsModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedAppointment(null);
                    }}
                    appointmentData={selectedAppointment}
                />
            )}

            {/* Action Modal: Reschedule or Cancel */}
            {selectedAppointment && (
                <Modal
                    transparent
                    animationType="slide"
                    visible={actionModalVisible}
                    onRequestClose={() => setActionModalVisible(false)}
                >
                    <View style={styles.actionModalOverlay}>
                        <View style={styles.actionModalContainer}>
                            <Text style={styles.actionModalTitle}>Manage Appointment</Text>
                            
                            {canModifyAppointment(selectedAppointment.status) ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.actionModalButton}
                                        onPress={() => {
                                            setActionModalVisible(false);
                                            if (selectedAppointment) {
                                                onNavigate('Appointment Scheduling', { appointmentToEdit: selectedAppointment });
                                            } else {
                                                onNavigate('Appointment Scheduling');
                                            }
                                        }}
                                    >
                                        <Text style={styles.actionModalButtonText}>Reschedule</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionModalButton, { backgroundColor: '#dc3545' }]}
                                        onPress={async () => {
                                            setActionModalVisible(false);
                                            if (selectedAppointment) {
                                                await handleStatusUpdate(selectedAppointment.id, 'cancelled');
                                                setActiveFilter('Lists');
                                            }
                                        }}
                                    >
                                        <Text style={styles.actionModalButtonText}>Cancel Appointment</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.modalField}>
                                    <Text style={styles.modalFieldLabel}>Status:</Text>
                                    <Text style={styles.modalFieldValue}>
                                        {selectedAppointment.status === 'cancelled' 
                                            ? 'This appointment has been cancelled and cannot be modified.' 
                                            : 'This appointment cannot be modified.'}
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.actionModalButton, styles.actionModalCancelButton]}
                                onPress={() => setActionModalVisible(false)}
                            >
                                <Text style={[styles.actionModalButtonText, { color: '#045b26' }]}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
}
