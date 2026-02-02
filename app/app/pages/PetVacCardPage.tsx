import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { vaccinationRecordsAPI, VaccinationRecord } from '../../utils/vaccinationRecords.utils';
import { getPets, PetData } from '../../utils/pets.utils';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF' 
    },
    // Export button for section header
    exportButton: {
        backgroundColor: '#045b26',
        paddingHorizontal: 10,
        paddingVertical: 5,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
    },
    petInfoRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    petInfoColumn: {
        flex: 1,
    },
    petInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    petInfoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        fontFamily: 'Flink',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        width: 80,
    },
    petInfoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'System',
        flex: 1,
    },
    // Modern Vaccination Records Section
    vaccinationSection: {
        flex: 1,
    },
    vaccinationSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    vaccinationSectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vaccinationSectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8F5E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    vaccinationSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#045b26',
        fontFamily: 'Jumper',
    },
    tableContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F8F0',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e0ffe6',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        color: '#045b26',
        fontSize: 9,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        minHeight: 50,
    },
    tableCell: {
        flex: 1,
        fontSize: 10,
        color: '#000',
        textAlign: 'center',
        paddingHorizontal: 4,
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    lastCell: {
        borderRightWidth: 0,
    },
    emptyRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        minHeight: 50,
    },
    emptyCell: {
        flex: 1,
        height: 20,
        backgroundColor: '#f9f9f9',
        marginHorizontal: 2,
        borderRadius: 4,
        borderRightWidth: 1,
        borderRightColor: '#f0f0f0',
    },
    lastEmptyCell: {
        borderRightWidth: 0,
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
    // Empty State
    emptyStateCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F8F0',
        margin: 20,
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
});

interface VaccinationRecordWithPet extends VaccinationRecord {
    pet_name?: string;
    pet_species?: string;
}

