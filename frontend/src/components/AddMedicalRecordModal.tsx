import React, { useState, useRef } from 'react';
import { Upload, X, File } from 'lucide-react';

interface AddMedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
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
    supportingDocuments: [] as File[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        reasonForVisit: '',
        dateOfVisit: '',
        nextVisit: '',
        procedureDone: '',
        findings: '',
        recommendation: '',
        vaccineUsedMedication: '',
        supportingDocuments: [],
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add medical record');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Medical Record</h2>
        {error && (
          <div className="mb-3 p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
        )}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supporting Documents (optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData(prev => ({
                    ...prev,
                    supportingDocuments: [...prev.supportingDocuments, ...files]
                  }));
                }}
                className="hidden"
                id="supporting-documents-input"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="supporting-documents-input"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500">
                  PDF, DOC, DOCX, Images (optional)
                </span>
              </label>
            </div>
            {formData.supportingDocuments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.supportingDocuments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File size={16} className="text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index)
                        }));
                      }}
                      className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
                      title="Remove file"
                    >
                      <X size={16} className="text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition-colors ${submitting ? 'bg-green-400' : 'bg-green-800 hover:bg-green-900'}`}
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalRecordModal; 