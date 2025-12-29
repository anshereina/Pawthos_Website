import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import MedicalVisitDetailsModal from '../modals/MedicalVisitDetailsModal';
import { medicalRecordsAPI, MedicalRecord, MedicalVisitData } from '../../utils/medicalRecords.utils';
import { getPetById } from '../../utils/pets.utils';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF' 
    },
    // Export button for section header
    exportButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    exportButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Jumper',
        marginLeft: 6,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    // Modern Pet Info Card
    petInfoSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F0F8F0',
        position: 'relative',
        overflow: 'hidden',
    },
    petInfoGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#045b26',
    },
    petInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    petInfoIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    petInfoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
    },
    petInfoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    petInfoItem: {
        width: '48%',
        backgroundColor: '#F8FFF8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8F5E8',
    },
    petInfoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        fontFamily: 'Flink',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    petInfoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'System',
    },
    // Modern Records Section
    recordsSection: {
        flex: 1,
    },
    recordsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    recordsSectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recordsSectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    recordsSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
    },
    recordCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F8F0',
        overflow: 'hidden',
    },
    recordCardGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#045b26',
    },
    recordCardContent: {
        padding: 20,
        paddingTop: 24,
    },
    recordCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    recordReason: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
        flex: 1,
        marginRight: 12,
    },
    recordDetailsButton: {
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    recordDetailsButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Flink',
        marginLeft: 4,
    },
    recordDatesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    recordDateItem: {
        flex: 1,
        backgroundColor: '#F8FFF8',
        borderRadius: 10,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    recordDateLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666',
        fontFamily: 'Flink',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    recordDateValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'System',
        textAlign: 'center',
    },
    // Empty State
    emptyStateCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F8F0',
    },
    emptyStateIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8FFF8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Flink',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Loading and Error States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        fontFamily: 'Flink',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
    },
    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFE8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#DC3545',
        fontFamily: 'Jumper',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Flink',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 16,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Jumper',
    },
});