export default function PetVacCardPage({ onNavigate, petId }: { onNavigate: (page: string, data?: any) => void, petId?: number }) {
    const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecordWithPet[]>([]);
    const [petInfo, setPetInfo] = useState<PetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    const fetchVaccinationData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all vaccination records
            const records = await vaccinationRecordsAPI.getVaccinationRecords();
            
            // Fetch pets to get pet information
            const petsResult = await getPets();
            if (petsResult.success && petsResult.data) {
                const petsData = Array.isArray(petsResult.data) ? petsResult.data : [petsResult.data];
                
                // Filter records for specific pet if petId is provided
                let filteredRecords = records;
                if (petId) {
                    filteredRecords = records.filter(record => record.pet_id === petId);
                }
                
                // Combine vaccination records with pet information
                const recordsWithPets = filteredRecords.map(record => {
                    const pet = petsData.find(p => p.id === record.pet_id);
                    return {
                        ...record,
                        pet_name: pet?.name || `Pet #${record.pet_id}`,
                        pet_species: pet?.species || 'Unknown'
                    };
                });
                
                setVaccinationRecords(recordsWithPets);
                
                // Set pet info for the first record or specific pet
                if (petId) {
                    const pet = petsData.find(p => p.id === petId);
                    setPetInfo(pet || null);
                } else if (recordsWithPets.length > 0) {
                    const pet = petsData.find(p => p.id === recordsWithPets[0].pet_id);
                    setPetInfo(pet || null);
                }
            } else {
                setVaccinationRecords(records);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch vaccination records');
            console.error('Error fetching vaccination records:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVaccinationData();
    }, [petId]);

    const handleRetry = () => {
        fetchVaccinationData();
    };

    // Helper function to escape HTML
    const escapeHtml = (text: string | null | undefined): string => {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
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
                        <h1 style="margin:0;color:#045b26;font-size:24px;font-weight:bold;">Vaccination Card</h1>
                        <p style="margin:4px 0 0 0;color:#666;font-size:12px;">Generated on ${exportDate}</p>
                    </div>
                </div>
            `;

            // Enhanced table with better formatting
            const rowsHtml = (vaccinationRecords || []).map((r, index) => `
                <tr style="${index % 2 === 0 ? 'background:#FFFFFF;' : 'background:#F8FFF8;'}">
                    <td style="padding:12px;border:1px solid #e0e0e0;word-wrap:break-word;text-align:center;">${escapeHtml(formatDate(r.vaccination_date))}</td>
                    <td style="padding:12px;border:1px solid #e0e0e0;word-wrap:break-word;">${escapeHtml(r.vaccine_name) || 'N/A'}</td>
                    <td style="padding:12px;border:1px solid #e0e0e0;word-wrap:break-word;text-align:center;">${escapeHtml(r.batch_lot_no) || 'N/A'}</td>
                    <td style="padding:12px;border:1px solid #e0e0e0;word-wrap:break-word;text-align:center;">${escapeHtml(formatDate(r.expiration_date))}</td>
                    <td style="padding:12px;border:1px solid #e0e0e0;word-wrap:break-word;text-align:center;">${escapeHtml(r.veterinarian) || 'N/A'}</td>
                </tr>
            `).join('');

            const tableHtml = `
                <div style="margin-top:16px;">
                    <h2 style="margin:0 0 16px 0;color:#045b26;font-size:18px;font-weight:bold;">Vaccination History</h2>
                    <table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;border:2px solid #045b26;">
                        <thead>
                            <tr style="background:#045b26;color:#FFFFFF;">
                                <th style="padding:12px;border:1px solid #045b26;width:20%;font-weight:bold;text-align:center;">Date of Vaccination</th>
                                <th style="padding:12px;border:1px solid #045b26;width:25%;font-weight:bold;text-align:left;">Vaccine Used</th>
                                <th style="padding:12px;border:1px solid #045b26;width:20%;font-weight:bold;text-align:center;">Lot No./ Batch No.</th>
                                <th style="padding:12px;border:1px solid #045b26;width:20%;font-weight:bold;text-align:center;">Date of Next Vaccination</th>
                                <th style="padding:12px;border:1px solid #045b26;width:15%;font-weight:bold;text-align:center;">Vet. Lic No. PTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml || `<tr><td colspan="5" style="padding:20px;text-align:center;color:#666;font-style:italic;">No vaccination records found.</td></tr>`}
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
                    <title>Vaccination Card - ${petName}</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 16px; }
                        }
                    </style>
                </head>
                <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding:20px;max-width:800px;margin:0 auto;color:#333;">
                    ${headerHtml}
                    ${tableHtml}
                    ${footerHtml}
                </body>
                </html>
            `;

            // Generate PDF
            console.log('Generating PDF...');
            const printResult = await Print.printToFileAsync({ 
                html,
                base64: false,
                width: 612, // US Letter width in points
                height: 792, // US Letter height in points
            });

            if (!printResult || !printResult.uri) {
                throw new Error('PDF generation failed: No URI returned');
            }

            const { uri } = printResult;
            console.log('PDF generated at:', uri);

            // Create a clean filename
            const sanitizedPetName = (petName || 'Pet').replace(/[^a-z0-9_-]/gi, '_').replace(/_+/g, '_');
            const timestamp = Date.now();
            const fileName = `Vaccination_Card_${sanitizedPetName}_${timestamp}.pdf`;
            
            // Get the document directory
            const documentDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
            if (!documentDir) {
                throw new Error('Document directory not available');
            }
            
            const dest = `${documentDir}${fileName}`;
            console.log('Moving PDF to:', dest);
            
            // Check if destination file exists and delete it first
            try {
                const fileInfo = await FileSystem.getInfoAsync(dest);
                if (fileInfo.exists) {
                    await FileSystem.deleteAsync(dest, { idempotent: true });
                }
            } catch (checkError) {
                console.log('File check error (non-critical):', checkError);
            }
            
            // Copy the file instead of moving (more reliable)
            await FileSystem.copyAsync({ from: uri, to: dest });
            console.log('PDF copied successfully');

            // Share/download the PDF
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(dest, { 
                    mimeType: 'application/pdf', 
                    dialogTitle: 'Download Vaccination Card PDF',
                    UTI: 'com.adobe.pdf'
                });
                Alert.alert(
                    'PDF Generated Successfully', 
                    `Vaccination card PDF has been generated. Use the share options to save it to your device.`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'PDF Exported', 
                    `PDF has been saved successfully.`,
                    [{ text: 'OK' }]
                );
            }
        } catch (e: any) {
            console.error('Export PDF error:', e);
            const errorMessage = e?.message || 'Unknown error occurred';
            Alert.alert(
                'Export Failed', 
                `Could not export vaccination card to PDF.\n\nError: ${errorMessage}\n\nPlease try again.`,
                [{ text: 'OK' }]
            );
        } finally {
            setExporting(false);
        }
    };

    const handleBackButton = () => {
        onNavigate('Pet profile');
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        
        try {
            // Handle various date formats
            let date: Date;
            
            // If it's already a Date object
            if (dateString instanceof Date) {
                date = dateString;
            } else {
                // Try parsing the date string
                date = new Date(dateString);
                
                // Check if date is valid
                if (isNaN(date.getTime())) {
                    // Try parsing as ISO format or other common formats
                    const parsed = Date.parse(dateString);
                    if (isNaN(parsed)) {
                        return 'N/A';
                    }
                    date = new Date(parsed);
                }
            }
            
            // Format the date
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Date formatting error:', error, 'for date:', dateString);
            return 'N/A';
        }
    };

    const calculateAge = (dateOfBirth: string) => {
        try {
            const birthDate = new Date(dateOfBirth);
            const today = new Date();
            const ageInYears = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                return `${ageInYears - 1} years`;
            }
            return `${ageInYears} years`;
        } catch {
            return 'Unknown';
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#045b26" />
                    <Text style={styles.loadingText}>Loading vaccination card...</Text>
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
                {/* Modern Vaccination Records Section */}
                <View style={styles.vaccinationSection}>
                    <View style={styles.vaccinationSectionHeader}>
                        <View style={styles.vaccinationSectionLeft}>
                            <View style={styles.vaccinationSectionIconContainer}>
                                <MaterialCommunityIcons name="shield-check" size={20} color="#045b26" />
                            </View>
                            <Text style={styles.vaccinationSectionTitle}>Vaccination Records</Text>
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

                    <View style={styles.tableContainer}>                    
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerCell}>Date of Vaccination</Text>
                            <Text style={styles.headerCell}>Vaccine Used</Text>
                            <Text style={styles.headerCell}>Lot No./ Batch No.</Text>
                            <Text style={styles.headerCell}>Date of next Vaccination</Text>
                            <Text style={styles.headerCell}>Vet. Lic No. PTR</Text>
                        </View>

                        {/* Vaccination Records */}
                        {vaccinationRecords.length > 0 ? (
                            vaccinationRecords.map((record, index) => (
                                <View key={record.id} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>
                                        {formatDate(record.vaccination_date)}
                                    </Text>
                                    <Text style={styles.tableCell}>
                                        {record.vaccine_name || 'N/A'}
                                    </Text>
                                    <Text style={styles.tableCell}>
                                        {record.batch_lot_no || 'N/A'}
                                    </Text>
                                    <Text style={styles.tableCell}>
                                        {formatDate(record.expiration_date)}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.lastCell]}>
                                        {record.veterinarian || 'N/A'}
                                    </Text>
                        </View>
                            ))
                        ) : (
                            <View style={styles.emptyStateCard}>
                                <View style={styles.emptyStateIconContainer}>
                                    <MaterialCommunityIcons name="shield-check" size={40} color="#045b26" />
                                </View>
                                <Text style={styles.emptyStateTitle}>No Records Found</Text>
                                <Text style={styles.emptyStateText}>No vaccination records found for this pet. Records will appear here once vaccinations are logged.</Text>
                        </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
} 