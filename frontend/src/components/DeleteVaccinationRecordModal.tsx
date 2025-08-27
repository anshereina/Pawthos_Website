import React from 'react';
import { VaccinationRecordWithPet } from '../services/vaccinationRecordService';

interface DeleteVaccinationRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  record: VaccinationRecordWithPet;
}

const DeleteVaccinationRecordModal: React.FC<DeleteVaccinationRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  record
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Delete Vaccination Record</h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this vaccination record? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Record Details:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Pet:</span> {record.pet_name || 'Unknown'}</p>
              <p><span className="font-medium">Vaccine:</span> {record.vaccine_name}</p>
              <p><span className="font-medium">Date:</span> {record.vaccination_date}</p>
              <p><span className="font-medium">Veterinarian:</span> {record.veterinarian}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteVaccinationRecordModal; 