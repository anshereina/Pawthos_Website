import React, { useState } from 'react';

interface AddMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const AddMedicalRecordModal: React.FC<AddMedicalRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    reasonForVisit: '',
    dateOfVisit: '',
    nextVisit: '',
    procedureDone: '',
    findings: '',
    recommendation: '',
    vaccineUsedMedication: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      reasonForVisit: '',
      dateOfVisit: '',
      nextVisit: '',
      procedureDone: '',
      findings: '',
      recommendation: '',
      vaccineUsedMedication: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Medical Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit *
              </label>
              <input
                type="text"
                value={formData.reasonForVisit}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  reasonForVisit: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Annual checkup, Vaccination, Illness"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Visit *
              </label>
              <input
                type="date"
                value={formData.dateOfVisit}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dateOfVisit: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Visit (Optional)
              </label>
              <input
                type="date"
                value={formData.nextVisit}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  nextVisit: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procedure Done *
              </label>
              <input
                type="text"
                value={formData.procedureDone}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  procedureDone: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Physical examination, Blood test, Surgery"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Findings *
            </label>
            <textarea
              value={formData.findings}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                findings: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Describe the findings from examination or tests"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendation *
            </label>
            <textarea
              value={formData.recommendation}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                recommendation: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Provide recommendations for treatment or follow-up"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vaccine Used/Medication *
            </label>
            <input
              type="text"
              value={formData.vaccineUsedMedication}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                vaccineUsedMedication: e.target.value 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter vaccines or medications administered"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors"
            >
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalRecordModal; 