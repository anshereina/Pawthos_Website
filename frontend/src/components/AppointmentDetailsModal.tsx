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

  const formatDate = (dateString: string | undefined | null) => {
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
              // Appointment Details - Matching Add New Appointment Record fields
              <>
                {(() => {
                  const appointment = data as Appointment;
                  // Parse notes to extract Medicine Used, Contact Number, and Owner Birthday
                  let medicineUsed = '';
                  let contactNumber = '';
                  let ownerBirthday = '';
                  
                  if (appointment.notes) {
                    const notesParts = appointment.notes.split(' | ');
                    notesParts.forEach(part => {
                      if (part.startsWith('Medicine Used: ')) {
                        medicineUsed = part.replace('Medicine Used: ', '');
                      } else if (part.startsWith('Contact: ')) {
                        contactNumber = part.replace('Contact: ', '');
                      } else if (part.startsWith('Owner Birthday: ')) {
                        ownerBirthday = part.replace('Owner Birthday: ', '');
                      }
                    });
                  }

                  // Get owner name
                  const ownerName = appointment.owner_name || appointment.client_name || appointment.user?.name || appointment.pet?.owner_name || '-';
                  
                  // Get pet information
                  const petName = appointment.pet_name || appointment.pet?.name || '-';
                  const petSpecies = appointment.pet_species || appointment.pet?.species || '-';
                  const petBreed = appointment.pet_breed || appointment.pet?.breed || '-';
                  const petAge = appointment.pet_age || '-';
                  const petGender = appointment.pet_gender || appointment.pet?.gender || '-';
                  const petBirthday = appointment.pet?.date_of_birth || '-';
                  const reproductiveStatus = appointment.pet?.reproductive_status || '-';

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {appointment.date ? formatDate(appointment.date) : '-'}
                          </div>
                        </div>

                        {/* Owner's Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Owner's Name
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {ownerName}
                          </div>
                        </div>

                        {/* Appointment For */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Appointment For
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {appointment.type || '-'}
                          </div>
                        </div>

                        {/* Contact Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Number
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {contactNumber || appointment.user?.phone_number || '-'}
                          </div>
                        </div>

                        {/* Owner's Birthday */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Owner's Birthday
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {ownerBirthday ? formatDate(ownerBirthday) : (appointment.user?.created_at ? formatDate(appointment.user.created_at) : '-')}
                          </div>
                        </div>

                        {/* Pet's Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pet's Name
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {petName}
                          </div>
                        </div>

                        {/* Type of Species */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type of Species
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {petSpecies}
                          </div>
                        </div>

                        {/* Pet's Birthday */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pet's Birthday
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {petBirthday !== '-' ? formatDate(petBirthday.toString()) : '-'}
                          </div>
                        </div>

                        {/* Age */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {petAge}
                          </div>
                        </div>

                        {/* Breed */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Breed
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {petBreed}
                          </div>
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {petGender}
                          </div>
                        </div>

                        {/* Reproductive Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reproductive Status
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                            {reproductiveStatus !== '-' ? reproductiveStatus : '-'}
                          </div>
                        </div>
                      </div>

                      {/* Medicine Used */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medicine Used
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                          {medicineUsed || '-'}
                        </div>
                      </div>

                      {/* Status */}
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
                    </div>
                  );
                })()}
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
