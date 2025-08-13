import { useState, useEffect, useCallback } from 'react';
import { 
  ShippingPermitRecord, 
  CreateShippingPermitRecord, 
  UpdateShippingPermitRecord,
  shippingPermitRecordService 
} from '../services/shippingPermitRecordService';

export const useShippingPermitRecords = () => {
  const [records, setRecords] = useState<ShippingPermitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shippingPermitRecordService.getAllRecords(search, statusFilter);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const createRecord = async (record: CreateShippingPermitRecord) => {
    try {
      setError(null);
      const newRecord = await shippingPermitRecordService.createRecord(record);
      setRecords(prev => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record');
      throw err;
    }
  };

  const updateRecord = async (id: number, record: UpdateShippingPermitRecord) => {
    try {
      setError(null);
      const updatedRecord = await shippingPermitRecordService.updateRecord(id, record);
      setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
      return updatedRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
      throw err;
    }
  };

  const deleteRecord = async (id: number) => {
    try {
      setError(null);
      await shippingPermitRecordService.deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
      throw err;
    }
  };

  const getRecordById = async (id: number) => {
    try {
      setError(null);
      return await shippingPermitRecordService.getRecordById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch record');
      throw err;
    }
  };

  const getRecordsByDate = async (date: string) => {
    try {
      setError(null);
      return await shippingPermitRecordService.getRecordsByDate(date);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records by date');
      throw err;
    }
  };

  const getRecordsByStatus = async (status: string) => {
    try {
      setError(null);
      return await shippingPermitRecordService.getRecordsByStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records by status');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return {
    records,
    loading,
    error,
    search,
    statusFilter,
    setSearch,
    setStatusFilter,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecordById,
    getRecordsByDate,
    getRecordsByStatus,
    fetchRecords,
    clearError,
  };
}; 