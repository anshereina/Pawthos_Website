import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Pet } from '../services/petService';

interface DeletePetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  pet: Pet | null;
  loading: boolean;
}

const DeletePetModal: React.FC<DeletePetModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  pet, 
  loading 
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  if (!isOpen || !pet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Delete Pet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start mb-6">
            <div className="flex-shrink-0">
              <AlertTriangle className="text-red-500 mt-1" size={24} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Are you sure you want to delete this pet?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone. All pet records and associated data will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Pet Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Pet Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Pet ID:</span>
                <span className="ml-2 font-medium">{pet.pet_id}</span>
              </div>
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{pet.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Owner:</span>
                <span className="ml-2 font-medium">{pet.owner_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Species:</span>
                <span className="ml-2 font-medium capitalize">{pet.species}</span>
              </div>
              {pet.breed && (
                <div>
                  <span className="text-gray-500">Breed:</span>
                  <span className="ml-2 font-medium">{pet.breed}</span>
                </div>
              )}
              {pet.gender && (
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <span className="ml-2 font-medium capitalize">{pet.gender}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              <Trash2 size={16} className="mr-2" />
              {loading ? 'Deleting...' : 'Delete Pet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePetModal; 