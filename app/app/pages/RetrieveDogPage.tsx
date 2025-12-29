import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const retrievalGuidelines = [
  'Strict Retrieval Deadline: There is a limited timeframe of three calendar days from the date the dog was impounded to retrieve it. The facility may not be able to hold the dog beyond this period.',
  'Immediate Release After Payment: The dog will be released without delay once the required retrieval fee has been paid in full.',
  'Proof of Ownership: To ensure the dog is returned to the correct owner, proof of ownership is required. Acceptable examples include vet records, a microchip number, or photos of the owner with their dog.',
  'Operating Hours: It is important to check the operating hours of the retrieval facility to ensure arrival during open times.',
  'Accepted Payment Methods: Before visiting, it is advised to inquire about the accepted forms of payment, such as cash, credit card, or mobile payment, to prevent any inconvenience.'
];

export default function RetrieveDogPage({ onBack }: { onBack?: () => void }) {
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
        {/* Guidelines List */}
        <View style={styles.guidelinesBox}>
        {retrievalGuidelines.map((item, idx) => (
          <View key={idx} style={styles.guidelineItem}>
            <Text style={styles.guidelineNumber}>{idx + 1}.</Text>
            <Text style={styles.guidelineText}>{item}</Text>
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
  guidelinesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  guidelineNumber: {
    color: '#045b26',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  guidelineText: {
    color: '#333',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
}); 