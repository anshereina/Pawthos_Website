// Dashboard API utilities
import { getApiUrl } from './config';
import { getAuthToken } from './auth.utils';

const API_BASE_URL = getApiUrl();

export interface DashboardData {
  user: {
    id: number;
    name?: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    createdAt: string;
  };
  pets_count: number;
  upcoming_appointments: AppointmentData[];
  recent_pets: PetData[];
}

export interface PetData {
  id: number;
  pet_id: string;
  name: string;
  owner_name: string;
  species: string;
  date_of_birth?: string;
  color?: string;
  breed?: string;
  gender?: string;
  reproductive_status?: string;
  created_at?: string;
}

export interface AppointmentData {
  id: number;
  pet_id?: number;
  user_id?: number;
  type: string;
  date: string;
  time: string;
  veterinarian?: string;
  notes?: string;
  location?: string;
  status: string;
  created_at: string;
}

export interface DashboardResult {
  success: boolean;
  message?: string;
  data?: DashboardData;
}

export async function getDashboardData(): Promise<DashboardResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const url = `${API_BASE_URL}/dashboard`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Dashboard API error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function getPets(): Promise<{ success: boolean; message?: string; data?: PetData[] }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Pets API error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function getAppointments(): Promise<{ success: boolean; message?: string; data?: AppointmentData[] }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Appointments API error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}
