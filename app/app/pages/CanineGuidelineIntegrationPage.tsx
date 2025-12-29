import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CanineGuidelineIntegrationPage({ onSelect }: { onSelect: (label: string) => void }) {
  const handleStartAssessment = () => {
    onSelect('CanineIntegrationQuestion');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introCard}>
          <MaterialIcons name="pets" size={22} color="#045b26" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.introTitle}>Before you begin</Text>
            <Text style={styles.introText}>Follow these quick tips to get an accurate and consistent BEAAP assessment for your dog.</Text>
          </View>
        </View>

        {/* Do's Section */}
        <View style={[styles.section, styles.card]}>
          <Text style={styles.sectionTitle}>Do's for an Accurate Assessment</Text>
          
          <View style={styles.listItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.listIcon} />
            <Text style={styles.listText}>
              <Text style={styles.listLabel}>Observe when calm: </Text>
              To get a true baseline, assess your pet when they're relaxed, like in the morning or while resting. This avoids misleading results from excitement or play.
            </Text>
          </View>

          <View style={styles.listItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.listIcon} />
            <Text style={styles.listText}>
              <Text style={styles.listLabel}>Be objective: </Text>
              Choose the picture that truly reflects your pet's current behavior, even if the result isn't what you'd hoped for. An honest evaluation is the most helpful one.
            </Text>
          </View>

          <View style={styles.listItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.listIcon} />
            <Text style={styles.listText}>
              <Text style={styles.listLabel}>Take your time: </Text>
              Go through all eight categories of the BEAAP one by one, without rushing. This ensures you consider all aspects of your pet's health.
            </Text>
          </View>

          <View style={styles.listItem}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.listIcon} />
            <Text style={styles.listText}>
              <Text style={styles.listLabel}>Track over time: </Text>
              A single assessment is just a snapshot. By tracking scores regularly, you can spot trends and catch subtle health changes early on.
            </Text>
          </View>
        </View>

        {/* Don'ts Section */}
        <View style={[styles.section, styles.card]}>
          <Text style={styles.sectionTitle}>Don'ts to Avoid Inaccuracy</Text>
          
          <View style={styles.listItem}>
            <MaterialIcons name="cancel" size={16} color="#F44336" style={styles.listIcon} />
            <Text style={styles.listText}>
              <Text style={styles.listLabel}>Don't rush: </Text>
              Rushing through the assessment can lead to inaccurate observations.
            </Text>
          </View>

          <View style={styles.listItem}>
            <MaterialIcons name="cancel" size={16} color="#F44336" style={styles.listIcon} />
            <Text style={styles.listText}>
              <Text style={styles.listLabel}>Don't be wishful: </Text>
              Avoid choosing the option you'd prefer to see. The goal is an honest evaluation of your pet's actual condition.
            </Text>
          </View>

          <View style={styles.listItem}>
            <MaterialIcons name="cancel" size={16} color="#F44336" style={styles.listIcon} />
            <Text style={styles.listText}>
              <Text style={styles.listLabel}>Don't rely on a single check: </Text>
              A one-time check gives you a snapshot, but tracking scores over time is the best way to notice significant changes.
            </Text>
          </View>

          <View style={styles.listItem}>
            <MaterialIcons name="cancel" size={16} color="#F44336" style={styles.listIcon} />
            <Text style={styles.listText}>
              <Text style={styles.listLabel}>Don't assess during activity: </Text>
              Assessing your pet when they're excited or have just been playing can lead to misleading results, like a high breathing score that isn't related to pain.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartAssessment} activeOpacity={0.9}>
            <Text style={styles.startButtonText}>Start Assessment</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  introTitle: {
    color: '#045b26',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  introText: {
    color: '#4a7c59',
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    color: '#045b26',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'left',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    color: '#4a7c59',
    fontSize: 14,
    lineHeight: 20,
  },
  listLabel: {
    fontWeight: 'bold',
    color: '#045b26',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: -8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D37F52',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 4,
    minWidth: 200,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
