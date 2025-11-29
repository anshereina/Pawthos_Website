// Alerts API utilities
import { getApiUrl } from './config';
import { getAuthToken } from './auth.utils';

const API_BASE_URL = getApiUrl();

export interface Alert {
  id: number;
  title: string;
  message: string;
  priority?: string;
  created_at: string;
  read?: boolean;
}

export async function getUserAlerts(email: string): Promise<Alert[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.warn('No auth token available for fetching alerts');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/alerts/user/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch alerts:', response.status);
      return [];
    }

    const data = await response.json();
    // Handle both array and object responses
    if (Array.isArray(data)) {
      return data;
    } else if (data.alerts) {
      return data.alerts;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}






