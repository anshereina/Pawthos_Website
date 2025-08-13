import { useState, useEffect } from 'react';
import { animalControlRecordService, AnimalControlRecord, AnimalControlRecordCreate, AnimalControlRecordUpdate } from '../services/animalControlRecordService';

export const useAnimalControlRecords = () => {
  const [records, setRecords] = useState<AnimalControlRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await animalControlRecordService.getAllRecords();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (record: AnimalControlRecordCreate) => {
    try {
      setError(null);
      const newRecord = await animalControlRecordService.createRecord(record);
      setRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record');
      throw err;
    }
  };

  const updateRecord = async (id: number, record: AnimalControlRecordUpdate) => {
    try {
      setError(null);
      const updatedRecord = await animalControlRecordService.updateRecord(id, record);
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
      await animalControlRecordService.deleteRecord(id);
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