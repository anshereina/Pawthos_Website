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
    const response = await axios.put(
      `${API_BASE_URL}/users/update-profile`,
      userData,
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  }
}

export const userService = new UserService();
