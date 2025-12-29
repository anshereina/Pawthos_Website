import { API_BASE_URL } from '../config';

export interface Report {
  id: number;
  report_id: string;
  title: string;
  description: string;
  status: string;
  submitted_by: string;
  submitted_by_email: string;
  image_url?: string;
  recipient?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateReportData {
  title: string;
  description: string;
  status?: string;
  submitted_by: string;
  submitted_by_email: string;
  image_url?: string;
  recipient?: string;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  status?: string;
  image_url?: string;
  recipient?: string;
}

class ReportService {
  private baseUrl = `${API_BASE_URL}/reports/`;

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getReports(): Promise<Report[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  async getReport(reportId: string): Promise<Report> {
    try {
      const response = await fetch(`${this.baseUrl}${reportId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  async createReport(data: CreateReportData): Promise<Report> {
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
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async updateReport(reportId: string, data: UpdateReportData): Promise<Report> {
    try {
      const response = await fetch(`${this.baseUrl}${reportId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${reportId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  async searchReports(query: string): Promise<Report[]> {
    try {
      const response = await fetch(`${this.baseUrl}search/?query=${encodeURIComponent(query)}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching reports:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}upload-image`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService(); 