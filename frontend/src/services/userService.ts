import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  phone_number?: string;
  created_at: string;
  is_confirmed: number;
}

export interface Recipient {
  id: number;
  name: string;
  email: string;
  type: 'Admin' | 'User';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  photo_url?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

class UserService {
  private baseUrl = `${API_BASE_URL}/users/`;

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getRecipients(search?: string): Promise<Recipient[]> {
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${this.baseUrl}recipients?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recipients:', error);
      throw error;
    }
  }

  // Update current user's profile
  async updateProfile(userData: UpdateUserData) {
    try {
      // Explicitly filter to only include allowed fields - exclude user_id and any other extra fields
      const allowedFields = ['name', 'email', 'phone_number', 'address', 'photo_url'];
      const cleanData: any = {};
      
      allowedFields.forEach(field => {
        if (userData[field as keyof UpdateUserData] !== undefined && userData[field as keyof UpdateUserData] !== null) {
          cleanData[field] = userData[field as keyof UpdateUserData];
        }
      });
      
      // Explicitly remove user_id if it exists (shouldn't, but just in case)
      delete (cleanData as any).user_id;
      delete (cleanData as any).id;
      
      console.log('Sending clean update data:', cleanData);
      console.log('Clean data keys:', Object.keys(cleanData));
      
      // Create a fresh object to ensure no hidden properties
      const finalData = JSON.parse(JSON.stringify(cleanData));
      
      const response = await axios.put(
        `${API_BASE_URL}/users/update-profile`,
        finalData,
        {
          headers: getAuthHeaders()
        }
      );
      return response.data;
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Profile update error details:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
        requestData: userData
      });
      throw error;
    }
  }
}

export const userService = new UserService();
