import { API_BASE_URL } from '../config';

export interface ReproductiveRecord {
  id: number;
  name: string;
  owner_name: string;
  species: string;
  date?: string;
  date_of_birth?: string;
  color?: string;
  breed?: string;
  gender?: string;
  reproductive_status?: string;
}

export interface CreateReproductiveRecord {
  name: string;
  owner_name: string;
  species: string;
  date?: string;
  date_of_birth?: string;
  color?: string;
  breed?: string;
  gender?: string;
  reproductive_status?: string;
}

const authHeaders = () => {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const reproductiveRecordService = {
  async list(species?: string, search?: string): Promise<ReproductiveRecord[]> {
    const url = new URL(`${API_BASE_URL}/reproductive-records/`);
    if (species) url.searchParams.set('species', species);
    if (search) url.searchParams.set('search', search);
    const res = await fetch(url.toString(), { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch reproductive records');
    return res.json();
  },
  async create(data: CreateReproductiveRecord): Promise<number> {
    const res = await fetch(`${API_BASE_URL}/reproductive-records/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create record');
    const json = await res.json();
    return json.id;
  },
};


