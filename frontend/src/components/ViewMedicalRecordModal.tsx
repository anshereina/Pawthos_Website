import React from 'react';
import { X, Calendar, FileText, Pill, Stethoscope } from 'lucide-react';

interface ViewMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
}

const ViewMedicalRecordModal: React.FC<ViewMedicalRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  record 
}) => {
  if (!isOpen || !record) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-green-800" size={24} />
            Medical Record Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Pet Information */}
        {record.pet && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Pet Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Pet Name:</span>
                <span className="ml-2 text-gray-900">{record.pet.name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Species:</span>
                <span className="ml-2 text-gray-900 capitalize">{record.pet.species || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Record Details */}
        <div className="space-y-4">
          {/* Reason for Visit */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Stethoscope size={16} className="text-green-700" />
              Reason for Visit
            </label>
            <p className="text-gray-900 text-base">{record.reason_for_visit || 'N/A'}</p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-green-700" />
                Date of Visit
              </label>
              <p className="text-gray-900">{formatDate(record.date_visited)}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-green-700" />
                Next Visit
              </label>
              <p className="text-gray-900">{formatDate(record.date_of_next_visit)}</p>
            </div>
          </div>

          {/* Procedure Done */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Procedure Done</label>
            <p className="text-gray-900 whitespace-pre-wrap">{record.procedures_done || 'N/A'}</p>
          </div>

          {/* Findings */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Findings</label>
            <p className="text-gray-900 whitespace-pre-wrap">{record.findings || 'N/A'}</p>
          </div>

          {/* Recommendations */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Recommendations</label>
            <p className="text-gray-900 whitespace-pre-wrap">{record.recommendations || 'N/A'}</p>
          </div>

          {/* Vaccine Used/Medication */}
          <div className="border-b border-gray-200 pb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Pill size={16} className="text-green-700" />
              Vaccine Used/Medication
            </label>
            <p className="text-gray-900 whitespace-pre-wrap">{record.medications || 'N/A'}</p>
          </div>

          {/* Veterinarian */}
          {record.veterinarian && (
            <div className="border-b border-gray-200 pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Veterinarian</label>
              <p className="text-gray-900">{record.veterinarian}</p>
            </div>
          )}

          {/* Created/Updated Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-gray-500">
            {record.created_at && (
              <div>
                <span className="font-medium">Created:</span>{' '}
                <span>{formatDate(record.created_at)}</span>
              </div>
            )}
            {record.updated_at && (
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                <span>{formatDate(record.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
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

export default ViewMedicalRecordModal;
