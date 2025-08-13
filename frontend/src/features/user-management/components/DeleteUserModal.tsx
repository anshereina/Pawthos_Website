import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Shield } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userType: 'admin' | 'user';
  userId: number | null;
  userName: string;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userType,
  userId,
  userName
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const token = localStorage.getItem('access_token');

  const handleDelete = async () => {
    if (!userId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const endpoint = userType === 'admin' 
        ? `${API_BASE_URL}/users/admins/${userId}`
        : `${API_BASE_URL}/users/${userId}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          (typeof err.response?.data === 'string' ? err.response.data : 'Failed to delete user');
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitError(null);
    setConfirmationText('');
    setShowConfirmation(false);
    onClose();
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(true);
  };

  const handleFinalDelete = () => {
    if (confirmationText.toLowerCase() === 'delete') {
      handleDelete();
    }
  };

  const isConfirmationValid = confirmationText.toLowerCase() === 'delete';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Delete {userType === 'admin' ? 'Admin' : 'User'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
              {submitError}
            </div>
          )}

          {!showConfirmation ? (
            // First confirmation screen
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Are you sure you want to delete this {userType}?
                </h3>
                <p className="text-gray-600 mb-4">
                  This action cannot be undone. The {userType} <strong>"{userName}"</strong> will be permanently removed from the system.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This will also delete all associated data and records for this {userType}.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Final confirmation screen
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Shield size={20} className="text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Final Confirmation Required
                </h3>
                <p className="text-gray-600 mb-4">
                  To confirm deletion of <strong>"{userName}"</strong>, please type <strong>"delete"</strong> in the field below.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Type 'delete' to confirm"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      confirmationText && !isConfirmationValid 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                  />
                  {confirmationText && !isConfirmationValid && (
                    <p className="text-sm text-red-600">
                      Please type "delete" exactly to confirm deletion
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {!showConfirmation ? (
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Delete {userType === 'admin' ? 'Admin' : 'User'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalDelete}
              disabled={isSubmitting || !isConfirmationValid}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Shield size={16} />
                  <span>Confirm Deletion</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal; 