export default function PetMedRecordsPage({ onNavigate, petId }: { onNavigate: (page: string, data?: any) => void, petId?: number }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [petInfo, setPetInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadData();
    }, [petId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load pet information if petId is provided
            if (petId) {
                const petResult = await getPetById(petId);
                if (petResult.success && petResult.data) {
                    setPetInfo(petResult.data);
                }
                
                // Load medical records for this specific pet
                const records = await medicalRecordsAPI.getMedicalRecordsByPet(petId);
                setMedicalRecords(records);
            } else {
                // Load all medical records for the user's pets
                const records = await medicalRecordsAPI.getMedicalRecords();
                setMedicalRecords(records);
            }
        } catch (err) {
            console.error('Error loading medical records:', err);
            setError('Failed to load medical records. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPress = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setModalVisible(true);
    };

    const handleRetry = () => {
        loadData();
    };

    const handleExportPdf = async () => {
        if (exporting) return; // Prevent multiple simultaneous exports
        
        try {
            setExporting(true);
            
            const petName = petInfo?.name || 'Pet';
            const exportDate = new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Enhanced header with better styling
            const headerHtml = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #045b26;">
                    <div>
                        <h1 style="margin:0;color:#045b26;font-size:24px;font-weight:bold;">Medical Records</h1>
                        <p style="margin:4px 0 0 0;color:#666;font-size:12px;">Generated on ${exportDate}</p>
                    </div>
                </div>
            `;

            // Enhanced pet information section
            const petInfoHtml = petInfo ? `
                <div style="border:2px solid #045b26;border-radius:12px;padding:16px;margin-bottom:24px;background:#F8FFF8;">
                    <h2 style="margin:0 0 12px 0;color:#045b26;font-size:18px;font-weight:bold;">Pet Information</h2>
                    <table style="width:100%;font-size:13px;color:#333;border-collapse:collapse;">
                        <tr>
                            <td style="width:140px;padding:8px 0;font-weight:bold;color:#045b26;">Name:</td>
                            <td style="padding:8px 0;">${petInfo.name || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;font-weight:bold;color:#045b26;">Age:</td>
                            <td style="padding:8px 0;">${petInfo.date_of_birth ? medicalRecordsAPI.calculateAge(petInfo.date_of_birth) : 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;font-weight:bold;color:#045b26;">Date of Birth:</td>
                            <td style="padding:8px 0;">${petInfo.date_of_birth ? medicalRecordsAPI.formatDate(petInfo.date_of_birth) : 'Unknown'}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;font-weight:bold;color:#045b26;">Gender:</td>
                            <td style="padding:8px 0;">${petInfo.gender || 'Unknown'}</td>
                        </tr>
                        ${petInfo.breed ? `
                        <tr>
                            <td style="padding:8px 0;font-weight:bold;color:#045b26;">Breed:</td>
                            <td style="padding:8px 0;">${petInfo.breed}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
            ` : '';

            // Enhanced table with more details
            const rowsHtml = (medicalRecords || []).map((r, index) => `
                <tr style="${index % 2 === 0 ? 'background:#FFFFFF;' : 'background:#F8FFF8;'}">
                    <td style="padding:12px;border:1px solid #e0e0e0;word-wrap:break-word;vertical-align:top;">${r.reason_for_visit || 'N/A'}</td>
                    <td style="padding:12px;border:1px solid #e0e0e0;word-wrap:break-word;text-align:center;">${medicalRecordsAPI.formatDate(r.date_visited)}</td>
                    <td style="padding:12px;border:1px solid #e0e0e0;word-wrap:break-word;text-align:center;">${r.date_of_next_visit ? medicalRecordsAPI.formatDate(r.date_of_next_visit) : 'N/A'}</td>
                    <td style="padding:12px;border:1px solid #e0e0e0;word-wrap:break-word;">
                        ${r.procedures || r.notes || r.description || 'See details in app'}
                    </td>
                </tr>
            `).join('');

            const tableHtml = `
                <div style="margin-top:16px;">
                    <h2 style="margin:0 0 16px 0;color:#045b26;font-size:18px;font-weight:bold;">Visit History</h2>
                    <table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;border:2px solid #045b26;">
                        <thead>
                            <tr style="background:#045b26;color:#FFFFFF;">
                                <th style="padding:12px;border:1px solid #045b26;width:25%;font-weight:bold;text-align:left;">Reason for Visit</th>
                                <th style="padding:12px;border:1px solid #045b26;width:20%;font-weight:bold;text-align:center;">Date Visited</th>
                                <th style="padding:12px;border:1px solid #045b26;width:20%;font-weight:bold;text-align:center;">Next Visit</th>
                                <th style="padding:12px;border:1px solid #045b26;width:35%;font-weight:bold;text-align:left;">Procedures / Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || `<tr><td colspan="4" style="padding:20px;text-align:center;color:#666;font-style:italic;">No medical records found.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            `;

            // Footer
            const footerHtml = `
                <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;text-align:center;color:#666;font-size:11px;">
                    <p style="margin:0;">This document was generated by Pawthos Pet Management System</p>
                    <p style="margin:4px 0 0 0;">For questions or concerns, please contact your veterinarian</p>
                </div>
            `;

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Medical Records - ${petName}</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 16px; }
                        }
                    </style>
                </head>
                <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:20px;max-width:800px;margin:0 auto;color:#333;">
                    ${headerHtml}
                    ${petInfoHtml}
                    ${tableHtml}
                    ${footerHtml}
                </body>
                </html>
            `;

            // Generate PDF
            const { uri } = await Print.printToFileAsync({ 
                html,
                base64: false,
                width: 612, // US Letter width in points
                height: 792, // US Letter height in points
            });

            // Create a clean filename
            const sanitizedPetName = petName.replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
            const timestamp = Date.now();
            const fileName = `Medical_Records_${sanitizedPetName}_${timestamp}.pdf`;
            
            // Get the document directory
            const documentDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
            const dest = `${documentDir}${fileName}`;
            
            // Move the file to the final destination
            await FileSystem.moveAsync({ from: uri, to: dest });

            // Share/download the PDF
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(dest, { 
                    mimeType: 'application/pdf', 
                    dialogTitle: 'Download Medical Records PDF',
                    UTI: 'com.adobe.pdf'
                });
                Alert.alert(
                    'PDF Generated Successfully', 
                    `Medical records PDF has been generated. Use the share options to save it to your device.`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'PDF Exported', 
                    `PDF has been saved to:\n${dest}\n\nYou can find it in your app's documents folder.`,
                    [{ text: 'OK' }]
                );
            }
        } catch (e) {
            console.error('Export PDF error:', e);
            Alert.alert(
                'Export Failed', 
                'Could not export medical records to PDF. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#045b26" />
                    <Text style={styles.loadingText}>Loading medical records...</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                        <MaterialIcons name="error-outline" size={40} color="#DC3545" />
                    </View>
                    <Text style={styles.errorTitle}>Something went wrong</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Modern Pet Information Section */}
                {petInfo && (
                    <View style={styles.petInfoSection}>
                        <View style={styles.petInfoGradient} />
                        <View style={styles.petInfoHeader}>
                            <View style={styles.petInfoIconContainer}>
                                <MaterialCommunityIcons name="paw" size={24} color="#045b26" />
                            </View>
                            <Text style={styles.petInfoTitle}>Pet Information</Text>
                        </View>
                        
                        <View style={styles.petInfoGrid}>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Name</Text>
                                <Text style={styles.petInfoValue}>{petInfo.name}</Text>
                            </View>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Age</Text>
                                <Text style={styles.petInfoValue}>
                                    {petInfo.date_of_birth ? medicalRecordsAPI.calculateAge(petInfo.date_of_birth) : 'Unknown'}
                                </Text>
                            </View>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Birth Date</Text>
                                <Text style={styles.petInfoValue}>
                                    {petInfo.date_of_birth ? medicalRecordsAPI.formatDate(petInfo.date_of_birth) : 'Unknown'}
                                </Text>
                            </View>
                            <View style={styles.petInfoItem}>
                                <Text style={styles.petInfoLabel}>Gender</Text>
                                <Text style={styles.petInfoValue}>{petInfo.gender || 'Unknown'}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Modern Medical Records Section */}
                <View style={styles.recordsSection}>
                    <View style={styles.recordsSectionHeader}>
                        <View style={styles.recordsSectionLeft}>
                            <View style={styles.recordsSectionIconContainer}>
                                <MaterialCommunityIcons name="file-document-outline" size={20} color="#045b26" />
                            </View>
                            <Text style={styles.recordsSectionTitle}>Medical Records</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.exportButton, exporting && { opacity: 0.6 }]} 
                            onPress={handleExportPdf}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <MaterialIcons name="file-download" size={14} color="#FFFFFF" />
                            )}
                            <Text style={styles.exportButtonText}>
                                {exporting ? 'Exporting...' : 'Export'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Medical Records Cards */}
                    {medicalRecords.length > 0 ? (
                        medicalRecords.map((record) => (
                            <View key={record.id} style={styles.recordCard}>
                                <View style={styles.recordCardGradient} />
                                <View style={styles.recordCardContent}>
                                    <View style={styles.recordCardHeader}>
                                        <Text style={styles.recordReason}>{record.reason_for_visit}</Text>
                                        <TouchableOpacity 
                                            style={styles.recordDetailsButton}
                                            onPress={() => handleRecordPress(record)}
                                        >
                                            <MaterialCommunityIcons name="eye" size={16} color="#045b26" />
                                            <Text style={styles.recordDetailsButtonText}>Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View style={styles.recordDatesContainer}>
                                        <View style={styles.recordDateItem}>
                                            <Text style={styles.recordDateLabel}>Visited</Text>
                                            <Text style={styles.recordDateValue}>
                                                {medicalRecordsAPI.formatDate(record.date_visited)}
                                            </Text>
                                        </View>
                                        <View style={styles.recordDateItem}>
                                            <Text style={styles.recordDateLabel}>Next Visit</Text>
                                            <Text style={styles.recordDateValue}>
                                                {record.date_of_next_visit ? medicalRecordsAPI.formatDate(record.date_of_next_visit) : 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyStateCard}>
                            <View style={styles.emptyStateIconContainer}>
                                <MaterialCommunityIcons name="file-document-outline" size={40} color="#045b26" />
                            </View>
                            <Text style={styles.emptyStateTitle}>No Records Found</Text>
                            <Text style={styles.emptyStateText}>
                                No medical records found for this pet. Records will appear here once visits are logged.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Medical Visit Details Modal */}
            {selectedRecord && (
                <MedicalVisitDetailsModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedRecord(null);
                    }}
                    medicalVisitData={medicalRecordsAPI.convertToMedicalVisitData(selectedRecord, petInfo)}
                />
            )}
        </View>
    );
} 