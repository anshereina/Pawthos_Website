import React from 'react';
import { X } from 'lucide-react';
import { ShippingPermitRecord } from '../services/shippingPermitRecordService';

interface ViewShippingPermitRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ShippingPermitRecord | null;
}

const ViewShippingPermitRecordModal: React.FC<ViewShippingPermitRecordModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!isOpen || !record) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shipping Permit Record Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Permit Information Section */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Permit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permit Number</label>
                <p className="text-gray-900 font-mono">{record.permit_number || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status || 'Active')}`}>
                  {record.status || 'Active'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <p className="text-gray-900">{formatDate(record.issue_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <p className="text-gray-900">{formatDate(record.expiry_date)}</p>
              </div>
            </div>
          </div>

          {/* Owner Information Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Owner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <p className="text-gray-900">{record.owner_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <p className="text-gray-900">{record.contact_number || '-'}</p>
              </div>
            </div>
          </div>

          {/* Pet Information Section */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Pet Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
                <p className="text-gray-900">{record.pet_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birthdate</label>
                <p className="text-gray-900">{formatDate(record.birthdate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Age</label>
                <p className="text-gray-900">{record.pet_age} years</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                <p className="text-gray-900 capitalize">{record.pet_species || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <p className="text-gray-900">{record.pet_breed || '-'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Information Section */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <p className="text-gray-900">{record.destination || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <p className="text-gray-900">{record.purpose || '-'}</p>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          {record.remarks && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Remarks</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{record.remarks}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {formatDate(record.created_at)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(record.updated_at)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewShippingPermitRecordModal;

