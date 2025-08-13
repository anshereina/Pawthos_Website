import { useState, useEffect } from 'react';
import { meatInspectionRecordService, MeatInspectionRecord, MeatInspectionRecordCreate, MeatInspectionRecordUpdate } from '../services/meatInspectionRecordService';

export const useMeatInspectionRecords = () => {
  const [records, setRecords] = useState<MeatInspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meatInspectionRecordService.getAllRecords();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (record: MeatInspectionRecordCreate) => {
    try {
      setError(null);
      const newRecord = await meatInspectionRecordService.createRecord(record);
      setRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record');
      throw err;
    }
  };

  const updateRecord = async (id: number, record: MeatInspectionRecordUpdate) => {
    try {
      setError(null);
      const updatedRecord = await meatInspectionRecordService.updateRecord(id, record);
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
      await meatInspectionRecordService.deleteRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
      throw err;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return {
    records,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}; 