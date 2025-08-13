import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MeatInspectionRecordCreate } from '../services/meatInspectionRecordService';

interface AddMeatInspectionRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: MeatInspectionRecordCreate) => Promise<void>;
}

const AddMeatInspectionRecordModal: React.FC<AddMeatInspectionRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<MeatInspectionRecordCreate>({
    date_of_inspection: new Date().toISOString().split('T')[0],
    time: '',
    dealer_name: '',
    kilos: 0,
    date_of_slaughter: new Date().toISOString().split('T')[0],
    certificate_issued: false,
    status: 'Pending',
    remarks: '',
    inspector_name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        date_of_inspection: new Date().toISOString().split('T')[0],
        time: '',
        dealer_name: '',
        kilos: 0,
        date_of_slaughter: new Date().toISOString().split('T')[0],
        certificate_issued: false,
        status: 'Pending',
        remarks: '',
        inspector_name: '',
      });
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Meat Inspection Record</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Inspection *
            </label>
            <input
              type="date"
              name="date_of_inspection"
              value={formData.date_of_inspection}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time *
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of Dealer *
            </label>
            <input
              type="text"
              name="dealer_name"
              value={formData.dealer_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilos *
            </label>
            <input
              type="number"
              name="kilos"
              value={formData.kilos}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Slaughter *
            </label>
            <input
              type="date"
              name="date_of_slaughter"
              value={formData.date_of_slaughter}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="certificate_issued"
              checked={formData.certificate_issued}
              onChange={handleChange}
              className="text-green-600 focus:ring-green-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Certificate Issued
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspector Name
            </label>
            <input
              type="text"
              name="inspector_name"
              value={formData.inspector_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMeatInspectionRecordModal; 