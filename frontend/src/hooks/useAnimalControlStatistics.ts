import { useState, useEffect, useCallback } from 'react';
import { animalControlRecordService, AnimalControlStatistics } from '../services/animalControlRecordService';

export const useAnimalControlStatistics = (date?: string) => {
  const [statistics, setStatistics] = useState<AnimalControlStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await animalControlRecordService.getAnimalControlStatistics(date);
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch animal control statistics');
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