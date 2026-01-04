import React, { useState } from 'react';
import { X, Syringe, Calendar } from 'lucide-react';

interface OtherServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serviceData: OtherServiceData) => void;
}

interface OtherServiceData {
  vaccineUsed: string;
  dateExpiration: string;
}

const OtherServiceModal: React.FC<OtherServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<OtherServiceData>({
    vaccineUsed: '',
    dateExpiration: '',
  });
  const [errors, setErrors] = useState<Partial<OtherServiceData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vaccineOptions = [
    '4in1 Dog (All parasites)',
    '4in1 Cat (All parasites)',
    '4in1 Tricats (FVRCCP)',
    '5in1 Dog (Anti-Parvo)',
    '6in1 Dog (Anti Parvo + Corona Virus)',
    '8in1 Dog (All Viruses)',
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<OtherServiceData> = {};

    if (!formData.vaccineUsed.trim()) {
      newErrors.vaccineUsed = 'Vaccine Used is required';
    }

    if (!formData.dateExpiration.trim()) {
      newErrors.dateExpiration = 'Date Expiration of Vaccine is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to submit other service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vaccineUsed: '',
      dateExpiration: '',
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (field: keyof OtherServiceData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-height-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Other Service
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Vaccine Used Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Syringe size={16} className="inline mr-2" />
              Vaccine Used *
            </label>
            <select
              value={formData.vaccineUsed}
              onChange={(e) => handleInputChange('vaccineUsed', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white ${
                errors.vaccineUsed ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select Vaccine</option>
              {vaccineOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {errors.vaccineUsed && (
              <p className="mt-1 text-sm text-red-600">{errors.vaccineUsed}</p>
            )}
          </div>

          {/* Date Expiration of Vaccine Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Date Expiration of Vaccine *
            </label>
            <input
              type="date"
              value={formData.dateExpiration}
              onChange={(e) => handleInputChange('dateExpiration', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.dateExpiration ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.dateExpiration && (
              <p className="mt-1 text-sm text-red-600">{errors.dateExpiration}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtherServiceModal;
