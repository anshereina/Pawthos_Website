import React, { useState, useEffect } from 'react';
import { X, Download, CheckSquare, Square } from 'lucide-react';
import { PainAssessment } from '../services/painAssessmentService';
import { painAssessmentExportService } from '../services/painAssessmentExportService';

interface PainAssessmentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessments: PainAssessment[];
  filteredAssessments: PainAssessment[];
}

const PainAssessmentExportModal: React.FC<PainAssessmentExportModalProps> = ({
  isOpen,
  onClose,
  assessments,
  filteredAssessments,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update select all state when selections change
  useEffect(() => {
    if (filteredAssessments.length === 0) {
      setSelectAll(false);
      return;
    }
    const allSelected = filteredAssessments.every(assessment => selectedIds.has(assessment.id));
    setSelectAll(allSelected);
  }, [selectedIds, filteredAssessments]);

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedIds(new Set());
      setSelectAll(false);
    }
  }, [isOpen]);

  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all filtered assessments
      const newSelected = new Set(selectedIds);
      filteredAssessments.forEach(assessment => {
        newSelected.delete(assessment.id);
      });
      setSelectedIds(newSelected);
    } else {
      // Select all filtered assessments
      const newSelected = new Set(selectedIds);
      filteredAssessments.forEach(assessment => {
        newSelected.add(assessment.id);
      });
      setSelectedIds(newSelected);
    }
  };

  const handleExport = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one assessment to export.');
      return;
    }

    setLoading(true);
    try {
      const selectedAssessments = assessments.filter(assessment => selectedIds.has(assessment.id));
      painAssessmentExportService.exportToCSV(selectedAssessments);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAssessmentDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      let date: Date;
      if (dateString.includes(' ')) {
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        date = new Date(year, month - 1, day, hours, minutes, seconds || 0);
      } else {
        date = new Date(dateString);
      }
      if (isNaN(date.getTime())) return dateString;
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Export Pain Assessments</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Select All Control */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label className="flex items-center space-x-3 cursor-pointer">
              <button
                onClick={handleSelectAll}
                className="text-green-600 hover:text-green-700"
              >
                {selectAll ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              <span className="font-medium text-gray-700">
                Select All ({filteredAssessments.length} assessments)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              {selectedIds.size} of {filteredAssessments.length} selected
            </p>
          </div>

          {/* Assessment List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {filteredAssessments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No assessments available to export.
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-12"></th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Pet Name</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Pet Type</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Pain Level</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Assessment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssessments.map((assessment, index) => (
                      <tr
                        key={assessment.id}
                        className={`${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-green-50 transition-colors`}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(assessment.id)}
                            onChange={() => handleToggleSelect(assessment.id)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{assessment.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{assessment.pet_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 capitalize">{assessment.pet_type}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{assessment.pain_level}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatAssessmentDate(assessment.assessment_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Export Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {selectedIds.size} assessment{selectedIds.size !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              File will be downloaded as CSV format
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading || selectedIds.size === 0}
            className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Download size={16} />
            <span>{loading ? 'Exporting...' : 'Export Selected'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PainAssessmentExportModal;

