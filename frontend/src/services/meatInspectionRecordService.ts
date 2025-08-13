import { config } from '../config';

export interface MeatInspectionRecord {
  id: number;
  date_of_inspection: string;
  time: string;
  dealer_name: string;
  kilos: number;
  date_of_slaughter: string;
  certificate_issued: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  inspector_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface MeatInspectionRecordCreate {
  date_of_inspection: string;
  time: string;
  dealer_name: string;
  kilos: number;
  date_of_slaughter: string;
  certificate_issued: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  inspector_name?: string;
}

export interface MeatInspectionRecordUpdate {
  date_of_inspection?: string;
  time?: string;
  dealer_name?: string;
  kilos?: number;
  date_of_slaughter?: string;
  certificate_issued?: boolean;
  status?: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  inspector_name?: string;
}

const API_BASE_URL = config.apiUrl;

export const meatInspectionRecordService = {
  async getAllRecords(): Promise<MeatInspectionRecord[]> {
    const response = await fetch(`${API_BASE_URL}/meat-inspection-records/`);
    if (!response.ok) {
      throw new Error('Failed to fetch meat inspection records');
    }
    return response.json();
  },

  async getRecordById(id: number): Promise<MeatInspectionRecord> {
    const response = await fetch(`${API_BASE_URL}/meat-inspection-records/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch meat inspection record');
    }
    return response.json();
  },

  async createRecord(record: MeatInspectionRecordCreate): Promise<MeatInspectionRecord> {
    const response = await fetch(`${API_BASE_URL}/meat-inspection-records/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to create meat inspection record');
    }
    return response.json();
  },

  async updateRecord(id: number, record: MeatInspectionRecordUpdate): Promise<MeatInspectionRecord> {
    const response = await fetch(`${API_BASE_URL}/meat-inspection-records/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to update meat inspection record');
    }
    return response.json();
  },

  async deleteRecord(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/meat-inspection-records/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete meat inspection record');
    }
  },
}; 