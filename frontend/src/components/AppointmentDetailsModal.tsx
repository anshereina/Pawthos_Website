import React from 'react';
import { X } from 'lucide-react';
import { Appointment, ServiceRequest } from '../services/appointmentService';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Appointment | ServiceRequest | null;
  type: 'appointment' | 'request';
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  data, 
  type 
}) => {
  if (!isOpen || !data) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return '-';
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rescheduled':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {type === 'appointment' ? 'Appointment Details' : 'Service Request Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {type === 'appointment' ? (
              // Appointment Details
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appointment ID
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {data.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status || '')}`}>
                        {data.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {(data as Appointment).type || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {formatDate((data as Appointment).date)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {formatTime((data as Appointment).time)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Veterinarian
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {(data as Appointment).veterinarian || '-'}
                    </div>
                  </div>

                  

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created At
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {formatDate(data.created_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Information
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {(data as Appointment).pet ? (
                      <div className="space-y-1">
                        <div><strong>Name:</strong> {(data as Appointment).pet?.name}</div>
                        <div><strong>Owner:</strong> {(data as Appointment).pet?.owner_name}</div>
                        <div><strong>Species:</strong> {(data as Appointment).pet?.species}</div>
                        <div><strong>Breed:</strong> {(data as Appointment).pet?.breed || '-'}</div>
                      </div>
                    ) : (
                      'No pet information available'
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 min-h-[60px]">
                    {(data as Appointment).notes || 'No notes available'}
                  </div>
                </div>
              </>
            ) : (
              // Service Request Details
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Request ID
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {(data as ServiceRequest).request_id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status || '')}`}>
                        {data.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {(data as ServiceRequest).client_name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Email
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {(data as ServiceRequest).client_email || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Phone
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {(data as ServiceRequest).client_phone || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                                         <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                       {formatDate((data as ServiceRequest).preferred_date)}
                     </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {(data as ServiceRequest).preferred_time || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Handled By
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {(data as ServiceRequest).handled_by || '-'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created At
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {formatDate(data.created_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requested Services
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {(data as ServiceRequest).requested_services}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Details
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 min-h-[60px]">
                    {(data as ServiceRequest).request_details || 'No details available'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 min-h-[60px]">
                    {(data as ServiceRequest).notes || 'No notes available'}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
