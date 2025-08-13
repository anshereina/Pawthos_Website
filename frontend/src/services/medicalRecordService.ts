import { API_BASE_URL } from '../config';

export interface MedicalRecord {
  id: number;
  pet_id: number;
  reason_for_visit: string;
  date_of_visit: string;
  next_visit?: string;
  procedure_done: string;
  findings: string;
  recommendation: string;
  vaccine_used_medication: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateMedicalRecordData {
  reason_for_visit: string;
  date_of_visit: string;
  next_visit?: string;
  procedure_done: string;
  findings: string;
  recommendation: string;
  vaccine_used_medication: string;
}

export interface UpdateMedicalRecordData {
  reason_for_visit?: string;
  date_of_visit?: string;
  next_visit?: string;
  procedure_done?: string;
  findings?: string;
  recommendation?: string;
  vaccine_used_medication?: string;
}

class MedicalRecordService {
  private baseUrl = `${API_BASE_URL}/medical-records`;

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async getMedicalRecordsByPet(petId: number): Promise<MedicalRecord[]> {
    const response = await fetch(`${this.baseUrl}/pet/${petId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch medical records');
    }
    
    return response.json();
  }

  async getMedicalRecord(recordId: number): Promise<MedicalRecord> {
    const response = await fetch(`${this.baseUrl}/${recordId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch medical record');
    }
    
    return response.json();
  }

  async createMedicalRecord(petId: number, recordData: CreateMedicalRecordData): Promise<MedicalRecord> {
    const response = await fetch(`${this.baseUrl}/pet/${petId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(recordData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create medical record');
    }
    
    return response.json();
  }

  async updateMedicalRecord(recordId: number, recordData: UpdateMedicalRecordData): Promise<MedicalRecord> {
    const response = await fetch(`${this.baseUrl}/${recordId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(recordData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update medical record');
    }
    
    return response.json();
  }

  async deleteMedicalRecord(recordId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${recordId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete medical record');
    }
  }
}

export const medicalRecordService = new MedicalRecordService(); 