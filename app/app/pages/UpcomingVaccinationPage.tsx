import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getScheduledVaccinationEvents, VaccinationEvent } from '../../utils/vaccination.utils';

export default function UpcomingVaccinationPage({ onBack }: { onBack?: () => void }) {
  const [vaccinationEvents, setVaccinationEvents] = useState<VaccinationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVaccinationEvents();
  }, []);

  const loadVaccinationEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getScheduledVaccinationEvents();
      
      if (result.success && result.data) {
        setVaccinationEvents(result.data);
      } else {
        setError(result.message || 'Failed to load vaccination events');
        Alert.alert('Error', result.message || 'Failed to load vaccination events');
      }
    } catch (error) {
      console.error('Error loading vaccination events:', error);
      setError('Failed to load vaccination events');
      Alert.alert('Error', 'Failed to load vaccination events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
        {/* Upcoming Vaccination Notification Boxes */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading vaccination events...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadVaccinationEvents}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : vaccinationEvents.length > 0 ? (
        vaccinationEvents.map((event) => (
          <View key={event.id} style={styles.upcomingNotificationBox}>
            <View style={styles.iconCol}>
              <MaterialCommunityIcons name="calendar-clock" size={28} color="#045b26" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.upcomingTitle}>UPCOMING VACCINATION</Text>
                             <View style={styles.eventInfo}>
                 <Text style={styles.eventInfoLabel}>Title:</Text>
                 <Text style={styles.eventInfoValue}>{event.event_title}</Text>
               </View>
               <View style={styles.eventInfo}>
                 <Text style={styles.eventInfoLabel}>Location:</Text>
                 <Text style={styles.eventInfoValue}>{event.barangay}</Text>
               </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventInfoLabel}>Event Date:</Text>
                <Text style={styles.eventInfoValue}>{formatDate(event.event_date)}</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No upcoming vaccination events scheduled</Text>
        </View>
      )}
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
    marginBottom: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  iconCol: {
    marginRight: 16,
    marginTop: 4,
  },
  upcomingNotificationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  upcomingTitle: {
    color: '#045b26',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  eventInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  eventInfoLabel: {
    color: '#045b26',
    fontSize: 14,
    fontWeight: '600',
    width: 90,
  },
  eventInfoValue: {
    color: '#333',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#045b26',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 