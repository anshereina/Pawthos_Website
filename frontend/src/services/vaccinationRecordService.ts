import { API_BASE_URL } from '../config';

export interface VaccinationRecord {
  id: number;
  pet_id: number;
  user_id: number;
  vaccine_name: string;
  vaccination_date: string;
  expiration_date?: string;
  veterinarian: string;
  batch_lot_no: string;
  created_at: string;
  updated_at?: string;
}

// Enhanced interface for displaying pet information
export interface VaccinationRecordWithPet extends VaccinationRecord {
  pet_name?: string;
  pet_species?: string;
}

export interface CreateVaccinationRecordData {
  vaccine_name: string;
  vaccination_date: string;
  expiration_date?: string;
  veterinarian: string;
  batch_lot_no: string;
}

export interface UpdateVaccinationRecordData {
  vaccine_name?: string;
  vaccination_date?: string;
  expiration_date?: string;
  veterinarian?: string;
  batch_lot_no?: string;
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

export interface YearlyVaccinationStatistics {
  year: number;
  monthly_data: Array<{
    month: string;
    canineMale: number;
    canineFemale: number;
    felineMale: number;
    felineFemale: number;
  }>;
  summary: {
    total_canine: number;
    total_feline: number;
    peak_month: string;
  };
}

class VaccinationRecordService {
  private baseUrl = `${API_BASE_URL}/vaccination-records/`;

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
    const url = new URL(`${this.baseUrl}statistics/dashboard`);
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

  async getYearlyVaccinationStatistics(year?: number): Promise<YearlyVaccinationStatistics> {
    const url = new URL(`${this.baseUrl}statistics/yearly`);
    if (year) {
      url.searchParams.append('year', year.toString());
    }
    
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch yearly vaccination statistics');
    }
    
    return response.json();
  }

  async getVaccinationRecordsByPet(petId: number): Promise<VaccinationRecord[]> {
    const response = await fetch(`${this.baseUrl}pet/${petId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vaccination records');
    }
    
    return response.json();
  }

  async getVaccinationRecord(recordId: number): Promise<VaccinationRecord> {
    const response = await fetch(`${this.baseUrl}${recordId}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vaccination record');
    }
    
    return response.json();
  }

  async createVaccinationRecord(petId: number, recordData: CreateVaccinationRecordData): Promise<VaccinationRecord> {
    const payload = { ...recordData, pet_id: petId };
    const response = await fetch(`${this.baseUrl}`, {
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
    const response = await fetch(`${this.baseUrl}${recordId}`, {
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
    const response = await fetch(`${this.baseUrl}${recordId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete vaccination record');
    }
  }

  async getAllVaccinationRecords(): Promise<VaccinationRecord[]> {
    const response = await fetch(`${this.baseUrl}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch all vaccination records');
    }
    return response.json();
  }

  // Enhanced method to get vaccination records with pet information
  async getVaccinationRecordsWithPets(): Promise<VaccinationRecordWithPet[]> {
    const response = await fetch(`${this.baseUrl}with-pets`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vaccination records');
    }
    return response.json();
  }
}

export const vaccinationRecordService = new VaccinationRecordService(); 