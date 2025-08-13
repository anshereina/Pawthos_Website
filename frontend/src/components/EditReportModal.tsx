import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Report, UpdateReportData } from '../services/reportService';

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportId: string, data: UpdateReportData) => Promise<any>;
  report: Report | null;
}

const EditReportModal: React.FC<EditReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  report,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'New',
  });
  const [loading, setLoading] = useState(false);

  // Initialize form data when report changes
  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title,
        description: report.description,
        status: report.status,
      });
    }
  }, [report]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !formData.title.trim() || !formData.description.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(report.report_id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter report title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter report description"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReportModal; 