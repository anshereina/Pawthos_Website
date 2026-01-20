import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function LawOnPetOwnershipPage() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Pet Ownership Regulations</Text>
        <Text style={styles.text}>
          This section contains information about local laws and regulations regarding pet ownership.
          Please consult with local authorities for the most up-to-date information.
        </Text>
      </ScrollView>
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
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  text: { fontSize: 14, lineHeight: 22, color: '#666' },
});













