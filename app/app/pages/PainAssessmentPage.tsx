import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getPainAssessments, PainAssessmentRecord, formatAssessmentDate, getPainLevelColor, derivePainLevelLabel } from '../../utils/painAssessments.utils';
import { isAuthenticated } from '../../utils/auth.utils';
import PainAssessmentDetailsModal from '../modals/PainAssessmentDetailsModal';

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
        fontSize: 26, 
        fontWeight: 'bold', 
        color: '#000' 
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
    painLevelCell: {
        flex: 1,
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '600',
    },
    painLevel0: {
        color: '#4CAF50', // Green for no pain
    },
    painLevel1: {
        color: '#FF9800', // Orange for mild pain
    },
    painLevel2: {
        color: '#F44336', // Red for severe pain
    },
});



export default function PainAssessmentPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
    const [activeFilter, setActiveFilter] = useState('All');
    const [painAssessmentRecords, setPainAssessmentRecords] = useState<PainAssessmentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PainAssessmentRecord | null>(null);

    useEffect(() => {
        checkAuthAndLoadAssessments();
    }, []);

    const checkAuthAndLoadAssessments = async () => {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            Alert.alert(
                'Authentication Required',
                'Please login to view pain assessments',
                [{ text: 'OK', onPress: () => onNavigate('Login') }]
            );
            return;
        }
        loadAssessments();
    };

    const loadAssessments = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Loading pain assessments from API...');
            const result = await getPainAssessments();
            console.log('API response:', result);
            
            if (result.success && Array.isArray(result.data)) {
                setPainAssessmentRecords(result.data);
                console.log(`Loaded ${result.data.length} pain assessments`);
            } else {
                const errorMsg = result.message || 'Failed to load pain assessments';
                setError(errorMsg);
                console.error('Failed to load pain assessments:', errorMsg);
                
                if (!errorMsg.includes('No authentication token')) {
                    Alert.alert('Error', errorMsg);
                }
            }
        } catch (err) {
            const errorMessage = 'Failed to load pain assessments. Please try again.';
            setError(errorMessage);
            console.error('Load assessments error:', err);
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAssessments();
        setRefreshing(false);
    };

    const getPainLevelColorStyle = (painLevel?: string) => {
        const level = (painLevel || '').toLowerCase();
        if (level.includes('level 0') || level.includes('no pain')) {
            return styles.painLevel0;
        } else if (level.includes('level 1') || level.includes('mild')) {
            return styles.painLevel1;
        } else if (level.includes('level 2') || level.includes('moderate') || level.includes('severe')) {
            return styles.painLevel2;
        }
        return {};
    };

    const filteredRecords = activeFilter === 'All' 
        ? painAssessmentRecords 
        : painAssessmentRecords.filter(record => {
            const petType = (record.pet_type || '').toLowerCase();
            if (activeFilter === 'Dogs') {
                return petType === 'dog' || petType === 'canine';
            } else if (activeFilter === 'Cats') {
                return petType === 'cat' || petType === 'feline';
            }
            return true;
        });

    const handleAddAssessment = () => {
        // Navigate to integration flow for new assessment
        onNavigate('IntegrationQuestionsDog');
    };

    const handleRecordPress = (record: PainAssessmentRecord) => {
        setSelectedRecord(record);
        setModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#045b26']}
                        tintColor="#045b26"
                    />
                }
                showsVerticalScrollIndicator={true}
            >
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <MaterialIcons name="menu" size={22} color="#666" />
                    <Text style={styles.searchText}>Search assessments</Text>
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
                    <Text style={styles.headerCell}>Pet Name</Text>
                    <Text style={styles.headerCell}>Type</Text>
                    <Text style={styles.headerCell}>Pain Level</Text>
                    <Text style={styles.headerCell}>Date</Text>
                </View>

                {/* Pain Assessment Records */}
                {loading ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="large" color="#045b26" />
                        <Text style={styles.emptyStateText}>Loading pain assessments...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>{error}</Text>
                    </View>
                ) : filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                        <TouchableOpacity 
                            key={record.id}
                            style={styles.tableRow}
                            onPress={() => handleRecordPress(record)}
                        >
                            <Text style={styles.tableCell}>{record.pet_name}</Text>
                            <Text style={styles.tableCell}>
                                {record.pet_type?.toLowerCase() === 'dog' || record.pet_type?.toLowerCase() === 'canine' 
                                    ? 'Dog' 
                                    : record.pet_type?.toLowerCase() === 'cat' || record.pet_type?.toLowerCase() === 'feline' 
                                    ? 'Cat' 
                                    : record.pet_type}
                            </Text>
                            <Text style={[styles.painLevelCell, getPainLevelColorStyle(record.pain_level)]}>
                                {derivePainLevelLabel({ pain_level: record.pain_level, pain_score: record.pain_score })}
                            </Text>
                            <Text style={styles.tableCell}>{formatAssessmentDate(record.assessment_date)}</Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No pain assessment records found</Text>
                    </View>
                )}
                
                {/* Add bottom padding for better scrolling experience */}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Pain Assessment Details Modal */}
            <PainAssessmentDetailsModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                record={selectedRecord}
            />
        </SafeAreaView>
    );
}
