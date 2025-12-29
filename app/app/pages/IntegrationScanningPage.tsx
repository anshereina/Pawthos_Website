import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface IntegrationScanningPageProps {
  onBack: () => void;
  onNext?: () => void;
}

export default function IntegrationScanningPage({ onBack, onNext }: IntegrationScanningPageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Scanning</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Scanning in progress...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  text: { fontSize: 16, color: '#666' },
});













