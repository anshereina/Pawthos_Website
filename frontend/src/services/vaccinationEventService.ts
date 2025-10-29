import { config } from '../config';

export interface VaccinationEvent {
  id: number;
  event_date: string;
  barangay: string;
  service_coordinator: string;
  status: string;
  event_title: string;
  created_at: string;
  updated_at?: string;
}

export interface VaccinationEventCreate {
  event_date: string;
  barangay: string;
  service_coordinator: string;
  status: string;
  event_title: string;
}

export interface VaccinationEventUpdate {
  event_date?: string;
  barangay?: string;
  service_coordinator?: string;
  status?: string;
  event_title?: string;
}

class VaccinationEventService {
  private baseUrl = `${config.apiUrl}/vaccination-events/`;

  async getAllVaccinationEvents(): Promise<VaccinationEvent[]> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vaccination events');
    }

    return response.json();
  }

  async getUpcomingVaccinationEvents(): Promise<VaccinationEvent[]> {
    const response = await fetch(`${this.baseUrl}/upcoming`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch upcoming vaccination events');
    }

    return response.json();
  }

  async getVaccinationEventsByDate(date: string): Promise<VaccinationEvent[]> {
    const url = new URL(`${this.baseUrl}/by-date`);
    url.searchParams.append('date', date);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vaccination events by date');
    }

    return response.json();
  }

  async getVaccinationEvent(id: number): Promise<VaccinationEvent> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vaccination event');
    }

    return response.json();
  }

  async createVaccinationEvent(event: VaccinationEventCreate): Promise<VaccinationEvent> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error('Failed to create vaccination event');
    }

    return response.json();
  }

  async updateVaccinationEvent(id: number, event: VaccinationEventUpdate): Promise<VaccinationEvent> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error('Failed to update vaccination event');
    }

    return response.json();
  }

  async deleteVaccinationEvent(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete vaccination event');
    }
  }
}

export const vaccinationEventService = new VaccinationEventService(); 