import { useState, useCallback } from 'react';
import { vaccinationEventService, VaccinationEvent, VaccinationEventCreate, VaccinationEventUpdate } from '../services/vaccinationEventService';

export const useVaccinationEvents = () => {
  const [events, setEvents] = useState<VaccinationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vaccinationEventService.getAllVaccinationEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUpcomingEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vaccinationEventService.getUpcomingVaccinationEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming events');
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData: VaccinationEventCreate) => {
    setLoading(true);
    setError(null);
    try {
      const newEvent = await vaccinationEventService.createVaccinationEvent(eventData);
      setEvents(prev => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (id: number, eventData: VaccinationEventUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const updatedEvent = await vaccinationEventService.updateVaccinationEvent(id, eventData);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      return updatedEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await vaccinationEventService.deleteVaccinationEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    error,
    fetchAllEvents,
    fetchUpcomingEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}; 