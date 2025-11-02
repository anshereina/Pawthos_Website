import React from 'react';
import { VaccinationRecordWithPet } from '../services/vaccinationRecordService';

interface ViewVaccinationRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: VaccinationRecordWithPet | null;
}

const ViewVaccinationRecordModal: React.FC<ViewVaccinationRecordModalProps> = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  // Get date values (handle both field name variants)
  const vaccinationDate = record.date_given || record.vaccination_date;
  const nextDueDate = record.next_due_date || record.expiration_date;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Vaccination Record Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{record.pet_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg capitalize">{record.pet_species || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine Name:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{record.vaccine_name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccination Date:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{formatDate(vaccinationDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Vaccination Date:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{formatDate(nextDueDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veterinarian:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{record.veterinarian || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch/Lot No.:</label>
              <p className="px-3 py-2 bg-gray-100 rounded-lg">{record.batch_lot_no || '-'}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewVaccinationRecordModal;

