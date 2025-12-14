import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import OwnerDropdown from './OwnerDropdown';
import PetDropdown from './PetDropdown';
import { OwnerSearchResult } from '../services/shippingPermitRecordService';
import { Pet } from '../services/petService';
import { usePets } from '../hooks/usePets';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
}

const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const { pets, fetchPets } = usePets();
  const [formData, setFormData] = useState({
    ownerName: '',
    appointmentFor: '',
    contactNumber: '',
    ownerBirthday: '',
    petName: '',
    petBirthday: '',
    breed: '',
    age: '',
    gender: '',
    medicineUsed: '',
    date: '',
    species: '',
    reproductiveStatus: '',
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        ownerName: '',
        appointmentFor: '',
        contactNumber: '',
        ownerBirthday: '',
        petName: '',
        petBirthday: '',
        breed: '',
        age: '',
        gender: '',
        medicineUsed: '',
        date: '',
        species: '',
        reproductiveStatus: '',
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
      ownerName,
      contactNumber: ownerData?.contact_number || prev.contactNumber,
      ownerBirthday: ownerData?.birthdate || prev.ownerBirthday,
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
        species: '',
        reproductiveStatus: '',
      }));
      setSelectedPetData(null);
    }
  };

  // Auto-fill pet data when pet is selected
  const handlePetChange = (petName: string, petData?: Pet) => {
    if (petData) {
      // Calculate age from date of birth
      let calculatedAge = '';
      if (petData.date_of_birth) {
        const birthDate = new Date(petData.date_of_birth);
        const today = new Date();
        const ageInMs = today.getTime() - birthDate.getTime();
        const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
        if (ageInYears < 1) {
          const ageInMonths = Math.floor(ageInMs / (30.44 * 24 * 60 * 60 * 1000));
          calculatedAge = `${ageInMonths} months`;
        } else {
          calculatedAge = `${ageInYears} years`;
        }
      }

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

      // Map reproductive status with proper case formatting
      let formattedReproductiveStatus = '';
      if (petData.reproductive_status) {
        const statusLower = petData.reproductive_status.toLowerCase();
        if (statusLower === 'intact' || statusLower === 'not neutered' || statusLower === 'not spayed') {
          formattedReproductiveStatus = 'Intact';
        } else if (statusLower === 'castrated' || statusLower === 'spayed' || statusLower === 'neutered' || statusLower === 'castrated/spayed') {
          formattedReproductiveStatus = 'Castrated/Spayed';
        } else {
          formattedReproductiveStatus = petData.reproductive_status;
        }
      }

      setFormData(prev => ({
        ...prev,
        petName,
        petBirthday: petData.date_of_birth || prev.petBirthday,
        breed: petData.breed || prev.breed,
        age: calculatedAge || prev.age,
        gender: formattedGender || prev.gender,
        species: petData.species || prev.species,
        reproductiveStatus: formattedReproductiveStatus || prev.reproductiveStatus,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.ownerName || !formData.appointmentFor || !formData.petName || !formData.date) {
      setError('Please fill in all required fields (Owner Name, Appointment For, Pet Name, and Date)');
      return;
    }

    setSubmitting(true);
    try {
      // Prepare appointment data
      // Build notes field with medicine used and additional info
      let notesParts: string[] = [];
      if (formData.medicineUsed) {
        notesParts.push(`Medicine Used: ${formData.medicineUsed}`);
      }
      if (formData.contactNumber) {
        notesParts.push(`Contact: ${formData.contactNumber}`);
      }
      if (formData.ownerBirthday) {
        notesParts.push(`Owner Birthday: ${formData.ownerBirthday}`);
      }
      const notes = notesParts.length > 0 ? notesParts.join(' | ') : undefined;

      const appointmentData = {
        type: formData.appointmentFor,
        date: formData.date,
        time: '00:00', // Default time since field is removed
        pet_id: selectedPetData?.id,
        notes: notes,
        status: 'Completed', // Set status to Completed so it appears in History tab
        owner_name: formData.ownerName,
        pet_name: formData.petName,
        pet_species: formData.species || undefined,
        pet_breed: formData.breed || undefined,
        pet_age: formData.age || undefined,
        pet_gender: formData.gender || undefined,
      };

      await onSubmit(appointmentData);
      
      // Reset form on success
      setFormData({
        ownerName: '',
        appointmentFor: '',
        contactNumber: '',
        ownerBirthday: '',
        petName: '',
        petBirthday: '',
        breed: '',
        age: '',
        gender: '',
        medicineUsed: '',
        date: '',
        species: '',
        reproductiveStatus: '',
      });
      setSelectedOwnerData(null);
      setSelectedPetData(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to create appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Appointment Record</h2>
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
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Owner's Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner's Name *
              </label>
              <OwnerDropdown
                selectedOwner={formData.ownerName}
                onOwnerChange={handleOwnerChange}
                placeholder="Type or search owner name..."
                required
              />
            </div>

            {/* Appointment For */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment For *
              </label>
              <input
                type="text"
                value={formData.appointmentFor}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentFor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Vaccination, Check-up, Surgery"
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., +63 912 345 6789"
              />
            </div>

            {/* Owner's Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner's Birthday
              </label>
              <input
                type="date"
                value={formData.ownerBirthday}
                onChange={(e) => setFormData(prev => ({ ...prev, ownerBirthday: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Pet's Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet's Name *
              </label>
              <PetDropdown
                selectedPet={formData.petName}
                onPetChange={handlePetChange}
                ownerName={formData.ownerName}
                placeholder="Type or search pet name..."
                required
                pets={pets}
              />
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Species
              </label>
              <select
                value={formData.species}
                onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                disabled={!!selectedPetData}
              >
                <option value="">Select species</option>
                <option value="Canine">Canine</option>
                <option value="Feline">Feline</option>
              </select>
            </div>

            {/* Pet's Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet's Birthday
              </label>
              <input
                type="date"
                value={formData.petBirthday}
                onChange={(e) => setFormData(prev => ({ ...prev, petBirthday: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                disabled={!!selectedPetData}
                readOnly
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

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <div className="flex gap-4">
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

            {/* Reproductive Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reproductive Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reproductiveStatus"
                    value="Intact"
                    checked={formData.reproductiveStatus === 'Intact'}
                    onChange={(e) => setFormData(prev => ({ ...prev, reproductiveStatus: e.target.value }))}
                    disabled={!!selectedPetData}
                    className="mr-2"
                  />
                  <span className={selectedPetData ? 'text-gray-500' : ''}>Intact</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reproductiveStatus"
                    value="Castrated/Spayed"
                    checked={formData.reproductiveStatus === 'Castrated/Spayed'}
                    onChange={(e) => setFormData(prev => ({ ...prev, reproductiveStatus: e.target.value }))}
                    disabled={!!selectedPetData}
                    className="mr-2"
                  />
                  <span className={selectedPetData ? 'text-gray-500' : ''}>Castrated/Spayed</span>
                </label>
              </div>
            </div>
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
              {submitting ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;

