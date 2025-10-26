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

      const response = await fetch(`${this.baseUrl}/recipients?${params.toString()}`, {
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

  async getUsers(search?: string): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${this.baseUrl}/?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 