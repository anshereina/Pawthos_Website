import React from 'react';
import { X, Calendar, CheckSquare } from 'lucide-react';
import { Pet } from '../services/petService';

interface PetProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet | null;
  loading: boolean;
}

const PetProfileModal: React.FC<PetProfileModalProps> = ({ isOpen, onClose, pet, loading }) => {
  if (!isOpen || !pet) return null;

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '-';
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return `${age} years`;
    } catch {
      return '-';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString();
    } catch {
      return '-';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative p-8 animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-green-800"
          onClick={onClose}
        >
          <X size={28} />
        </button>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mb-4"></div>
            <p className="text-gray-600">Loading pet profile...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl font-bold text-green-800 mb-1 text-center">{pet.name}</h2>
            <div className="text-sm text-gray-500 font-medium mb-4 text-center">Pet ID: <span className="font-mono">{pet.pet_id}</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 w-full min-h-[120px]">
              <div>
                <label className="block text-green-800 mb-1">Type of Species:</label>
                <input type="text" value={pet.species || ''} className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" disabled />
              </div>
              <div className="flex flex-col justify-center items-center h-full">
                <label className="block text-green-800 mb-1">Age:</label>
                <input type="text" value={calculateAge(pet.date_of_birth)} className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" disabled />
              </div>
              <div>
                <label className="block text-green-800 mb-1">Date of Birth:</label>
                <div className="relative">
                  <input type="text" value={formatDate(pet.date_of_birth)} className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800 pr-10" disabled />
                  <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700" />
                </div>
              </div>
              <div className="flex flex-col justify-center items-center h-full">
                <label className="block text-green-800 mb-1">Breed:</label>
                <input type="text" value={pet.breed || ''} className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" disabled />
              </div>
              <div>
                <label className="block text-green-800 mb-1">Color:</label>
                <input type="text" value={pet.color || ''} className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" disabled />
              </div>
              <div className="flex flex-col justify-center items-center h-full">
                <label className="block text-green-800 mb-1">Sex:</label>
                <input type="text" value={pet.gender || ''} className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" disabled />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 w-full min-h-[80px]">
              <div>
                <label className="block text-green-800 mb-1">Owner's Name:</label>
                <input type="text" value={pet.owner_name || ''} className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" disabled />
              </div>
              <div className="flex flex-col justify-center items-center h-full">
                <label className="block text-green-800 mb-1">Registration Date:</label>
                <input type="text" value={formatDate(pet.created_at)} className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" disabled />
              </div>
            </div>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="inline-flex items-center justify-center w-5 h-5 border-2 border-green-700 rounded bg-white">
                  <CheckSquare size={18} className="text-green-700" />
                </span>
                <span className="text-green-800 font-medium">Intact</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="inline-flex items-center justify-center w-5 h-5 border-2 border-green-700 rounded bg-white">
                  <CheckSquare size={18} className="text-green-700" />
                </span>
                <span className="text-green-800 font-medium">Castrated/Spayed</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetProfileModal; 