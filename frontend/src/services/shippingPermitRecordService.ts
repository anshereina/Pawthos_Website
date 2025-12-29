import { config } from '../config';

export interface ShippingPermitRecord {
  id: number;
  owner_name: string;
  contact_number?: string;
  birthdate: string;
  pet_name: string;
  pet_age: number;
  pet_species?: string;
  pet_breed?: string;
  destination?: string;
  purpose?: string;
  permit_number?: string;
  issue_date: string;
  expiry_date: string;
  status?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateShippingPermitRecord {
  owner_name: string;
  contact_number?: string;
  birthdate: string;
  pet_name: string;
  pet_age: number;
  pet_species?: string;
  pet_breed?: string;
  destination?: string;
  purpose?: string;
  permit_number?: string;
  issue_date: string;
  expiry_date: string;
  status?: string;
  remarks?: string;
}

export interface UpdateShippingPermitRecord {
  owner_name?: string;
  contact_number?: string;
  birthdate?: string;
  pet_name?: string;
  pet_age?: number;
  pet_species?: string;
  pet_breed?: string;
  destination?: string;
  purpose?: string;
  permit_number?: string;
  issue_date?: string;
  expiry_date?: string;
  status?: string;
  remarks?: string;
}

export interface OwnerSearchResult {
  owner_name: string;
  contact_number?: string;
  pet_name: string;
  birthdate?: string;
  pet_age: number;
  pet_species?: string;
  pet_breed?: string;
}

class ShippingPermitRecordService {
  private baseUrl = `${config.apiUrl}/shipping-permit-records`;

  async getAllRecords(search?: string, statusFilter?: string): Promise<ShippingPermitRecord[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status_filter', statusFilter);

    const response = await fetch(`${this.baseUrl}/?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shipping permit records');
    }
    return response.json();
  }

  async getRecordById(id: number): Promise<ShippingPermitRecord> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shipping permit record');
    }
    return response.json();
  }

  async createRecord(record: CreateShippingPermitRecord): Promise<ShippingPermitRecord> {
    // Try with trailing slash first, then without
    const url = `${this.baseUrl}/`;
    console.log('Creating record at URL:', url);
    console.log('Record data:', record);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    
    console.log('Create record response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create record error response:', errorText);
      throw new Error(`Failed to create shipping permit record: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async updateRecord(id: number, record: UpdateShippingPermitRecord): Promise<ShippingPermitRecord> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to update shipping permit record');
    }
    return response.json();
  }

  async deleteRecord(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete shipping permit record');
    }
  }

  async getRecordsByDate(date: string): Promise<ShippingPermitRecord[]> {
    const response = await fetch(`${this.baseUrl}/by-date/${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shipping permit records by date');
    }
    return response.json();
  }

  async getRecordsByStatus(status: string): Promise<ShippingPermitRecord[]> {
    const response = await fetch(`${this.baseUrl}/by-status/${status}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shipping permit records by status');
    }
    return response.json();
  }

  async searchOwners(query: string): Promise<OwnerSearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }
    const params = new URLSearchParams({ query });
    const url = `${this.baseUrl}/search-owners?${params.toString()}`;
    console.log('Search owners URL:', url);
    
    try {
      const response = await fetch(url);
      console.log('Search owners response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search owners error response:', errorText);
        throw new Error(`Failed to search owners: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Search owners response data:', data);
      return data;
    } catch (error) {
      console.error('Search owners fetch error:', error);
      throw error;
    }
  }
}

export const shippingPermitRecordService = new ShippingPermitRecordService(); 