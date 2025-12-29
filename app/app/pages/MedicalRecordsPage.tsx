import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { medicalRecordsAPI, MedicalRecord } from '../../utils/medicalRecords.utils';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f7f7f7' 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#fff',
        elevation: 2,
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: '#000' 
    },
    addPetBtn: {
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        elevation: 2,
    },
    addPetText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 11 
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 16,
        marginBottom: 16,
    },
    searchText: { 
        color: '#999', 
        fontSize: 16, 
        flex: 1, 
        marginLeft: 12 
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 8,
        marginRight: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
    },
    filterBtnActive: {
        backgroundColor: '#045b26',
        borderColor: '#045b26',
    },
    filterBtnInactive: {
        backgroundColor: '#fff',
        borderColor: '#045b26',
    },
    filterText: { 
        fontSize: 11, 
        fontWeight: '500',
        textAlign: 'center',
        width: '100%',
    },
    filterTextActive: { 
        color: '#fff' 
    },
    filterTextInactive: { 
        color: '#045b26' 
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#A1D998',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        elevation: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        color: '#045b26',
        fontSize: 14,
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginTop: 8,
        borderRadius: 8,
    },
    emptyStateText: { 
        fontSize: 16, 
        color: '#666', 
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 4,
        borderRadius: 8,
        elevation: 1,
    },
    tableCell: {
        flex: 1,
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
        marginTop: 16,
    },
    retryButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default function MedicalRecordsPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMedicalRecords();
    }, []);

    const loadMedicalRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const records = await medicalRecordsAPI.getMedicalRecords();
            setMedicalRecords(records);
        } catch (err) {
            console.error('Error loading medical records:', err);
            setError('Failed to load medical records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        loadMedicalRecords();
    };

    const handleRecordPress = (record: MedicalRecord) => {
        onNavigate('Pet MedRecords', { petId: record.pet_id });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#045b26" />
                    <Text style={{ marginTop: 16, color: '#666' }}>Loading medical records...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error" size={48} color="#ff0000" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <MaterialIcons name="menu" size={22} color="#666" />
                    <Text style={styles.searchText}>Search here</Text>
                    <MaterialIcons name="search" size={22} color="#666" />
                </View>

                {/* Filter Buttons */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.filterBtn, 
                            activeFilter === 'All' ? styles.filterBtnActive : styles.filterBtnInactive
                        ]}
                        onPress={() => setActiveFilter('All')}
                    >
                        <Text style={[
                            styles.filterText, 
                            activeFilter === 'All' ? styles.filterTextActive : styles.filterTextInactive
                        ]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterBtn, 
                            activeFilter === 'Cats' ? styles.filterBtnActive : styles.filterBtnInactive
                        ]}
                        onPress={() => setActiveFilter('Cats')}
                    >
                        <Text style={[
                            styles.filterText, 
                            activeFilter === 'Cats' ? styles.filterTextActive : styles.filterTextInactive
                        ]}>
                            Cats
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterBtn, 
                            activeFilter === 'Dogs' ? styles.filterBtnActive : styles.filterBtnInactive
                        ]}
                        onPress={() => setActiveFilter('Dogs')}
                    >
                        <Text style={[
                            styles.filterText, 
                            activeFilter === 'Dogs' ? styles.filterTextActive : styles.filterTextInactive
                        ]}>
                            Dogs
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Record List Area - Column Headers */}
                <View style={styles.tableHeader}>
                    <Text style={styles.headerCell}>Pet ID</Text>
                    <Text style={styles.headerCell}>Date Visited</Text>
                    <Text style={styles.headerCell}>Reason for Visit</Text>
                </View>

                {/* Medical Records */}
                <ScrollView 
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {medicalRecords.length > 0 ? (
                        medicalRecords.map((record) => (
                            <TouchableOpacity 
                                key={record.id} 
                                style={styles.tableRow}
                                onPress={() => handleRecordPress(record)}
                            >
                                <Text style={styles.tableCell}>{record.pet_id}</Text>
                                <Text style={styles.tableCell}>
                                    {medicalRecordsAPI.formatDate(record.date_visited)}
                                </Text>
                                <Text style={styles.tableCell}>{record.reason_for_visit}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="medical-services" size={48} color="#ccc" />
                            <Text style={styles.emptyStateText}>No medical records found</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
} 