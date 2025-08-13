import { API_BASE_URL } from '../config';

export interface Alert {
  id: number;
  alert_id: string;
  title: string;
  message: string;
  priority: string;
  submitted_by: string;
  submitted_by_email: string;
  recipients?: string;  // JSON string from backend
  created_at: string;
  updated_at?: string;
}

export interface CreateAlertData {
  title: string;
  message: string;
  priority?: string;
  submitted_by: string;
  submitted_by_email: string;
  recipients?: string;  // JSON string of recipient emails
}

export interface UpdateAlertData {
  title?: string;
  message?: string;
  priority?: string;
  recipients?: string;  // JSON string of recipient emails
}

class AlertService {
  private baseUrl = `${API_BASE_URL}/alerts`;

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const alerts = await response.json();
      console.log('Fetched alerts:', alerts);
      return alerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  async getAlert(alertId: string): Promise<Alert> {
    try {
      const response = await fetch(`${this.baseUrl}/${alertId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching alert:', error);
      throw error;
    }
  }

  async createAlert(data: CreateAlertData): Promise<Alert> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  async updateAlert(alertId: string, data: UpdateAlertData): Promise<Alert> {
    try {
      const response = await fetch(`${this.baseUrl}/${alertId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  }

  async deleteAlert(alertId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${alertId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  async searchAlerts(query: string): Promise<Alert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/?query=${encodeURIComponent(query)}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching alerts:', error);
      throw error;
    }
  }

  async getAlertsByPriority(priority: string): Promise<Alert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/priority/${priority}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching alerts by priority:', error);
      throw error;
    }
  }
}

export const alertService = new AlertService(); 