import { useState, useEffect, useCallback } from 'react';
import { 
  appointmentService, 
  serviceRequestService, 
  Appointment, 
  ServiceRequest,
  AppointmentCreate,
  AppointmentUpdate,
  ServiceRequestCreate,
  ServiceRequestUpdate
} from '../services/appointmentService';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (params?: {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAppointments(params);
      setAppointments(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = async (appointment: AppointmentCreate) => {
    try {
      const newAppointment = await appointmentService.createAppointment(appointment);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create appointment');
    }
  };

  const updateAppointment = async (id: number, appointment: AppointmentUpdate) => {
    try {
      const updatedAppointment = await appointmentService.updateAppointment(id, appointment);
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? updatedAppointment : apt)
      );
      return updatedAppointment;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update appointment');
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments(prev => prev.filter(apt => apt.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete appointment');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};

export const useServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceRequests = useCallback(async (params?: {
    search?: string;
    status?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceRequestService.getServiceRequests(params);
      setServiceRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const createServiceRequest = async (request: ServiceRequestCreate) => {
    try {
      const newRequest = await serviceRequestService.createServiceRequest(request);
      setServiceRequests(prev => [newRequest, ...prev]);
      return newRequest;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create service request');
    }
  };

  const updateServiceRequest = async (id: number, request: ServiceRequestUpdate) => {
    try {
      const updatedRequest = await serviceRequestService.updateServiceRequest(id, request);
      setServiceRequests(prev => 
        prev.map(req => req.id === id ? updatedRequest : req)
      );
      return updatedRequest;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update service request');
    }
  };

  const deleteServiceRequest = async (id: number) => {
    try {
      await serviceRequestService.deleteServiceRequest(id);
      setServiceRequests(prev => prev.filter(req => req.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete service request');
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, [fetchServiceRequests]);

  return {
    serviceRequests,
    loading,
    error,
    fetchServiceRequests,
    createServiceRequest,
    updateServiceRequest,
    deleteServiceRequest
  };
};

