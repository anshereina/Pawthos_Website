import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getUserAlerts, Alert as AlertType } from '../../utils/alerts.utils';
import { getCurrentUser } from '../../utils/auth.utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: number;
  type: string;
  icon: React.ReactNode;
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  priority?: string;
}

const READ_NOTIFICATIONS_KEY = '@read_notifications';
const CLEARED_NOTIFICATIONS_KEY = '@cleared_notifications';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch alerts when component mounts
  useEffect(() => {
    fetchAlerts();
  }, []);
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  // Load read notification IDs from AsyncStorage
  const loadReadNotifications = async (): Promise<Set<number>> => {
    try {
      const stored = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.error('Error loading read notifications:', error);
      return new Set();
    }
  };

  // Save read notification IDs to AsyncStorage
  const saveReadNotifications = async (readIds: Set<number>) => {
    try {
      await AsyncStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(readIds)));
    } catch (error) {
      console.error('Error saving read notifications:', error);
    }
  };

  // Load cleared notification IDs from AsyncStorage
  const loadClearedNotifications = async (): Promise<Set<number>> => {
    try {
      const stored = await AsyncStorage.getItem(CLEARED_NOTIFICATIONS_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.error('Error loading cleared notifications:', error);
      return new Set();
    }
  };

  // Save cleared notification IDs to AsyncStorage
  const saveClearedNotifications = async (clearedIds: Set<number>) => {
    try {
      await AsyncStorage.setItem(CLEARED_NOTIFICATIONS_KEY, JSON.stringify(Array.from(clearedIds)));
    } catch (error) {
      console.error('Error saving cleared notifications:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user to get their email
      const user = await getCurrentUser();
      if (!user || !user.email) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      // Fetch alerts for this user
      const alerts = await getUserAlerts(user.email);
      
      // Load read and cleared notification IDs from AsyncStorage
      const [readIds, clearedIds] = await Promise.all([
        loadReadNotifications(),
        loadClearedNotifications()
      ]);
      
      // Convert alerts to notifications format and filter out cleared ones
      const formattedNotifications: Notification[] = alerts
        .filter((alert: AlertType) => !clearedIds.has(alert.id)) // Filter out cleared notifications
        .map((alert: AlertType) => ({
          id: alert.id,
          type: alert.priority === 'Critical' || alert.priority === 'High' ? 'alert' : 'notification',
          icon: alert.priority === 'Critical' || alert.priority === 'High' 
            ? <MaterialIcons name="warning" size={28} color="#fff" style={{ marginRight: 12 }} />
            : <Ionicons name="notifications" size={28} color="#fff" style={{ marginRight: 12 }} />,
          title: alert.title,
          content: alert.message,
          date: new Date(alert.created_at).toLocaleDateString(),
          isRead: readIds.has(alert.id), // Set isRead based on AsyncStorage
          priority: alert.priority,
        }));

      setNotifications(formattedNotifications);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) {
      return;
    }
    
    // Mark all notifications as read
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })));
    
    // Save all notification IDs as read to AsyncStorage
    const readIds = await loadReadNotifications();
    notifications.forEach(n => readIds.add(n.id));
    await saveReadNotifications(readIds);
    
    // Show success message
    Alert.alert(
      'Success',
      `Marked ${notifications.length} notification${notifications.length === 1 ? '' : 's'} as read.`,
      [{ text: 'OK' }]
    );
  };

  const clearNotifications = () => {
    if (notifications.length === 0) {
      return;
    }
    
    Alert.alert(
      'Clear All Notifications',
      `Are you sure you want to permanently clear ${notifications.length} notification${notifications.length === 1 ? '' : 's'}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const count = notifications.length;
            
            // Save cleared notification IDs to AsyncStorage
            const clearedIds = await loadClearedNotifications();
            notifications.forEach(n => clearedIds.add(n.id));
            await saveClearedNotifications(clearedIds);
            
            // Also remove them from read notifications since they're cleared
            const readIds = await loadReadNotifications();
            notifications.forEach(n => readIds.delete(n.id));
            await saveReadNotifications(readIds);
            
            setNotifications([]);
            
            // Show success message
            Alert.alert(
              'Success',
              `Cleared ${count} notification${count === 1 ? '' : 's'}.`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const markAsRead = async (notificationId: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
    
    // Save to AsyncStorage
    const readIds = await loadReadNotifications();
    readIds.add(notificationId);
    await saveReadNotifications(readIds);
  };

  const hasUnreadNotifications = notifications.some(notification => !notification.isRead);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={markAllAsRead} disabled={!hasUnreadNotifications}>
              <Text style={[styles.markAll, !hasUnreadNotifications && styles.disabledText]}>
                Mark all as read
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearNotifications} disabled={notifications.length === 0}>
              <Text style={[styles.clearAll, notifications.length === 0 && styles.disabledText]}>
                Clear notifications
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Notification Feed */}
      <ScrollView 
        style={styles.feed} 
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchAlerts} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications.</Text>
        ) : (
          notifications.map((n) => (
            <TouchableOpacity 
              key={n.id} 
              style={[styles.notificationBox, n.isRead && { opacity: 0.5 }]}
              onPress={() => markAsRead(n.id)}
              activeOpacity={0.7}
            > 
              <View style={styles.iconCol}>{n.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notificationTitle}>{n.title}</Text>
                <Text style={styles.notificationContent}>{n.content}</Text>
                <Text style={styles.notificationDate}>{n.date}</Text>
                {!n.isRead && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 16,
  },
  headerRow: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  markAll: {
    color: '#D37F52',
    fontWeight: 'bold',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  clearAll: {
    color: '#D37F52',
    fontWeight: 'bold',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
    marginTop: 0,
  },
  disabledText: {
    color: '#ccc',
    fontWeight: 'bold',
    fontSize: 12,
  },
  feed: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  iconCol: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 4,
  },
  notificationContent: {
    color: '#fff',
    fontSize: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  loadingText: {
    color: '#4CAF50',
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationDate: {
    color: '#e0e0e0',
    fontSize: 12,
    marginTop: 4,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 