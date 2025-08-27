import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { Pet } from './petService';
import type { User as AppUser } from './userService';

export interface Appointment {
  id: number;
  pet_id?: number;
  user_id?: number;
  type: string;
  date: string;
  time: string; // Will be formatted as "HH:MM" from backend
  veterinarian?: string;
  notes?: string;
  status?: string;
  created_at: string;
  updated_at?: string | null;
  pet?: Pet; // nested relationship from backend
  user?: AppUser; // nested relationship from backend
}

export interface AppointmentCreate {
  pet_id?: number;
  user_id?: number;
  type: string;
  date: string;
  time: string; // Format: "HH:MM"
  veterinarian?: string;
  notes?: string;
  status?: string;
}

export interface AppointmentUpdate {
  pet_id?: number;
  user_id?: number;
  type?: string;
  date?: string;
  time?: string;
  veterinarian?: string;
  notes?: string;
  status?: string;
}

export interface ServiceRequest {
  id: number;
  request_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  requested_services: string;
  request_details?: string;
  preferred_date?: string;
  preferred_time?: string;
  status: string;
  notes?: string;
  handled_by?: string;
  created_at: string;
  updated_at?: string | null;
}

export interface ServiceRequestCreate {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  requested_services: string;
  request_details?: string;
  preferred_date?: string;
  preferred_time?: string;
  status?: string;
  notes?: string;
  handled_by?: string;
}

export interface ServiceRequestUpdate {
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  requested_services?: string;
  request_details?: string;
  preferred_date?: string;
  preferred_time?: string;
  status?: string;
  notes?: string;
  handled_by?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Appointment API functions
export const appointmentService = {
  // Get all appointments
  getAppointments: async (params?: {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/appointments/`, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  },

  // Get appointment by ID
  getAppointment: async (id: number): Promise<Appointment> => {
    const response = await axios.get(`${API_BASE_URL}/appointments/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Create appointment
  createAppointment: async (appointment: AppointmentCreate): Promise<Appointment> => {
    const response = await axios.post(`${API_BASE_URL}/appointments/`, appointment, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Update appointment
  updateAppointment: async (id: number, appointment: AppointmentUpdate): Promise<Appointment> => {
    const response = await axios.put(`${API_BASE_URL}/appointments/${id}`, appointment, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Delete appointment
  deleteAppointment: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/appointments/${id}`, {
      headers: getAuthHeaders()
    });
  }
};

// Service Request API functions
export const serviceRequestService = {
  // Get all service requests
  getServiceRequests: async (params?: {
    search?: string;
    status?: string;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/appointments/requests/`, {
      headers: getAuthHeaders(),
      params
    });
    return response.data;
  },

  // Get service request by ID
  getServiceRequest: async (id: number): Promise<ServiceRequest> => {
    const response = await axios.get(`${API_BASE_URL}/appointments/requests/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Create service request
  createServiceRequest: async (request: ServiceRequestCreate): Promise<ServiceRequest> => {
    const response = await axios.post(`${API_BASE_URL}/appointments/requests/`, request, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Update service request
  updateServiceRequest: async (id: number, request: ServiceRequestUpdate): Promise<ServiceRequest> => {
    const response = await axios.put(`${API_BASE_URL}/appointments/requests/${id}`, request, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Delete service request
  deleteServiceRequest: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/appointments/requests/${id}`, {
      headers: getAuthHeaders()
    });
  }
};

