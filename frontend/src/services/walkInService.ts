import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface WalkInRecord {
  id: number;
  date?: string;
  client_name?: string;
  contact_no?: string;
  pet_name?: string;
  pet_birthday?: string;
  breed?: string;
  age?: string;
  gender?: string;
  service_type?: string;
  medicine_used?: string;
  pet_id?: number;
  handled_by?: string;
  status?: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface WalkInRecordCreate {
  date?: string;
  client_name: string;
  contact_no?: string;
  pet_name: string;
  pet_birthday?: string;
  breed?: string;
  age?: string;
  gender?: string;
  service_type?: string;
  medicine_used?: string;
  pet_id?: number;
  handled_by?: string;
}

export interface WalkInRecordUpdate {
  date?: string;
  client_name?: string;
  contact_no?: string;
  pet_name?: string;
  pet_birthday?: string;
  breed?: string;
  age?: string;
  gender?: string;
  service_type?: string;
  medicine_used?: string;
  handled_by?: string;
  status?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Walk-In Record API functions
export const walkInService = {
  // Get all walk-in records
  getWalkInRecords: async (params?: {
    search?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<WalkInRecord[]> => {
    // Filter out empty parameters
    const filteredParams = params ? Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
    ) : undefined;
    
    const response = await axios.get(`${API_BASE_URL}/walk-ins/`, {
      headers: getAuthHeaders(),
      params: filteredParams
    });
    return response.data;
  },

  // Get walk-in record by ID
  getWalkInRecord: async (id: number): Promise<WalkInRecord> => {
    const response = await axios.get(`${API_BASE_URL}/walk-ins/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Create walk-in record
  createWalkInRecord: async (record: WalkInRecordCreate): Promise<WalkInRecord> => {
    const response = await axios.post(`${API_BASE_URL}/walk-ins/`, record, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Update walk-in record
  updateWalkInRecord: async (id: number, record: WalkInRecordUpdate): Promise<WalkInRecord> => {
    const response = await axios.put(`${API_BASE_URL}/walk-ins/${id}`, record, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Delete walk-in record
  deleteWalkInRecord: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/walk-ins/${id}`, {
      headers: getAuthHeaders()
    });
  }
};

