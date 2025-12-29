import { getApiUrl } from './config';

export interface VaccinationEvent {
  id: number;
  event_title: string;
  barangay: string;
  event_date: string;
  status: string;
  // description?: string;  // Removed - doesn't exist in your table
  // created_at?: string;   // Removed - doesn't exist in your table
  // updated_at?: string;   // Removed - doesn't exist in your table
}

export interface VaccinationEventsResult {
  success: boolean;
  data?: VaccinationEvent[];
  message?: string;
}

export async function getScheduledVaccinationEvents(): Promise<VaccinationEventsResult> {
  try {
    const response = await fetch(`${getApiUrl()}/vaccination-events/scheduled`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errJson = JSON.parse(errorText);
        return { success: false, message: errJson.detail || 'Failed to fetch vaccination events' };
      } catch (_) {
        return { success: false, message: errorText || 'Failed to fetch vaccination events' };
      }
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Get vaccination events error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}
