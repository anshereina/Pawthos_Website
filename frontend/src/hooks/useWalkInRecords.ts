import { useState, useCallback } from 'react';
import { walkInService, WalkInRecord, WalkInRecordCreate, WalkInRecordUpdate } from '../services/walkInService';

export const useWalkInRecords = () => {
  const [walkInRecords, setWalkInRecords] = useState<WalkInRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalkInRecords = useCallback(async (params?: {
    search?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await walkInService.getWalkInRecords(params);
      setWalkInRecords(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch walk-in records');
      console.error('Failed to fetch walk-in records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createWalkInRecord = useCallback(async (record: WalkInRecordCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newRecord = await walkInService.createWalkInRecord(record);
      setWalkInRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create walk-in record';
      setError(errorMessage);
      console.error('Failed to create walk-in record:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWalkInRecord = useCallback(async (id: number, record: WalkInRecordUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRecord = await walkInService.updateWalkInRecord(id, record);
      setWalkInRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
      return updatedRecord;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to update walk-in record';
      setError(errorMessage);
      console.error('Failed to update walk-in record:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWalkInRecord = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await walkInService.deleteWalkInRecord(id);
      setWalkInRecords(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete walk-in record';
      setError(errorMessage);
      console.error('Failed to delete walk-in record:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    walkInRecords,
    loading,
    error,
    fetchWalkInRecords,
    createWalkInRecord,
    updateWalkInRecord,
    deleteWalkInRecord
  };
};

