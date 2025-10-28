import React, { useState } from 'react';

interface AddVaccinationRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  vacCardTitle?: string;
}

const AddVaccinationRecordModal: React.FC<AddVaccinationRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  vacCardTitle
}) => {
  const [formData, setFormData] = useState({
    dateOfVaccination: '',
    vaccineUsed: '',
    batchNumber: '',
    dateOfNextVaccination: '',
    veterinarianLicenseNumber: 'Dr. Ma. Fe V. Templado PRC # 4585',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      dateOfVaccination: '',
      vaccineUsed: '',
      batchNumber: '',
      dateOfNextVaccination: '',
      veterinarianLicenseNumber: 'Dr. Ma. Fe V. Templado PRC # 4585',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New {vacCardTitle ? vacCardTitle : 'VacCard'} Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Vaccination *
              </label>
              <input
                type="date"
                value={formData.dateOfVaccination}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dateOfVaccination: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccine Used *
              </label>
              <select
                value={formData.vaccineUsed}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vaccineUsed: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select vaccine</option>
                <option value="Rabisin">Rabisin</option>
                <option value="4in1(Tricats)">4in1(Tricats)</option>
                <option value="4in1 (Parasites)">4in1 (Parasites)</option>
                <option value="5in1">5in1</option>
                <option value="8in1">8in1</option>
                <option value="DEFENSOR 3">DEFENSOR 3</option>
                <option value="NOVIBAC RABIES">NOVIBAC RABIES</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch No. / Lot No. *
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  batchNumber: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter batch or lot number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Next Vaccination
              </label>
              <input
                type="date"
                value={formData.dateOfNextVaccination}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dateOfNextVaccination: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veterinarian License No. PTR *
              </label>
              <input
                type="text"
                value={formData.veterinarianLicenseNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  veterinarianLicenseNumber: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter veterinarian license number"
                required
                readOnly
              />
            </div>
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

export default AddVaccinationRecordModal; 