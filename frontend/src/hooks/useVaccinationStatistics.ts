import { useState, useEffect, useCallback } from 'react';
import { vaccinationRecordService, VaccinationStatistics } from '../services/vaccinationRecordService';

export const useVaccinationStatistics = (date?: string) => {
  const [statistics, setStatistics] = useState<VaccinationStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vaccinationRecordService.getVaccinationStatistics(date);
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vaccination statistics');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const refreshStatistics = () => {
    fetchStatistics();
  };

  return {
    statistics,
    loading,
    error,
    refreshStatistics,
  };
}; 