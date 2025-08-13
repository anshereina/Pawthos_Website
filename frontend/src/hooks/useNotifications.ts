import { useState, useEffect, useCallback } from 'react';
import { alertService, Alert } from '../services/alertService';
import { reportService, Report } from '../services/reportService';
import { useAuth } from '../features/auth/AuthContext';

export interface Notification {
  id: string;
  type: 'alert' | 'report';
  title: string;
  message: string;
  sender: string;
  date: string;
  priority?: string;
  status?: string;
  isRead?: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load cleared notifications from localStorage
  const [clearedNotifications, setClearedNotifications] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('clearedNotifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.error('Error loading cleared notifications from localStorage:', error);
      return new Set();
    }
  });

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Don't fetch if user is not available
      if (!user?.email) {
        setNotifications([]);
        return;
      }
      
      // Fetch alerts and reports in parallel
      const [alertsResponse, reportsResponse] = await Promise.all([
        alertService.getAlerts(),
        reportService.getReports()
      ]);

      // Filter and transform alerts into notifications
      const alertNotifications: Notification[] = alertsResponse
        .filter((alert: Alert) => {
          console.log(`Checking alert ${alert.alert_id}:`, {
            alertSender: alert.submitted_by_email,
            currentUser: user.email,
            recipients: alert.recipients,
            isSender: alert.submitted_by_email === user.email
          });
          
          // Don't show if user is the sender
          if (alert.submitted_by_email === user.email) {
            console.log(`Filtering out alert ${alert.alert_id} - user is sender`);
            return false;
          }
          
          // Don't show if notification was cleared
          if (clearedNotifications.has(alert.alert_id)) {
            console.log(`Filtering out alert ${alert.alert_id} - was cleared`);
            return false;
          }
          
          // Check if user is in recipients
          if (alert.recipients) {
            try {
              const recipients = JSON.parse(alert.recipients);
              console.log(`Alert ${alert.alert_id} recipients:`, recipients);
              if (Array.isArray(recipients) && recipients.includes(user.email)) {
                console.log(`Including alert ${alert.alert_id} - user is recipient`);
                return true;
              }
            } catch (e) {
              console.error('Error parsing recipients:', e);
            }
          }
          
          console.log(`Filtering out alert ${alert.alert_id} - user is not recipient`);
          return false;
        })
        .map((alert: Alert) => ({
          id: alert.alert_id,
          type: 'alert' as const,
          title: alert.title,
          message: alert.message,
          sender: alert.submitted_by,
          date: alert.created_at,
          priority: alert.priority
        }));

      // Filter and transform reports into notifications
      const reportNotifications: Notification[] = reportsResponse
        .filter((report: Report) => {
          console.log(`Checking report ${report.report_id}:`, {
            reportSender: report.submitted_by_email,
            currentUser: user.email,
            isSender: report.submitted_by_email === user.email
          });
          
          // Don't show if user is the sender
          if (report.submitted_by_email === user.email) {
            console.log(`Filtering out report ${report.report_id} - user is sender`);
            return false;
          }
          
          // Don't show if notification was cleared
          if (clearedNotifications.has(report.report_id)) {
            console.log(`Filtering out report ${report.report_id} - was cleared`);
            return false;
          }
          
          // For reports, we'll show them to all users except the sender
          // You can modify this logic if reports have specific recipients
          console.log(`Including report ${report.report_id} - user is not sender`);
          return true;
        })
        .map((report: Report) => ({
          id: report.report_id,
          type: 'report' as const,
          title: report.title,
          message: report.description,
          sender: report.submitted_by,
          date: report.created_at,
          status: report.status
        }));

      // Combine and sort by date (newest first)
      const allNotifications = [...alertNotifications, ...reportNotifications]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log('Notifications - Current user email:', user.email);
      console.log('Notifications - All alerts:', alertsResponse.length);
      console.log('Notifications - All reports:', reportsResponse.length);
      console.log('Notifications - Filtered alerts:', alertNotifications.length);
      console.log('Notifications - Filtered reports:', reportNotifications.length);
      console.log('Notifications - Final notifications:', allNotifications.length);

      setNotifications(allNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.email, clearedNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, user?.email]);

  // Refresh notifications when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isRead: true
    })));
  }, []);

  const clearNotifications = useCallback(() => {
    // Add all current notification IDs to the cleared set
    setClearedNotifications(prev => {
      const newSet = new Set(prev);
      notifications.forEach(notification => {
        newSet.add(notification.id);
      });
      
      // Save to localStorage
      try {
        localStorage.setItem('clearedNotifications', JSON.stringify(Array.from(newSet)));
      } catch (error) {
        console.error('Error saving cleared notifications to localStorage:', error);
      }
      
      return newSet;
    });
    setNotifications([]);
  }, [notifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
  }, []);

  const resetClearedNotifications = useCallback(() => {
    setClearedNotifications(new Set());
    try {
      localStorage.removeItem('clearedNotifications');
    } catch (error) {
      console.error('Error removing cleared notifications from localStorage:', error);
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
    clearNotifications,
    markAsRead,
    resetClearedNotifications,
  };
}; 