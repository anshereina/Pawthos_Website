import { API_BASE_URL } from './config';
import { getAuthToken } from './auth.utils';

export interface MedicalRecord {
    id: number;
    pet_id: number;
    user_id: number;
    reason_for_visit: string;
    date_visited: string;
    date_of_next_visit?: string;
    procedures_done?: string;
    findings?: string;
    recommendations?: string;
    medications?: string;
    vaccine_used?: string;
    veterinarian?: string;
    notes?: string;
    created_at?: string;
}

export interface MedicalRecordCreate {
    pet_id: number;
    reason_for_visit: string;
    date_visited: string;
    date_of_next_visit?: string;
    procedures_done?: string;
    findings?: string;
    recommendations?: string;
    medications?: string;
    vaccine_used?: string;
    veterinarian?: string;
    notes?: string;
}

export interface MedicalVisitData {
    petName: string;
    age: string;
    dateOfBirth: string;
    gender: string;
    reasonForVisit: string;
    dateVisited: string;
    dateOfNextVisit: string;
    proceduresDone: string;
    findings: string;
    recommendations: string;
    medications: string;
    vaccineUsed: string;
}

class MedicalRecordsAPI {
    private baseURL: string;
    
    // Map backend record shape -> frontend shape used by UI
    private mapBackendRecord = (b: any): MedicalRecord => {
        const reason = (b?.reason_for_visit ?? b?.title ?? b?.record_type ?? '').toString();
        const rawDateVisited = b?.date_visited ?? b?.date;
        const rawNextVisit = b?.date_of_next_visit ?? b?.next_due_date;
        const dateVisited = rawDateVisited ? new Date(rawDateVisited).toISOString() : '';
        const nextVisit = rawNextVisit ? new Date(rawNextVisit).toISOString() : undefined;
        return {
            id: Number(b?.id ?? 0),
            pet_id: Number(b?.pet_id ?? 0),
            user_id: Number(b?.user_id ?? 0),
            reason_for_visit: reason,
            date_visited: dateVisited,
            date_of_next_visit: nextVisit,
            procedures_done: b?.procedures_done ?? b?.procedures ?? '',
            findings: b?.findings ?? '',
            recommendations: b?.recommendations ?? '',
            medications: b?.medications ?? '',
            vaccine_used: b?.vaccine_used ?? '',
            veterinarian: b?.veterinarian ?? '',
            notes: b?.notes ?? b?.description ?? '',
            created_at: (b?.created_at ? new Date(b.created_at).toISOString() : undefined),
        } as MedicalRecord;
    }

    constructor() {
        this.baseURL = API_BASE_URL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = await getAuthToken();
        
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            cache: 'no-store',
            ...options,
        };

        // cache-busting query param
        const sep = endpoint.includes('?') ? '&' : '?';
        const url = `${this.baseURL}${endpoint}${sep}t=${Date.now()}`;

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Get all medical records for the current user's pets
    async getMedicalRecords(): Promise<MedicalRecord[]> {
        const raw = await this.request<any[]>('/medical-records');
        return Array.isArray(raw) ? raw.map(this.mapBackendRecord) : [];
    }

    // Get medical records for a specific pet
    async getMedicalRecordsByPet(petId: number): Promise<MedicalRecord[]> {
        const raw = await this.request<any[]>(`/medical-records/pet/${petId}`);
        return Array.isArray(raw) ? raw.map(this.mapBackendRecord) : [];
    }

    // Get a specific medical record by ID
    async getMedicalRecord(recordId: number): Promise<MedicalRecord> {
        const raw = await this.request<any>(`/medical-records/${recordId}`);
        return this.mapBackendRecord(raw);
    }

    // Create a new medical record
    async createMedicalRecord(medicalData: MedicalRecordCreate): Promise<MedicalRecord> {
        return this.request<MedicalRecord>('/medical-records', {
            method: 'POST',
            body: JSON.stringify(medicalData),
        });
    }

    // Delete a medical record
    async deleteMedicalRecord(recordId: number): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/medical-records/${recordId}`, {
            method: 'DELETE',
        });
    }

    // Convert MedicalRecord to MedicalVisitData format for the modal
    convertToMedicalVisitData(record: MedicalRecord, petInfo: any): MedicalVisitData {
        return {
            petName: petInfo?.name || 'Unknown Pet',
            age: this.calculateAge(petInfo?.date_of_birth),
            dateOfBirth: petInfo?.date_of_birth || 'Unknown',
            gender: petInfo?.gender || 'Unknown',
            reasonForVisit: record.reason_for_visit,
            dateVisited: record.date_visited,
            dateOfNextVisit: record.date_of_next_visit || 'Not scheduled',
            proceduresDone: record.procedures_done || 'None',
            findings: record.findings || 'No findings recorded',
            recommendations: record.recommendations || 'No recommendations',
            medications: record.medications || 'None',
            vaccineUsed: record.vaccine_used || 'None',
        };
    }

    // Calculate age from date of birth (years/months/days)
    calculateAge(dateOfBirth: string): string {
        if (!dateOfBirth) return 'Unknown';
        try {
            const birth = new Date(dateOfBirth);
            const now = new Date();
            if (isNaN(birth.getTime())) return 'Unknown';

            // Future dates guard
            if (birth > now) return '0 days old';

            let years = now.getFullYear() - birth.getFullYear();
            let months = now.getMonth() - birth.getMonth();
            let days = now.getDate() - birth.getDate();

            if (days < 0) {
                // borrow days from previous month
                const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                days += prevMonth.getDate();
                months -= 1;
            }
            if (months < 0) {
                months += 12;
                years -= 1;
            }

            if (years <= 0 && months <= 0) {
                // less than a month
                return `${days} day${days === 1 ? '' : 's'} old`;
            }
            if (years <= 0) {
                // less than a year
                if (days > 0) {
                    return `${months} month${months === 1 ? '' : 's'} ${days} day${days === 1 ? '' : 's'} old`;
                }
                return `${months} month${months === 1 ? '' : 's'} old`;
            }
            // years with optional months
            if (months > 0) {
                return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'} old`;
            }
            return `${years} year${years === 1 ? '' : 's'} old`;
        } catch {
            return 'Unknown';
        }
    }

    // Format date for display
    formatDate(dateString: string): string {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }
}

export const medicalRecordsAPI = new MedicalRecordsAPI();
