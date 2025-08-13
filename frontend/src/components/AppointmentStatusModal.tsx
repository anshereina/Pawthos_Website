import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

interface AppointmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rescheduled' | 'Rejected';
  appointmentId: number;
  onStatusUpdate: (appointmentId: number, status: string, remarks: string, newDateTime?: string) => Promise<void>;
  loading?: boolean;
}

const AppointmentStatusModal: React.FC<AppointmentStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  appointmentId,
  onStatusUpdate,
  loading = false
}) => {
  const [remarks, setRemarks] = useState('');
  const [newDateTime, setNewDateTime] = useState('');

  // Default messages for each status
  const getDefaultMessage = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Thank you for your request. It is currently under review by our team. We will update you as soon as a decision has been made. Please check your dashboard regularly for notifications.';
      case 'Approved':
        return 'Your request has been approved and is now confirmed in our system. Kindly prepare for the scheduled appointment. If you need to make any changes, feel free to reach out ahead of time. We look forward to assisting you.';
      case 'Completed':
        return 'Your appointment has been successfully completed. We hope the service met your expectations. If you have any follow-up questions or concerns, don\'t hesitate to contact us.';
      case 'Rescheduled':
        return 'We have rescheduled your appointment due to a conflict in availability. Please review the new date and time and let us know if it works for you. We apologize for any inconvenience this may cause. Your understanding is greatly appreciated.';
      case 'Rejected':
        return 'We regret to inform you that your request has been rejected. This may be due to incomplete information. Please review your request and consider submitting it again with the necessary details. Feel free to contact us if you need further clarification.';
      default:
        return '';
    }
  };

  // Get modal title based on status
  const getModalTitle = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Add Remarks for Pending Status';
      case 'Approved':
        return 'Add Remarks for Approved Status';
      case 'Completed':
        return 'Add Remarks for Completed Appointment';
      case 'Rescheduled':
        return 'Add Remarks for Rescheduled Appointment';
      case 'Rejected':
        return 'Add Remarks for Rejected Request';
      default:
        return 'Add Remarks';
    }
  };

  // Initialize remarks with default message when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRemarks(getDefaultMessage(status));
      setNewDateTime('');
    }
  }, [isOpen, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === 'Rescheduled' && !newDateTime) {
      alert('Please enter the new date and time for rescheduling.');
      return;
    }

    try {
      await onStatusUpdate(appointmentId, status, remarks, newDateTime);
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleCancel = () => {
    setRemarks(getDefaultMessage(status));
    setNewDateTime('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-green-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-green-700">
          <div>
            <h2 className="text-xl font-bold text-white">{getModalTitle(status)}</h2>
            <p className="text-green-200 text-sm mt-1">All fields are required</p>
          </div>
          <button
            onClick={handleCancel}
            className="text-green-200 hover:text-white"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <input
                type="text"
                value={status}
                disabled
                className="w-full px-3 py-2 bg-green-700 border border-green-600 rounded-lg text-white cursor-not-allowed"
              />
            </div>

            {/* New Time & Date Field (only for Rescheduled) */}
            {status === 'Rescheduled' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  New Time & Date
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-green-700 border border-green-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-300" size={20} />
                </div>
              </div>
            )}

            {/* Message/Remarks Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Message/Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 bg-green-700 border border-green-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Enter your remarks..."
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-green-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-green-200 border border-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-white text-green-800 rounded-lg hover:bg-green-100 disabled:opacity-50 font-medium"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentStatusModal;



