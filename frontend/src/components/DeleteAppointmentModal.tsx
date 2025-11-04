import React from 'react';

interface DeleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointment: any;
}

const DeleteAppointmentModal: React.FC<DeleteAppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  appointment 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Appointment</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete the appointment for "{appointment?.type}" on {appointment?.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAppointmentModal;




































