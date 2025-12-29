import { API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VaccinationRecord {
    id: number;
    pet_id: number;
    user_id: number;
    vaccine_name: string;
    vaccination_date: string;
    expiration_date?: string;
    veterinarian?: string;
    batch_lot_no?: string;
    created_at: string;
}

export interface VaccinationRecordCreate {
    pet_id: number;
    vaccine_name: string;
    vaccination_date: string;
    expiration_date?: string;
    veterinarian?: string;
    batch_lot_no?: string;
}

class VaccinationRecordsAPI {
    private baseURL: string;

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const token = await AsyncStorage.getItem('authToken');
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async getVaccinationRecords(): Promise<VaccinationRecord[]> {
        return this.request('/vaccination-records');
    }

    async getVaccinationRecord(recordId: number): Promise<VaccinationRecord> {
        return this.request(`/vaccination-records/${recordId}`);
    }

    async createVaccinationRecord(data: VaccinationRecordCreate): Promise<VaccinationRecord> {
        return this.request('/vaccination-records', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteVaccinationRecord(recordId: number): Promise<{ message: string }> {
        return this.request(`/vaccination-records/${recordId}`, {
            method: 'DELETE',
        });
    }
}

export const vaccinationRecordsAPI = new VaccinationRecordsAPI();
