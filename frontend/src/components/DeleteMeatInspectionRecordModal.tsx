import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteMeatInspectionRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  recordId: number;
  dealerName: string;
}

const DeleteMeatInspectionRecordModal: React.FC<DeleteMeatInspectionRecordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  recordId,
  dealerName,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Delete Record</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center mb-4">
          <AlertTriangle className="text-red-500 mr-3" size={24} />
          <p className="text-gray-700">
            Are you sure you want to delete the meat inspection record for <strong>{dealerName}</strong>?
          </p>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          This action cannot be undone. The record will be permanently deleted.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMeatInspectionRecordModal; 