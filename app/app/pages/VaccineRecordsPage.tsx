import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { vaccinationRecordsAPI, VaccinationRecord } from '../../utils/vaccinationRecords.utils';
import { getPets, PetData } from '../../utils/pets.utils';

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
        color: '#ff4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    addRecordButton: {
        backgroundColor: '#045b26',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        elevation: 2,
        marginLeft: 12,
    },
    addRecordText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 12 
    },
});

interface VaccinationRecordWithPet extends VaccinationRecord {
    pet_name?: string;
    pet_species?: string;
}

export default function VaccineRecordsPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [vaccineRecords, setVaccineRecords] = useState<VaccinationRecordWithPet[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<VaccinationRecordWithPet[]>([]);
    const [pets, setPets] = useState<PetData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVaccinationRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch vaccination records
            const records = await vaccinationRecordsAPI.getVaccinationRecords();
            
            // Fetch pets to get pet names
            const petsResult = await getPets();
            if (petsResult.success && petsResult.data) {
                const petsData = Array.isArray(petsResult.data) ? petsResult.data : [petsResult.data];
                setPets(petsData);
                
                // Combine vaccination records with pet information
                const recordsWithPets = records.map(record => {
                    const pet = petsData.find(p => p.id === record.pet_id);
                    return {
                        ...record,
                        pet_name: pet?.name || `Pet #${record.pet_id}`,
                        pet_species: pet?.species || 'Unknown'
                    };
                });
                
                setVaccineRecords(recordsWithPets);
                setFilteredRecords(recordsWithPets);
            } else {
                setVaccineRecords(records);
                setFilteredRecords(records);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch vaccination records');
            console.error('Error fetching vaccination records:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVaccinationRecords();
    }, []);

    // Filter records based on active filter
    useEffect(() => {
        if (activeFilter === 'All') {
            setFilteredRecords(vaccineRecords);
        } else {
            const filtered = vaccineRecords.filter(record => {
                const pet = pets.find(p => p.id === record.pet_id);
                if (activeFilter === 'Dogs') {
                    const species = pet?.species?.toLowerCase();
                    return species === 'dog' || species === 'canine';
                } else if (activeFilter === 'Cats') {
                    const species = pet?.species?.toLowerCase();
                    return species === 'cat' || species === 'feline';
                }
                return true;
            });
            setFilteredRecords(filtered);
        }
    }, [activeFilter, vaccineRecords, pets]);

    const handleRetry = () => {
        fetchVaccinationRecords();
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const handleRecordPress = (record: VaccinationRecordWithPet) => {
        // Navigate to detailed view or edit page
        onNavigate('Pet VacCard');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#045b26" />
                    <Text style={{ marginTop: 16, color: '#666' }}>Loading vaccination records...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
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
                            All ({vaccineRecords.length})
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
                            Cats ({vaccineRecords.filter(r => {
                                const pet = pets.find(p => p.id === r.pet_id);
                                const species = pet?.species?.toLowerCase();
                                return species === 'cat' || species === 'feline';
                            }).length})
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
                            Dogs ({vaccineRecords.filter(r => {
                                const pet = pets.find(p => p.id === r.pet_id);
                                const species = pet?.species?.toLowerCase();
                                return species === 'dog' || species === 'canine';
                            }).length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Record List Area - Column Headers */}
                <View style={styles.tableHeader}>
                    <Text style={styles.headerCell}>Pet Name</Text>
                    <Text style={styles.headerCell}>Vaccine</Text>
                    <Text style={styles.headerCell}>Date</Text>
                    <Text style={styles.headerCell}>Batch/Lot</Text>
                </View>

                {/* Vaccine Records */}
                <ScrollView 
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                            <TouchableOpacity 
                                key={record.id}
                                style={styles.tableRow}
                                onPress={() => handleRecordPress(record)}
                            >
                                <Text style={styles.tableCell}>{record.pet_name || `Pet #${record.pet_id}`}</Text>
                                <Text style={styles.tableCell}>{record.vaccine_name}</Text>
                                <Text style={styles.tableCell}>{formatDate(record.vaccination_date)}</Text>
                                <Text style={styles.tableCell}>
                                    {record.batch_lot_no || 'N/A'}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                {activeFilter === 'All' 
                                    ? 'No vaccine records found' 
                                    : `No ${activeFilter.toLowerCase()} vaccine records found`
                                }
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
} 