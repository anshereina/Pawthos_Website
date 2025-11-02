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
  is_reproductive_record?: boolean;  // True for ReproductiveRecord entries, false for Pet fallback entries
  pet_id?: string | null;  // Pet ID if record is linked to a Pet
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
  async update(id: number, data: CreateReproductiveRecord): Promise<number> {
    const url = `${API_BASE_URL}/reproductive-records/${id}`;
    console.log('Updating reproductive record at:', url);
    console.log('Record data:', data);
    
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      
      console.log('Update reproductive record response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Update reproductive record error:', errorText);
        throw new Error(`Failed to update record: ${res.status} ${res.statusText}`);
      }
      
      const json = await res.json();
      console.log('Update reproductive record response:', json);
      return json.id;
    } catch (error) {
      console.error('Update reproductive record fetch error:', error);
      throw error;
    }
  },
  async delete(id: number): Promise<void> {
    const url = `${API_BASE_URL}/reproductive-records/${id}`;
    console.log('Deleting reproductive record at:', url);
    
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      
      console.log('Delete reproductive record response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Delete reproductive record error:', errorText);
        throw new Error(`Failed to delete record: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error('Delete reproductive record fetch error:', error);
      throw error;
    }
  },
};


