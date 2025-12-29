import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const responsibilities = [
  'Vaccination: Owners must have their dog or cat regularly vaccinated against rabies. This should start when the pet is 3 months old and be repeated every year thereafter.',
  'Record Keeping: Owners are required to maintain a registration card that contains a complete record of all vaccinations conducted. This is for the purpose of accurate record-keeping.',
  'Registration: Owners must submit their dog for mandatory registration.',
  'Control and Leash Law: Owners must maintain control over their dog at all times. They are not allowed to let their dog roam the streets or any public places without a leash.',
  'Biting Incident Reporting: If a biting incident occurs, the owner must immediately report it within 24 hours to the nearest concerned officials. This is for investigation and to allow for any appropriate action. Additionally, the dog involved must be placed under observation by a government or private veterinarian.'
];

export default function OwnersResponsibilityPage({ onBack }: { onBack?: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
      </View>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Responsibilities List */}
        <View style={styles.responsibilityBox}>
        {responsibilities.map((item, idx) => (
          <View key={idx} style={styles.responsibilityItem}>
            <Text style={styles.responsibilityNumber}>{idx + 1}.</Text>
            <Text style={styles.responsibilityText}>{item}</Text>
          </View>
        ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  responsibilityBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  responsibilityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  responsibilityNumber: {
    color: '#045b26',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  responsibilityText: {
    color: '#333',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
}); 