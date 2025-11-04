import { config } from '../config';

export interface PostAbattoirRecord {
  id: number;
  date: string;
  time: string;
  barangay: string;
  establishment: string;
  doc_mic: boolean;
  doc_vhc: boolean;
  doc_sp: boolean;
  color_ok: boolean;
  texture_ok: boolean;
  odor_ok: boolean;
  condem: boolean;
  owner: string;
}

export type PostAbattoirRecordCreate = Omit<PostAbattoirRecord, 'id'>;
export type PostAbattoirRecordUpdate = Partial<PostAbattoirRecordCreate>;

const API_BASE_URL = config.apiUrl;

export const postAbattoirRecordService = {
  async getAll(): Promise<PostAbattoirRecord[]> {
    const res = await fetch(`${API_BASE_URL}/post-abattoir-records/`);
    if (!res.ok) throw new Error('Failed to fetch post abattoir records');
    return res.json();
  },
  async create(payload: PostAbattoirRecordCreate): Promise<PostAbattoirRecord> {
    const res = await fetch(`${API_BASE_URL}/post-abattoir-records/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create post abattoir record');
    return res.json();
  },
  async update(id: number, payload: PostAbattoirRecordUpdate): Promise<PostAbattoirRecord> {
    const res = await fetch(`${API_BASE_URL}/post-abattoir-records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update post abattoir record');
    return res.json();
  },
  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/post-abattoir-records/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete post abattoir record');
  },
};


