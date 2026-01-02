import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import OwnerDropdown from './OwnerDropdown';
import PetDropdown from './PetDropdown';
import { OwnerSearchResult } from '../services/shippingPermitRecordService';
import { Pet } from '../services/petService';
import { usePets } from '../hooks/usePets';

interface EditWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
  initialData?: any;
}

const EditWalkInModal: React.FC<EditWalkInModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData 
}) => {
  const { pets, fetchPets } = usePets();
  const [formData, setFormData] = useState({
    date: '',
    clientName: '',
    contactNo: '',
    barangay: '',
    petName: '',
    petBirthday: '',
    breed: '',
    age: '',
    gender: '',
    serviceType: '',
    medicineUsed: '',
  });
  const [selectedOwnerData, setSelectedOwnerData] = useState<OwnerSearchResult | null>(null);
  const [selectedPetData, setSelectedPetData] = useState<Pet | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPets();
    }
  }, [isOpen, fetchPets]);

  // Populate form with initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        date: initialData.date || '',
        clientName: initialData.client_name || '',
        contactNo: initialData.contact_no || '',
        barangay: initialData.barangay || '',
        petName: initialData.pet_name || '',
        petBirthday: initialData.pet_birthday || '',
        breed: initialData.breed || '',
        age: initialData.age || '',
        gender: initialData.gender || '',
        serviceType: initialData.service_type || '',
        medicineUsed: initialData.medicine_used || '',
      });
    }
  }, [isOpen, initialData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        date: '',
        clientName: '',
        contactNo: '',
        barangay: '',
        petName: '',
        petBirthday: '',
        breed: '',
        age: '',
        gender: '',
        serviceType: '',
        medicineUsed: '',
      });
      setSelectedOwnerData(null);
      setSelectedPetData(null);
      setError(null);
    }
  }, [isOpen]);

  // Auto-fill owner data when owner is selected
  const handleOwnerChange = (ownerName: string, ownerData?: OwnerSearchResult) => {
    setFormData(prev => ({
      ...prev,
      clientName: ownerName,
      contactNo: ownerData?.contact_number || prev.contactNo,
    }));
    setSelectedOwnerData(ownerData || null);
    
    // Clear pet selection if owner changes
    if (!ownerData || (selectedOwnerData && ownerData.owner_name !== selectedOwnerData.owner_name)) {
      setFormData(prev => ({
        ...prev,
        petName: '',
        petBirthday: '',
        breed: '',
        age: '',
        gender: '',
      }));
      setSelectedPetData(null);
    }
  };

  // Calculate age from date of birth based on the reference date (walk-in date)
  const calculateAge = (dateOfBirth: string, referenceDate?: string): string => {
    if (!dateOfBirth) return '';
    
    try {
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) return '';
      
      // Use the walk-in date as reference, or today if not specified
      const refDate = referenceDate ? new Date(referenceDate) : new Date();
      const ageInMs = refDate.getTime() - birthDate.getTime();
      
      // Return empty if birth date is after reference date
      if (ageInMs < 0) return '';
      
      const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
      
      if (ageInYears < 1) {
        const ageInMonths = Math.floor(ageInMs / (30.44 * 24 * 60 * 60 * 1000));
        return `${ageInMonths} months`;
      } else {
        return `${ageInYears} years`;
      }
    } catch (error) {
      return '';
    }
  };

  // Auto-fill pet data when pet is selected
  const handlePetChange = (petName: string, petData?: Pet) => {
    if (petData) {
      // Calculate age from date of birth based on walk-in date
      const calculatedAge = calculateAge(petData.date_of_birth || '', formData.date);

      // Map gender with proper case formatting
      let formattedGender = '';
      if (petData.gender) {
        const genderLower = petData.gender.toLowerCase();
        if (genderLower === 'female' || genderLower === 'f') {
          formattedGender = 'Female';
        } else if (genderLower === 'male' || genderLower === 'm') {
          formattedGender = 'Male';
        } else {
          formattedGender = petData.gender;
        }
      }

      setFormData(prev => ({
        ...prev,
        petName,
        petBirthday: petData.date_of_birth || prev.petBirthday,
        breed: petData.breed || prev.breed,
        age: calculatedAge || prev.age,
        gender: formattedGender || prev.gender,
      }));
      setSelectedPetData(petData);
    } else {
      setFormData(prev => ({
        ...prev,
        petName,
      }));
      setSelectedPetData(null);
    }
  };

  // Update age when pet birthday changes manually
  const handlePetBirthdayChange = (birthday: string) => {
    setFormData(prev => ({
      ...prev,
      petBirthday: birthday,
      age: calculateAge(birthday, prev.date),
    }));
  };

  // Update age when date changes (if birthday is already filled)
  const handleDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      date,
      age: prev.petBirthday ? calculateAge(prev.petBirthday, date) : prev.age,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation - only Client Name and Pet Name are required
    if (!formData.clientName || !formData.petName) {
      setError('Please fill in all required fields (Client Name and Pet Name)');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare walk-in data
      const walkInData = {
        date: formData.date,
        client_name: formData.clientName,
        contact_no: formData.contactNo || undefined,
        barangay: formData.barangay || undefined,
        pet_name: formData.petName,
        pet_birthday: formData.petBirthday || undefined,
        breed: formData.breed || undefined,
        age: formData.age || undefined,
        gender: formData.gender || undefined,
        service_type: formData.serviceType || undefined,
        medicine_used: formData.medicineUsed || undefined,
        pet_id: selectedPetData?.id,
        handled_by: 'Dr. Fe Templado', // Auto-filled with default value
      };

      await onSubmit(walkInData);
      
      // Reset form on success
      setFormData({
        date: '',
        clientName: '',
        contactNo: '',
        barangay: '',
        petName: '',
        petBirthday: '',
        breed: '',
        age: '',
        gender: '',
        serviceType: '',
        medicineUsed: '',
      });
      setSelectedOwnerData(null);
      setSelectedPetData(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to update walk-in record');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Walk-In Record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={submitting}
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <OwnerDropdown
                selectedOwner={formData.clientName}
                onOwnerChange={handleOwnerChange}
                placeholder="Type or search client name..."
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact No. (Optional)
              </label>
              <input
                type="tel"
                value={formData.contactNo}
                onChange={(e) => setFormData(prev => ({ ...prev, contactNo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., +63 912 345 6789"
              />
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barangay (Optional)
              </label>
              <input
                type="text"
                value={formData.barangay}
                onChange={(e) => setFormData(prev => ({ ...prev, barangay: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., San Roque, Poblacion"
              />
            </div>

            {/* Pet Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Name *
              </label>
              <PetDropdown
                selectedPet={formData.petName}
                onPetChange={handlePetChange}
                ownerName={formData.clientName}
                placeholder="Type or search pet name..."
                required
                pets={pets}
              />
            </div>

            {/* Pet's Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet's Birthday
              </label>
              <input
                type="date"
                value={formData.petBirthday}
                onChange={(e) => handlePetBirthdayChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Breed
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Golden Retriever, Persian"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="text"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                placeholder="Auto-calculated from birthday"
                readOnly={!!formData.petBirthday}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="flex gap-4 items-center h-[42px]">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === 'Female'}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    disabled={!!selectedPetData}
                    className="mr-2"
                  />
                  <span className={selectedPetData ? 'text-gray-500' : ''}>Female</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === 'Male'}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    disabled={!!selectedPetData}
                    className="mr-2"
                  />
                  <span className={selectedPetData ? 'text-gray-500' : ''}>Male</span>
                </label>
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type (Optional)
              </label>
              <input
                type="text"
                value={formData.serviceType}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Vaccination, Check-up"
              />
            </div>

            {/* Medicine Used */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medicine Used (Optional)
              </label>
              <input
                type="text"
                value={formData.medicineUsed}
                onChange={(e) => setFormData(prev => ({ ...prev, medicineUsed: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Antibiotics, Vaccines"
              />
            </div>
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
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                submitting 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-800 hover:bg-green-900'
              }`}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Walk-In Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWalkInModal;

