import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function AnimalBitePage({ onBack }: { onBack?: () => void }) {
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
        {/* Info Box */}
        <View style={styles.infoBox}>
        {/* Rabies in Man Section */}
        <Text style={styles.sectionTitle}>1. RABIES IN MAN</Text>
        <Text style={styles.sectionText}><Text style={{fontWeight:'bold'}}>Definition:</Text> Rabies is a fatally disease caused by a virus from the saliva of an infected animal.</Text>
        <Text style={styles.sectionText}><Text style={{fontWeight:'bold'}}>Symptoms:</Text> Hydrophobia, muscle pain, and paralysis.</Text>
        <Text style={styles.sectionText}><Text style={{fontWeight:'bold'}}>Transmission:</Text> The rabies virus is transmitted to humans in two primary ways:</Text>
        <Text style={styles.bulletText}>• Through a bite from an infected animal, most commonly a dog.</Text>
        <Text style={styles.bulletText}>• Through contamination of breaks in the skin or the mucous membranes of the eyes, lips, and mouth with virus-laden saliva.</Text>
        {/* When Bitten Section */}
        <Text style={[styles.sectionTitle, {marginTop: 18}]}>2. WHEN BITTEN BY A DOG</Text>
        <Text style={styles.sectionText}>1. <Text style={{fontWeight:'bold'}}>First Aid:</Text> Wash the wound immediately with soap and water.</Text>
        <Text style={styles.sectionText}>2. <Text style={{fontWeight:'bold'}}>Medical Attention:</Text> Consult a physician or call the nearest Animal Bite Center.</Text>
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
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  sectionTitle: {
    color: '#045b26',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  sectionText: {
    color: '#333',
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 22,
  },
  bulletText: {
    color: '#333',
    fontSize: 15,
    marginLeft: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
}); 