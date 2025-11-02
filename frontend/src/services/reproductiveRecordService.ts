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
    
    console.log('Fetching reproductive records from:', url.toString());
    
    try {
      const res = await fetch(url.toString(), { headers: authHeaders() });
      console.log('Reproductive records response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Reproductive records error:', errorText);
        throw new Error(`Failed to fetch reproductive records: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Reproductive records data:', data);
      return data;
    } catch (error) {
      console.error('Reproductive records fetch error:', error);
      throw error;
    }
  },
  async create(data: CreateReproductiveRecord): Promise<number> {
    const url = `${API_BASE_URL}/reproductive-records/`;
    console.log('Creating reproductive record at:', url);
    console.log('Record data:', data);
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      
      console.log('Create reproductive record response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Create reproductive record error:', errorText);
        throw new Error(`Failed to create record: ${res.status} ${res.statusText}`);
      }
      
      const json = await res.json();
      console.log('Create reproductive record response:', json);
      return json.id;
    } catch (error) {
      console.error('Create reproductive record fetch error:', error);
      throw error;
    }
  },
};


