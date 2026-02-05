import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LawOnPetOwnershipPage() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoBox}>
          <Text style={styles.introText}>
            As a pet owner, you need to know about two main laws that guide responsible care and safety.
          </Text>

          <Text style={styles.sectionTitle}>Republic Act No. 8485 (The Animal Welfare Act)</Text>
          <Text style={styles.bulletText}>• What it says: You must treat all animals kindly.</Text>
          <Text style={styles.bulletText}>
            • Your duties: Provide enough food, water, shelter, and medical care for your pets.
          </Text>
          <Text style={styles.bulletText}>
            • What not to do: Do not be cruel, torture, neglect, or abandon your pets. Dog fighting is illegal.
          </Text>
          <Text style={styles.bulletText}>
            • Consequences: Breaking this law can lead to significant fines and jail time.
          </Text>

          <Text style={styles.sectionTitle}>Republic Act No. 9482 (The Anti-Rabies Act)</Text>
          <Text style={styles.bulletText}>• What it says: This law focuses on controlling rabies, especially with dogs.</Text>
          <Text style={styles.subHeader}>Your duties for dogs:</Text>
          <Text style={styles.bulletText}>• Vaccinate: Get your dogs vaccinated for rabies every year.</Text>
          <Text style={styles.bulletText}>• Register: Register your dogs with your local government every year.</Text>
          <Text style={styles.bulletText}>
            • Leash: Always keep your dog on a leash when outside your home (no free-roaming).
          </Text>
          <Text style={styles.bulletText}>• Clean up: Pick up your dog's waste.</Text>
          <Text style={styles.bulletText}>
            • If your dog bites: Report it immediately, have your dog observed by a vet for 14 days, and pay for the victim's medical costs.
          </Text>
          <Text style={styles.bulletText}>
            • Consequences: Expect fines for not following these rules, especially for missing vaccinations or letting your dog roam unleashed.
          </Text>
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
  introText: {
    color: '#333',
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#045b26',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 18,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#045b26',
    marginTop: 12,
    marginBottom: 6,
  },
  bulletText: {
    color: '#333',
    fontSize: 15,
    marginLeft: 12,
    marginBottom: 6,
    lineHeight: 22,
  },
});













