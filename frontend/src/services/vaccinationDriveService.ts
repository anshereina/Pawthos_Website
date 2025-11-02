import { config } from '../config';

export interface PetVaccinationRecord {
  id: number;
  owner_name: string;
  pet_name: string;
  owner_contact: string;
  species: string;
  breed: string;
  color: string;
  age: string;
  sex: string;
  other_services: string[];
  vaccine_used: string;
  batch_no_lot_no: string;
  vaccination_date: string;
  event_id: number;
}

export interface VaccinationDriveData {
  event_id: number;
  vaccine_used: string;
  batch_no_lot_no: string;
  pet_records: Omit<PetVaccinationRecord, 'id' | 'event_id'>[];
}

class VaccinationDriveService {
  private baseUrl = `${config.apiUrl}/vaccination-drives`;

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

  async saveVaccinationDrive(driveData: VaccinationDriveData): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(driveData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save vaccination drive:', response.status, response.statusText, errorText);
        throw new Error(`Failed to save vaccination drive: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving vaccination drive:', error);
      throw error;
    }
  }

  async getVaccinationDriveByEvent(eventId: number): Promise<PetVaccinationRecord[]> {
    const response = await fetch(`${this.baseUrl}/event/${eventId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vaccination drive records');
    }

    return response.json();
  }

  async deleteVaccinationDrivesByEvent(eventId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/event/${eventId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete vaccination drives');
    }
  }
}

export const vaccinationDriveService = new VaccinationDriveService(); 