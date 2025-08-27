import { useState, useEffect } from 'react';
import { medicalRecordService, MedicalRecord, CreateMedicalRecordData, UpdateMedicalRecordData } from '../services/medicalRecordService';

export const useMedicalRecords = (petId?: number) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let records: MedicalRecord[];
      if (petId) {
        records = await medicalRecordService.getMedicalRecordsByPet(petId);
      } else {
        records = await medicalRecordService.getAllMedicalRecords();
      }
      setMedicalRecords(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  const createMedicalRecord = async (recordData: CreateMedicalRecordData) => {
    if (!petId) throw new Error('Pet ID is required');
    
    setLoading(true);
    setError(null);
    
    try {
      const newRecord = await medicalRecordService.createMedicalRecord(petId, recordData);
      setMedicalRecords(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create medical record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMedicalRecord = async (recordId: number, recordData: UpdateMedicalRecordData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedRecord = await medicalRecordService.updateMedicalRecord(recordId, recordData);
      setMedicalRecords(prev => 
        prev.map(record => 
          record.id === recordId ? updatedRecord : record
        )
      );
      return updatedRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medical record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicalRecord = async (recordId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await medicalRecordService.deleteMedicalRecord(recordId);
      setMedicalRecords(prev => prev.filter(record => record.id !== recordId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medical record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, [petId]);

  return {
    medicalRecords,
    loading,
    error,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    refetch: fetchMedicalRecords,
  };
};
