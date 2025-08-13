import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface VaccinationEvent {
  id: number;
  event_date: string;
  barangay: string;
  service_coordinator: string;
  status: string;
  event_title: string;
}

interface DeleteVaccinationEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: VaccinationEvent | null;
}

const DeleteVaccinationEventModal: React.FC<DeleteVaccinationEventModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  event,
}) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Delete Vaccination Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-600" />
            </div>
          </div>

          {/* Warning Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Are you sure you want to delete this event?
            </h3>
            <p className="text-gray-600">
              This action cannot be undone. The following event will be permanently deleted:
            </p>
          </div>

          {/* Event Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Event Title:</span>
                <span className="ml-2 text-gray-900">{event.event_title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <span className="ml-2 text-gray-900">{event.event_date}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Barangay:</span>
                <span className="ml-2 text-gray-900">{event.barangay}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-gray-900">{event.status}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 size={18} />
              <span>Delete Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteVaccinationEventModal; 