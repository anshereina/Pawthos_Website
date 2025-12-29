import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const mockCertificates = [
    {
        id: 'C-001',
        type: 'Vaccination Certificate',
        pet: 'Buddy',
        issued: '2024-01-15',
        validUntil: '2025-01-15',
        status: 'Valid',
    },
    {
        id: 'C-002',
        type: 'Health Certificate',
        pet: 'Mittens',
        issued: '2024-03-20',
        validUntil: '2025-03-20',
        status: 'Valid',
    },
];

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f7f7f7' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#045b26', marginBottom: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        elevation: 1,
    },
    label: { color: '#045b26', fontWeight: 'bold', fontSize: 16 },
    value: { color: '#333', fontSize: 15, marginBottom: 4 },
});

export default function CertificatePage() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Certificates</Text>
            {mockCertificates.length === 0 && <Text style={{ color: '#999' }}>No certificates found.</Text>}
            {mockCertificates.map((cert, idx) => (
                <View key={idx} style={styles.card}>
                    <Text style={styles.label}>Type:</Text>
                    <Text style={styles.value}>{cert.type}</Text>
                    <Text style={styles.label}>Pet:</Text>
                    <Text style={styles.value}>{cert.pet}</Text>
                    <Text style={styles.label}>Issued:</Text>
                    <Text style={styles.value}>{cert.issued}</Text>
                    <Text style={styles.label}>Valid Until:</Text>
                    <Text style={styles.value}>{cert.validUntil}</Text>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{cert.status}</Text>
                </View>
            ))}
        </ScrollView>
    );
}
