import { useEffect, useState } from 'react';
import { postAbattoirRecordService, PostAbattoirRecord, PostAbattoirRecordCreate, PostAbattoirRecordUpdate } from '../services/postAbattoirRecordService';

export const usePostAbattoirRecords = () => {
  const [records, setRecords] = useState<PostAbattoirRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await postAbattoirRecordService.getAll();
      setRecords(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const createRecord = async (payload: PostAbattoirRecordCreate) => {
    await postAbattoirRecordService.create(payload);
    await fetchAll();
  };

  const updateRecord = async (id: number, payload: PostAbattoirRecordUpdate) => {
    await postAbattoirRecordService.update(id, payload);
    await fetchAll();
  };

  const deleteRecord = async (id: number) => {
    await postAbattoirRecordService.remove(id);
    await fetchAll();
  };

  return { records, loading, error, createRecord, updateRecord, deleteRecord };
};


