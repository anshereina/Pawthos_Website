import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { ShippingPermitRecord } from '../services/shippingPermitRecordService';

interface DeleteShippingPermitRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  record: ShippingPermitRecord | null;
  loading: boolean;
}

const DeleteShippingPermitRecordModal: React.FC<DeleteShippingPermitRecordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  loading,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Delete Shipping Permit Record</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle size={24} className="text-red-500" />
          <p className="text-gray-700">
            Are you sure you want to delete this shipping permit record?
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Record Details:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Owner:</span> {record.owner_name}</p>
            <p><span className="font-medium">Pet:</span> {record.pet_name}</p>
            <p><span className="font-medium">Permit Number:</span> {record.permit_number || 'N/A'}</p>
            <p><span className="font-medium">Status:</span> {record.status || 'Active'}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Trash2 size={16} />
            <span>{loading ? 'Deleting...' : 'Delete Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteShippingPermitRecordModal; 