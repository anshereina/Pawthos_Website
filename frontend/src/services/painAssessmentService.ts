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

  async getAllPainAssessments(): Promise<PainAssessment[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pain assessments:', error);
      throw error;
    }
  }

  async getPainAssessment(id: number): Promise<PainAssessment> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pain assessment:', error);
      throw error;
    }
  }

  async createPainAssessment(assessment: PainAssessmentCreate): Promise<PainAssessment> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessment),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating pain assessment:', error);
      throw error;
    }
  }

  async updatePainAssessment(id: number, assessment: PainAssessmentUpdate): Promise<PainAssessment> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessment),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating pain assessment:', error);
      throw error;
    }
  }

  async deletePainAssessment(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting pain assessment:', error);
      throw error;
    }
  }
}

export const painAssessmentService = new PainAssessmentService();







































