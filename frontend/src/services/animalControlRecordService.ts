import { config } from '../config';

export interface AnimalControlRecord {
  id: number;
  owner_name: string;
  contact_number?: string;
  address?: string;
  record_type: 'catch' | 'surrendered';
  detail?: string;
  species?: string;  // feline, canine, etc.
  breed?: string;
  gender?: string;   // male, female
  date: string;
  image_url?: string;  // URL to animal photo
  created_at: string;
  updated_at?: string;
}

export interface AnimalControlRecordCreate {
  owner_name: string;
  contact_number?: string;
  address?: string;
  record_type: 'catch' | 'surrendered';
  detail?: string;
  species?: string;
  breed?: string;
  gender?: string;
  date: string;
  image_url?: string;  // URL to animal photo
}

export interface AnimalControlRecordUpdate {
  owner_name?: string;
  contact_number?: string;
  address?: string;
  record_type?: 'catch' | 'surrendered';
  detail?: string;
  species?: string;
  breed?: string;
  gender?: string;
  date?: string;
  image_url?: string;  // URL to animal photo
}

export interface AnimalControlStatistics {
  feline: {
    male: number;
    female: number;
    total: number;
  };
  canine: {
    male: number;
    female: number;
    total: number;
  };
  total_catches: number;
}

const API_BASE_URL = config.apiUrl;

export const animalControlRecordService = {
  async getAllRecords(): Promise<AnimalControlRecord[]> {
    const response = await fetch(`${API_BASE_URL}/animal-control-records/`);
    if (!response.ok) {
      throw new Error('Failed to fetch animal control records');
    }
    return response.json();
  },

  async getAnimalControlStatistics(date?: string): Promise<AnimalControlStatistics> {
    const url = new URL(`${API_BASE_URL}/animal-control-records/statistics/dashboard`);
    if (date) {
      url.searchParams.append('date', date);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Animal control statistics error:', response.status, errorText);
      throw new Error('Failed to fetch animal control statistics');
    }
    
    const data = await response.json();
    return data;
  },

  async getRecordById(id: number): Promise<AnimalControlRecord> {
    const response = await fetch(`${API_BASE_URL}/animal-control-records/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch animal control record');
    }
    return response.json();
  },

  async createRecord(record: AnimalControlRecordCreate): Promise<AnimalControlRecord> {
    const response = await fetch(`${API_BASE_URL}/animal-control-records/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to create animal control record');
    }
    return response.json();
  },

  async updateRecord(id: number, record: AnimalControlRecordUpdate): Promise<AnimalControlRecord> {
    // Filter out undefined values to avoid sending them
    const filteredRecord = Object.fromEntries(
      Object.entries(record).filter(([_, value]) => value !== undefined && value !== null)
    );
    
    console.log('Sending update data:', filteredRecord);
    
    const response = await fetch(`${API_BASE_URL}/animal-control-records/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filteredRecord),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update record error:', response.status, errorText);
      throw new Error(`Failed to update animal control record: ${response.status} ${errorText}`);
    }
    return response.json();
  },

  async deleteRecord(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/animal-control-records/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete animal control record');
    }
  },
}; 