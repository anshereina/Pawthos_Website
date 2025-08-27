import React, { useState, useEffect } from 'react';
import { Pet } from '../services/petService';

interface AddVaccinationRecordFromListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  pets: Pet[];
}

const AddVaccinationRecordFromListModal: React.FC<AddVaccinationRecordFromListModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  pets
}) => {
  const [formData, setFormData] = useState({
    petId: '',
    vaccineName: '',
    vaccinationDate: '',
    expirationDate: '', // This will store the Next Vaccination Date
    veterinarian: 'Dr. Ma. Fe V. Templado PRC # 4585',
    batchLotNo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPetInfo, setSelectedPetInfo] = useState<Pet | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(formData);
      // Show success message
      setIsSuccess(true);
      // Reset form on success
      setFormData({
        petId: '',
        vaccineName: '',
        vaccinationDate: '',
        expirationDate: '', // This will store the Next Vaccination Date
        veterinarian: 'Dr. Ma. Fe V. Templado PRC # 4585',
        batchLotNo: '',
      });
      setSelectedPetInfo(null);
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vaccination record');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Vaccination Record</h2>
        
        {/* Success Message */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">Vaccination record saved successfully!</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Pet *
              </label>
              <select
                value={formData.petId}
                onChange={(e) => {
                  const selectedPet = pets.find(pet => pet.id.toString() === e.target.value);
                  setSelectedPetInfo(selectedPet || null);
                  setFormData(prev => ({ 
                    ...prev, 
                    petId: e.target.value 
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select a pet</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species}) - Owner: {pet.owner_name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selected Pet Information */}
            {selectedPetInfo && (
              <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Pet Information:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <span className="font-medium">Pet Name:</span> {selectedPetInfo.name}
                    </div>
                    <div>
                      <span className="font-medium">Species:</span> {selectedPetInfo.species}
                    </div>
                    <div>
                      <span className="font-medium">Owner:</span> {selectedPetInfo.owner_name}
                    </div>
                    <div>
                      <span className="font-medium">Breed:</span> {selectedPetInfo.breed || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isSubmitting 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-green-800 text-white hover:bg-green-900'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </div>
              ) : (
                'Add Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVaccinationRecordFromListModal;
