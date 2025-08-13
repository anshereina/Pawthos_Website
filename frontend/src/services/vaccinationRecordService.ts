import { API_BASE_URL } from '../config';

export interface VaccinationRecord {
  id: number;
  pet_id: number;
  date_of_vaccination: string;
  vaccine_used: string;
  batch_no_lot_no: string;
  date_of_next_vaccination?: string;
  veterinarian_lic_no_ptr: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateVaccinationRecordData {
  date_of_vaccination: string;
  vaccine_used: string;
  batch_no_lot_no: string;
  date_of_next_vaccination?: string;
  veterinarian_lic_no_ptr: string;
}

export interface UpdateVaccinationRecordData {
  date_of_vaccination?: string;
  vaccine_used?: string;
  batch_no_lot_no?: string;
  date_of_next_vaccination?: string;
  veterinarian_lic_no_ptr?: string;
}

export interface VaccinationStatistics {
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
  total_vaccinations: number;
}

class VaccinationRecordService {
  private baseUrl = `${API_BASE_URL}/vaccination-records`;

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

  async getVaccinationStatistics(date?: string): Promise<VaccinationStatistics> {
    const url = new URL(`${this.baseUrl}/statistics/dashboard`);
    if (date) {
      url.searchParams.append('date', date);
    }
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vaccination statistics');
    }
    
    return response.json();
  }

  async getVaccinationRecordsByPet(petId: number): Promise<VaccinationRecord[]> {
    const response = await fetch(`${this.baseUrl}/pet/${petId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vaccination records');
    }
    
    return response.json();
  }

  async getVaccinationRecord(recordId: number): Promise<VaccinationRecord> {
    const response = await fetch(`${this.baseUrl}/${recordId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vaccination record');
    }
    
    return response.json();
  }

  async createVaccinationRecord(petId: number, recordData: CreateVaccinationRecordData): Promise<VaccinationRecord> {
    const payload = { ...recordData, pet_id: petId };
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create vaccination record');
    }
    
    return response.json();
  }

  async updateVaccinationRecord(recordId: number, recordData: UpdateVaccinationRecordData): Promise<VaccinationRecord> {
    const response = await fetch(`${this.baseUrl}/${recordId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(recordData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update vaccination record');
    }
    
    return response.json();
  }

  async deleteVaccinationRecord(recordId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${recordId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete vaccination record');
    }
  }

  async getAllVaccinationRecords(): Promise<VaccinationRecord[]> {
    const token = localStorage.getItem('access_token');
    console.log('Fetching all vaccination records with token:', token, 'URL:', `${this.baseUrl}/`);
    const response = await fetch(`${this.baseUrl}/`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch all vaccination records');
    }
    return response.json();
  }
}

export const vaccinationRecordService = new VaccinationRecordService(); 