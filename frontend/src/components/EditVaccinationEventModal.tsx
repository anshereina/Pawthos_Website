import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, User, FileText, CheckCircle } from 'lucide-react';

interface VaccinationEvent {
  id: number;
  event_date: string;
  barangay: string;
  service_coordinator: string;
  status: string;
  event_title: string;
}

interface EditVaccinationEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: VaccinationEvent) => void;
  event: VaccinationEvent | null;
}

const EditVaccinationEventModal: React.FC<EditVaccinationEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  event,
}) => {
  const [formData, setFormData] = useState<VaccinationEvent>({
    id: 0,
    event_date: '',
    barangay: '',
    service_coordinator: '',
    status: 'Scheduled',
    event_title: '',
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Vaccination Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title
            </label>
            <div className="relative">
              <FileText size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="event_title"
                value={formData.event_title}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Anti-Rabies Vaccination Drive"
              />
            </div>
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Date
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Barangay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subdivision/Barangay
            </label>
            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Barangay San Antonio"
              />
            </div>
          </div>

          {/* Service Coordinator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Coordinator
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="service_coordinator"
                value={formData.service_coordinator}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Dr. Maria Santos"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="relative">
              <CheckCircle size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
            >
              Update Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVaccinationEventModal; 