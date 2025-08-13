import { API_BASE_URL } from '../config';

export interface Pet {
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
  created_at: string;
  updated_at?: string;
}

export interface CreatePetData {
  name: string;
  owner_name: string;
  species: string;
  date_of_birth?: string;
  color?: string;
  breed?: string;
  gender?: string;
  reproductive_status?: string;
}

export interface UpdatePetData {
  name?: string;
  owner_name?: string;
  species?: string;
  date_of_birth?: string;
  color?: string;
  breed?: string;
  gender?: string;
  reproductive_status?: string;
}

class PetService {
  private baseUrl = `${API_BASE_URL}/pets`;

  async getPets(species?: string, search?: string): Promise<Pet[]> {
    const params = new URLSearchParams();
    if (species && species !== 'all') {
      params.append('species', species);
    }
    if (search) {
      params.append('search', search);
    }
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${this.baseUrl}/?${params.toString()}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pets');
    }
    return response.json();
  }

  async getPet(petId: string): Promise<Pet> {
    try {
      console.log('Fetching pet with ID:', petId);
      console.log('API URL:', `${this.baseUrl}/${petId}`);
      
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.baseUrl}/${petId}`, {
        headers,
      });
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Failed to fetch pet: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Pet data received:', data);
      return data;
    } catch (error) {
      console.error('Error in getPet:', error);
      throw error;
    }
  }

  async createPet(petData: CreatePetData): Promise<Pet> {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(petData),
    });
    if (!response.ok) {
      throw new Error('Failed to create pet');
    }
    return response.json();
  }

  async updatePet(petId: string, petData: UpdatePetData): Promise<Pet> {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${this.baseUrl}/${petId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(petData),
    });
    if (!response.ok) {
      throw new Error('Failed to update pet');
    }
    return response.json();
  }

  async deletePet(petId: string): Promise<void> {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const deleteUrl = `${this.baseUrl}/${petId}`;
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      let errorMessage = 'Failed to delete pet';
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (e) {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage);
    }
  }

  calculateAge(dateOfBirth?: string): number | null {
    if (!dateOfBirth) return null;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

export const petService = new PetService(); 