import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Alert } from '../services/alertService';

interface DeleteAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (alertId: string) => Promise<any>;
  alert: Alert | null;
}

const DeleteAlertModal: React.FC<DeleteAlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  alert,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!alert) return;
    
    setLoading(true);
    try {
      await onConfirm(alert.alert_id);
      onClose();
    } catch (error) {
      console.error('Error deleting alert:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Delete Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center mb-4">
          <AlertTriangle size={24} className="text-red-500 mr-3" />
          <p className="text-gray-700">
            Are you sure you want to delete this alert? This action cannot be undone.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-gray-900 mb-2">Alert Details:</h3>
          <p className="text-sm text-gray-600">
            <strong>Title:</strong> {alert.title}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Priority:</strong> {alert.priority}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Submitted by:</strong> {alert.submitted_by}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Delete Alert'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAlertModal; 