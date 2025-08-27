import React, { useState, useEffect } from 'react';
import { VaccinationRecordWithPet } from '../services/vaccinationRecordService';

interface EditVaccinationRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  record: VaccinationRecordWithPet;
}

const EditVaccinationRecordModal: React.FC<EditVaccinationRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  record
}) => {
  const [formData, setFormData] = useState({
    vaccineName: '',
    vaccinationDate: '',
    expirationDate: '', // This will store the Next Vaccination Date
    veterinarian: '',
    batchLotNo: '',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        vaccineName: record.vaccine_name || '',
        vaccinationDate: record.vaccination_date || '',
        expirationDate: record.expiration_date || '', // Map expiration_date to Next Vaccination Date
        veterinarian: record.veterinarian || '',
        batchLotNo: record.batch_lot_no || '',
      });
    }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Vaccination Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Name
              </label>
              <input
                type="text"
                value={record.pet_name || 'Unknown'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccine Name *
              </label>
              <select
                value={formData.vaccineName}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vaccineName: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select vaccine</option>
                <option value="Rabisin">Rabisin</option>
                <option value="4in1(Tricats)">4in1(Tricats)</option>
                <option value="4in1 (Parasites)">4in1 (Parasites)</option>
                <option value="5in1 (Anti-Parvo)">5in1 (Anti-Parvo)</option>
                <option value="8in1 (All Viruses)">8in1 (All Viruses)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccination Date *
              </label>
              <input
                type="date"
                value={formData.vaccinationDate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vaccinationDate: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Vaccination Date
              </label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  expirationDate: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veterinarian *
              </label>
              <input
                type="text"
                value={formData.veterinarian}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  veterinarian: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter veterinarian name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch/Lot No. *
              </label>
              <input
                type="text"
                value={formData.batchLotNo}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  batchLotNo: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter batch or lot number"
                required
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
              Update Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVaccinationRecordModal; 