import { config } from '../config';

export interface PainAssessment {
  id: number;
  pet_id: number;
  user_id: number;
  pet_name: string;
  pet_type: string;
  pain_level: string;
  assessment_date: string;
  recommendations?: string;
  image_url?: string;
  created_at?: string;
  basic_answers?: string;
  assessment_answers?: string;
  questions_completed?: boolean;
}

export interface PainAssessmentCreate {
  pet_id: number;
  user_id: number;
  pet_name: string;
  pet_type: string;
  pain_level: string;
  assessment_date: string;
  recommendations?: string;
  image_url?: string;
  basic_answers?: string;
  assessment_answers?: string;
  questions_completed?: boolean;
}

export interface PainAssessmentUpdate {
  pet_id?: number;
  user_id?: number;
  pet_name?: string;
  pet_type?: string;
  pain_level?: string;
  assessment_date?: string;
  recommendations?: string;
  image_url?: string;
  basic_answers?: string;
  assessment_answers?: string;
  questions_completed?: boolean;
}

class PainAssessmentService {
  private baseUrl = `${config.apiUrl}/pain-assessments`;

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAllPainAssessments(): Promise<PainAssessment[]> {
    try {
      const token = localStorage.getItem('access_token');
      console.log('🔍 getAllPainAssessments - Token exists:', !!token);
      console.log('🔍 getAllPainAssessments - Base URL:', this.baseUrl);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const headers = this.getAuthHeaders();
      const headersObj = headers as Record<string, string>;
      console.log('🔍 getAllPainAssessments - Headers:', {
        'Content-Type': headersObj['Content-Type'] || 'Missing',
        'Authorization': headersObj['Authorization'] ? 'Bearer ***' : 'Missing'
      });

      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers,
      });

      console.log('🔍 getAllPainAssessments - Response status:', response.status);
      console.log('🔍 getAllPainAssessments - Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ getAllPainAssessments - Error response:', errorText);
        
        if (response.status === 401) {
          console.error('❌ 401 Unauthorized - Token may be invalid or expired');
          console.error('❌ Token (first 20 chars):', token.substring(0, 20) + '...');
          // Clear invalid token and redirect to login
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          throw new Error('Authentication failed. Please log in again.');
        }
        
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ getAllPainAssessments - Success, got', data.length, 'assessments');
      return data;
    } catch (error) {
      console.error('❌ Error fetching pain assessments:', error);
      throw error;
    }
  }

  async getPainAssessment(id: number): Promise<PainAssessment> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pain assessment:', error);
      throw error;
    }
  }

  async createPainAssessment(assessment: PainAssessmentCreate): Promise<PainAssessment> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(assessment),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating pain assessment:', error);
      throw error;
    }
  }

  async updatePainAssessment(id: number, assessment: PainAssessmentUpdate): Promise<PainAssessment> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(assessment),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating pain assessment:', error);
      throw error;
    }
  }

  async deletePainAssessment(id: number): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting pain assessment:', error);
      throw error;
    }
  }
}

export const painAssessmentService = new PainAssessmentService();











































