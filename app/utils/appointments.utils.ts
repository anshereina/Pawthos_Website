// Appointments API utilities
import { getApiUrl } from './config';
import { getAuthToken } from './auth.utils';

const API_BASE_URL = getApiUrl();

export interface AppointmentData {
  id: number;
  pet_id?: number;
  user_id?: number;
  type: string;
  date: string;
  time: string;
  veterinarian?: string;
  notes?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  // Pet details
  pet_name?: string;
  pet_species?: string;
  pet_breed?: string;
  pet_age?: string;
  pet_gender?: string;
  pet_weight?: string;
  owner_name?: string;
}

export interface AppointmentCreate {
  pet_id?: number;
  type: string;
  date: string;
  time: string;
  veterinarian?: string;
  notes?: string;
  // Pet details
  pet_name?: string;
  pet_species?: string;
  pet_breed?: string;
  pet_age?: string;
  pet_gender?: string;
  pet_weight?: string;
  owner_name?: string;
}

export interface AppointmentResult {
  success: boolean;
  message?: string;
  data?: AppointmentData[];
}

export interface SingleAppointmentResult {
  success: boolean;
  message?: string;
  data?: AppointmentData;
}

export async function getAppointments(): Promise<AppointmentResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const url = `${API_BASE_URL}/appointments/`;
    console.log('Appointments API URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Appointments API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Appointments API error response:', errorText);
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

export async function createAppointment(appointmentData: AppointmentCreate): Promise<SingleAppointmentResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const url = `${API_BASE_URL}/appointments/`;
    console.log('Create Appointment API URL:', url);
    console.log('Create Appointment Data:', appointmentData);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
      redirect: 'follow'  // Explicitly follow redirects
    });

    console.log('Create Appointment API response status:', response.status);
    console.log('Create Appointment API response URL:', response.url);
    
    // Handle redirect responses
    if (response.status === 307 || response.status === 308) {
      console.log('Received redirect, response details:', {
        status: response.status,
        url: response.url,
        redirected: response.redirected
      });
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Create Appointment API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Create Appointment API success response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Create Appointment API error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function updateAppointment(appointmentId: number, appointmentData: AppointmentCreate): Promise<SingleAppointmentResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const url = `${API_BASE_URL}/appointments/${appointmentId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Update Appointment API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Update Appointment API error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function updateAppointmentStatus(appointmentId: number, status: string): Promise<SingleAppointmentResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const url = `${API_BASE_URL}/appointments/${appointmentId}/status`;
    console.log('Update Appointment Status API URL:', url);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    console.log('Update Appointment Status API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Update Appointment Status API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Update Appointment Status API error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

// Helper functions for filtering appointments
export function filterUpcomingAppointments(appointments: AppointmentData[]): AppointmentData[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= today && appointment.status !== 'cancelled' && appointment.status !== 'completed';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getAllAppointments(appointments: AppointmentData[]): AppointmentData[] {
  return appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function formatAppointmentDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

export function formatAppointmentTime(timeString: string): string {
  const time = new Date(`1970-01-01T${timeString}`);
  return time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}