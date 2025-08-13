import { useState, useEffect, useCallback } from 'react';
import { alertService, Alert, CreateAlertData, UpdateAlertData } from '../services/alertService';

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlert = useCallback(async (alertData: CreateAlertData) => {
    try {
      setError(null);
      const newAlert = await alertService.createAlert(alertData);
      setAlerts(prev => [...prev, newAlert]);
      return newAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
      throw err;
    }
  }, []);

  const updateAlert = useCallback(async (alertId: string, updateData: UpdateAlertData) => {
    try {
      setError(null);
      const updatedAlert = await alertService.updateAlert(alertId, updateData);
      setAlerts(prev => prev.map(alert => 
        alert.alert_id === alertId ? updatedAlert : alert
      ));
      return updatedAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
      throw err;
    }
  }, []);

  const deleteAlert = useCallback(async (alertId: string) => {
    try {
      setError(null);
      await alertService.deleteAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.alert_id !== alertId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert');
      throw err;
    }
  }, []);

  const searchAlerts = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertService.searchAlerts(query);
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAlertsByPriority = useCallback(async (priority: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertService.getAlertsByPriority(priority);
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts by priority');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    searchAlerts,
    getAlertsByPriority,
  };
}; 