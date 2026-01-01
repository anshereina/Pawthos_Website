import React from 'react';
import { X } from 'lucide-react';

interface WalkInRecord {
  id: number;
  date?: string;
  client_name?: string;
  contact_no?: string;
  pet_name?: string;
  pet_birthday?: string;
  breed?: string;
  age?: string;
  gender?: string;
  service_type?: string;
  medicine_used?: string;
  handled_by?: string;
  status?: string;
}

interface WalkInDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WalkInRecord | null;
}

const WalkInDetailsModal: React.FC<WalkInDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  data 
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Walk-In Record Details
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {formatDate(data.date)}
                  </div>
                </div>

                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {data.client_name || '-'}
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact No.
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {data.contact_no || '-'}
                  </div>
                </div>

                {/* Pet Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Name
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {data.pet_name || '-'}
                  </div>
                </div>

                {/* Pet's Birthday */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet's Birthday
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {formatDate(data.pet_birthday)}
                  </div>
                </div>

                {/* Breed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breed
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {data.breed || '-'}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {data.age || '-'}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {data.gender || '-'}
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {data.service_type || '-'}
                  </div>
                </div>

                {/* Medicine Used */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicine Used
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {data.medicine_used || '-'}
                  </div>
                </div>

                {/* Handled By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Handled By
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                    {data.handled_by || 'Dr. Fe Templado'}
                  </div>
                </div>
              </div>
            </div>
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

export default WalkInDetailsModal;

