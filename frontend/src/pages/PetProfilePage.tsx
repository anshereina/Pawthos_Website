// src/pages/PetProfilePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, PawPrint } from 'lucide-react'; // Import for the back arrow icon AND PawPrint

// Define the structure for a single pet (should match backend response)
interface Pet {
  id: number;
  name: string;
  owner_name: string;
  owner_id: number;
  species: string;
  date_of_birth: string; //YYYY-MM-DD format from backend
  age: number; // Age in years (from backend)
  color: string;
  breed: string;
  gender: string;
  contact_number: string | null;
  address: string | null;
  sterilized: boolean;
}

// Define props for PetProfilePage
interface PetProfilePageProps {
  petId: number; // The ID of the pet to display
  petName: string; // The name of the pet to display (passed from DashboardPage)
  loggedInUserRole: string; // User's role for authorization
  onBackToRecords: () => void; // Callback to go back to Pet Records list
  onViewVaccineCard: (petId: number, petName: string) => void; // Callback to view vaccine card
  onViewMedicalHistory: (petId: number, petName: string) => void; // NEW: Callback to view medical history
}

const PetProfilePage: React.FC<PetProfilePageProps> = ({ petId, petName, loggedInUserRole, onBackToRecords, onViewVaccineCard, onViewMedicalHistory }) => {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utility function to calculate age display string from a numeric age (years)
  const getAgeDisplayString = useCallback((years: number): string => {
    if (years === 0) {
      return 'Less than a year'; // Or "0 years" if preferred
    }
    return `${years} year${years > 1 ? 's' : ''}`;
  }, []);

  // Fetch pet details when the component mounts or petId changes
  useEffect(() => {
    const fetchPetDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5001/api/pets/${petId}`, {
          headers: {
            'X-User-Role': loggedInUserRole, // Send user role for authorization
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPet(data.pet);
      } catch (err: any) {
        console.error(`Failed to fetch pet details for ID ${petId}:`, err);
        setError('Failed to load pet details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPetDetails();
    }
  }, [petId, loggedInUserRole]);

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading pet profile...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!pet) {
    return <div className="p-6 text-center text-gray-600">Pet not found.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-80px)]">
      {/* Back button and Pet Profile title */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBackToRecords}
          className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
          title="Back to Pet Records"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Pet Profile</h2>
      </div>

      {/* Main content area for pet profile */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section: Image Placeholder and Buttons */}
        <div className="lg:w-1/3 flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          {/* Pet Image Placeholder */}
          <div className="w-48 h-48 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden mb-6 shadow-inner">
            {/* Placeholder icon or image */}
            <PawPrint size={80} className="text-gray-500" />
          </div>

          {/* Pet Name and ID */}
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{pet.name}</h3>
          <p className="text-gray-600 text-sm mb-6">Pet ID: {pet.id}</p>

          {/* Buttons */}
          <div className="flex flex-col space-y-3 w-full max-w-[200px]">
            <button
              onClick={() => onViewVaccineCard(pet.id, pet.name)}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-md"
            >
              Vaccine Card
            </button>
            <button
              onClick={() => onViewMedicalHistory(pet.id, pet.name)} // Updated to use onViewMedicalHistory
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              Medical History
            </button>
          </div>

          {/* Sterilized/Intact Checkboxes */}
          <div className="flex items-center space-x-6 mt-6">
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={!pet.sterilized} // Intact if not sterilized
                readOnly
                className="form-checkbox h-5 w-5 text-green-600 rounded"
              />
              <span className="ml-2">Intact</span>
            </label>
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={pet.sterilized} // Castrated/Spayed if sterilized
                readOnly
                className="form-checkbox h-5 w-5 text-green-600 rounded"
              />
              <span className="ml-2">Castrated/Spayed</span>
            </label>
          </div>
        </div>

        {/* Right Section: Pet Information Form */}
        <div className="lg:w-2/3 p-6 bg-green-800 rounded-lg shadow-sm text-white min-h-full"> {/* Added min-h-full */}
          <h3 className="text-xl font-bold mb-6 text-center">({pet.name}'s) Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type of Species */}
            <div>
              <label htmlFor="species" className="block text-sm font-bold mb-1">
                Type of Species:
              </label>
              <input
                type="text"
                id="species"
                value={pet.species}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {/* Breed */}
            <div>
              <label htmlFor="breed" className="block text-sm font-bold mb-1">
                Breed:
              </label>
              <input
                type="text"
                id="breed"
                value={pet.breed}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-bold mb-1">
                Age:
              </label>
              <input
                type="text"
                id="age"
                value={getAgeDisplayString(pet.age)} // Display formatted age
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {/* Color */}
            <div>
              <label htmlFor="color" className="block text-sm font-bold mb-1">
                Color:
              </label>
              <input
                type="text"
                id="color"
                value={pet.color}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm font-bold mb-1">
                Date of Birth:
              </label>
              <input
                type="date" // Use type="date" for consistency, but keep readOnly
                id="dob"
                value={pet.date_of_birth.split('T')[0]} // Format date for display
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {/* Sex */}
            <div>
              <label htmlFor="gender" className="block text-sm font-bold mb-1">
                Sex:
              </label>
              <input
                type="text"
                id="gender"
                value={pet.gender}
                readOnly
                className="w-full px-3 py-2 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetProfilePage;
