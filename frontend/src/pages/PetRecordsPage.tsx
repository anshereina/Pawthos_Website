// src/pages/PetRecordsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, PlusCircle, Edit, Trash2, XCircle, AlertTriangle } from 'lucide-react';

// Define the structure for a single pet
interface Pet {
  id: number;
  name: string;
  owner_name: string; // This should be a string
  owner_id: number;
  species: string;
  date_of_birth: string; //YYYY-MM-DD
  age: number; // Age is stored as a number (years) in the backend
  color: string;
  breed: string;
  gender: string;
  contact_number: string | null;
  address: string | null;
  sterilized: boolean;
}

// Define a type for a User object as received from the backend (for owner selection)
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  address?: string | null;
  phone_number?: string | null;
}

// Define props for PetRecordsPage
interface PetRecordsPageProps {
  loggedInUserRole: string; // Prop to receive the logged-in user's role
  onViewPetProfile: (petId: number, petName: string) => void; // Callback to view pet profile
}

const PetRecordsPage: React.FC<PetRecordsPageProps> = ({ loggedInUserRole, onViewPetProfile }) => {
  const [pets, setPets] = useState<Pet[]>([]); // State to store all pets
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]); // State for filtered pets
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // For success/error messages

  // State for modals (Add Pet, Edit Pet, Delete Pet)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

  // Form states for Add/Edit Pet
  const [formName, setFormName] = useState('');
  const [formOwnerName, setFormOwnerName] = useState(''); // State for owner's name input
  const [formOwnerId, setFormOwnerId] = useState<number | ''>(); // State for owner's ID (sent to backend)
  const [formSpecies, setFormSpecies] = useState('');
  const [formDateOfBirth, setFormDateOfBirth] = useState('');
  const [formAge, setFormAge] = useState<number | ''>(); // Numeric age for backend
  const [formAgeDisplay, setFormAgeDisplay] = useState(''); // String for UI display (e.g., "5 years", "6 months")
  const [formColor, setFormColor] = useState('');
  const [formBreed, setFormBreed] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formContactNumber, setFormContactNumber] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formSterilized, setFormSterilized] = useState<boolean>(false);

  // States for owner autocomplete
  const [allUsers, setAllUsers] = useState<User[]>([]); // All registered users/owners
  const [filteredOwners, setFilteredOwners] = useState<User[]>([]); // Filtered suggestions for owner name

  // Utility function to calculate age display string from a numeric age (years)
  const getAgeDisplayString = useCallback((years: number): string => {
    if (years === 0) {
      return 'Less than a year'; // Or "0 years" if preferred
    }
    return `${years} year${years > 1 ? 's' : ''}`;
  }, []);

  // Utility function to calculate age (display string and value for backend) from DOB
  const calculateAgeDisplayAndValue = useCallback((dobString: string | undefined): { display: string, valueForBackend: number | '' } => {
    if (!dobString) {
      return { display: '', valueForBackend: '' };
    }

    const dob = new Date(dobString);
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      // Get days in the month prior to today's month
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years > 0) {
      return { display: `${years} year${years > 1 ? 's' : ''}`, valueForBackend: years };
    } else if (months > 0) {
      return { display: `${months} month${months > 1 ? 's' : ''}`, valueForBackend: 0 }; // Send 0 years to backend if less than 1 year
    } else {
      // If less than a month old, or date is invalid
      return { display: 'Less than a month', valueForBackend: 0 };
    }
  }, []);


  // Fetch pet records from the backend
  const fetchPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null); // Clear messages on new fetch
    try {
      const response = await fetch('http://localhost:5001/api/pets', {
        headers: {
          'X-User-Role': loggedInUserRole, // Send user role for authorization
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPets(data.pets); // Store all fetched pets
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch pets:', err);
      setError('Failed to load pet records. Please try again.');
      setLoading(false);
    }
  }, [loggedInUserRole]);

  // Fetch all users (for owner autocomplete) on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/users', {
          headers: {
            'X-User-Role': loggedInUserRole, // Required for authorization
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllUsers(data.users.filter((user: User) => user.role === 'pet_owner' || user.role === 'admin')); // Filter for relevant roles
      } catch (err: any) {
        console.error('Failed to fetch all users for owner selection:', err);
        // Don't set global error, just log for this specific fetch
      }
    };
    fetchAllUsers();
  }, [loggedInUserRole]); // Dependency on loggedInUserRole

  // Effect to fetch pets on component mount
  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Effect to filter pets whenever pets or searchTerm changes
  useEffect(() => {
    let currentPets = [...pets]; // Start with all pets

    // Apply search term filtering
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentPets = currentPets.filter(pet =>
        pet.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        pet.owner_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        pet.species.toLowerCase().includes(lowerCaseSearchTerm) ||
        pet.breed.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(pet.id).includes(lowerCaseSearchTerm) // Allow searching by ID
      );
    }

    setFilteredPets(currentPets);
  }, [pets, searchTerm]);

  // --- Modal Control Functions ---
  const openAddModal = () => {
    // Reset form fields for adding a new pet
    setFormName('');
    setFormOwnerName('');
    setFormOwnerId(''); // Clear owner ID
    setFormSpecies('');
    setFormDateOfBirth('');
    setFormAge(''); // Clear numeric age
    setFormAgeDisplay(''); // Clear age display string
    setFormColor('');
    setFormBreed('');
    setFormGender('');
    setFormContactNumber(''); // Clear contact number
    setFormAddress(''); // Clear address
    setFormSterilized(false);
    setFilteredOwners([]); // Clear suggestions
    setIsAddModalOpen(true);
    setMessage(null); // Clear messages
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (pet: Pet) => {
    setPetToEdit(pet);
    // Populate form fields with existing pet data
    setFormName(pet.name);
    setFormOwnerName(pet.owner_name);
    setFormOwnerId(pet.owner_id);
    setFormSpecies(pet.species);
    setFormDateOfBirth(pet.date_of_birth.split('T')[0]); // Format date for input
    setFormAge(pet.age); // Set numeric age from fetched pet
    setFormAgeDisplay(getAgeDisplayString(pet.age)); // Set display string based on numeric age
    setFormColor(pet.color);
    setFormBreed(pet.breed);
    setFormGender(pet.gender);
    setFormContactNumber(pet.contact_number || '');
    setFormAddress(pet.address || '');
    setFormSterilized(pet.sterilized);
    setFilteredOwners([]); // Clear suggestions
    setIsEditModalOpen(true);
    setMessage(null); // Clear messages
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setPetToEdit(null);
  };

  const openDeleteModal = (pet: Pet) => {
    setPetToDelete(pet);
    setIsDeleteModalOpen(true);
    setMessage(null); // Clear messages
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPetToDelete(null);
  };

  // --- Owner Autocomplete Handlers ---
  const handleOwnerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setFormOwnerName(input);
    // Clear associated fields if the input changes and no owner is selected
    setFormOwnerId('');
    setFormContactNumber('');
    setFormAddress('');

    if (input.length > 0) {
      const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredOwners(filtered);
    } else {
      setFilteredOwners([]);
    }
  };

  const handleOwnerSelect = (owner: User) => {
    setFormOwnerName(owner.name);
    setFormOwnerId(owner.id);
    setFormContactNumber(owner.phone_number || '');
    setFormAddress(owner.address || '');
    setFilteredOwners([]); // Hide suggestions after selection
  };

  // --- CRUD Operation Handlers ---

  // Handle Add Pet submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    if (formOwnerId === '') {
      setMessage('Please select a registered owner from the suggestions or ensure Owner ID is valid.');
      return;
    }
    if (formAge === '') { // Check the numeric age for backend
      setMessage('Age is required. Please enter a valid Date of Birth.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': loggedInUserRole,
        },
        body: JSON.stringify({
          name: formName,
          owner_id: formOwnerId, // Use the selected owner's ID
          species: formSpecies,
          date_of_birth: formDateOfBirth,
          age: formAge, // Send the numeric age
          color: formColor,
          breed: formBreed,
          gender: formGender,
          contact_number: formContactNumber || null,
          address: formAddress || null,
          sterilized: formSterilized,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Pet record added successfully!');
        closeAddModal();
        fetchPets(); // Refresh the list of pets
      } else {
        setMessage(`Failed to add pet: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error adding pet:', err);
      setMessage('An error occurred while adding pet.');
    }
  };

  // Handle Update Pet submission
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    if (!petToEdit) return;

    if (formOwnerId === '') {
      setMessage('Please select a registered owner from the suggestions or ensure Owner ID is valid.');
      return;
    }
    if (formAge === '') { // Check the numeric age for backend
      setMessage('Age is required. Please enter a valid Date of Birth.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/pets/${petToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': loggedInUserRole,
        },
        body: JSON.stringify({
          name: formName,
          owner_id: formOwnerId, // Use the selected owner's ID
          species: formSpecies,
          date_of_birth: formDateOfBirth,
          age: formAge, // Send the numeric age
          color: formColor,
          breed: formBreed,
          gender: formGender,
          contact_number: formContactNumber || null,
          address: formAddress || null,
          sterilized: formSterilized,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Pet record updated successfully!');
        closeEditModal();
        fetchPets(); // Refresh the list of pets
      } else {
        setMessage(`Failed to update pet: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error updating pet:', err);
      setMessage('An error occurred while updating pet.');
    }
  };

  // Handle Delete Pet confirmation
  const handleConfirmDelete = async () => {
    setMessage(null); // Clear previous messages
    if (!petToDelete) return;

    try {
      const response = await fetch(`http://localhost:5001/api/pets/${petToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': loggedInUserRole,
        },
      });

      if (response.ok) {
        setMessage('Pet record deleted successfully!');
        closeDeleteModal();
        fetchPets(); // Refresh the list of pets
      } else {
        const data = await response.json();
        setMessage(`Failed to delete pet: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error deleting pet:', err);
      setMessage('An error occurred while deleting pet.');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading pet records...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-80px)]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Pet Records</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message}
        </div>
      )}

      {/* Controls: Search and Add New Pet */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search pets by name, owner, species, breed or ID"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Add New Pet Button */}
        <button
          className="flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-md"
          onClick={openAddModal}
        >
          <PlusCircle size={20} className="mr-2" /> Add New Pet
        </button>
      </div>

      {/* Pet Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Owner Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Species
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Breed
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Gender
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Age
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Sterilized
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPets.length > 0 ? (
              filteredPets.map((pet) => (
                <tr key={pet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pet.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.owner_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.species}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.breed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pet.sterilized ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onViewPetProfile(pet.id, pet.name)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Profile"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(pet)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Pet"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(pet)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Pet"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No pet records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Add New Pet Modal --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add New Pet</h3>
              <button onClick={closeAddModal} className="text-gray-300 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {message}
              </div>
            )}
            <form onSubmit={handleAddSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Owners Name with Autocomplete */}
                <div className="mb-4 sm:mb-0 relative">
                  <label htmlFor="addOwnerName" className="block text-sm font-bold mb-2">
                    Owner's Name:
                  </label>
                  <input
                    type="text"
                    id="addOwnerName"
                    value={formOwnerName}
                    onChange={handleOwnerNameChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                    autoComplete="off" // Disable browser autocomplete
                  />
                  {filteredOwners.length > 0 && formOwnerName.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                      {filteredOwners.map((owner) => (
                        <li
                          key={owner.id}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
                          onClick={() => handleOwnerSelect(owner)}
                        >
                          {owner.name} ({owner.email})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Color */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="addColor" className="block text-sm font-bold mb-2">
                    Color:
                  </label>
                  <input
                    type="text"
                    id="addColor"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  />
                </div>
                {/* Contact Number (Auto-filled) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="addContactNumber" className="block text-sm font-bold mb-2">
                    Contact Number:
                  </label>
                  <input
                    type="text"
                    id="addContactNumber"
                    value={formContactNumber}
                    onChange={(e) => setFormContactNumber(e.target.value)} // Still allow manual edit if needed
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    readOnly={formOwnerId !== ''} // Make read-only if an owner is selected
                  />
                </div>
                {/* Date of Birth (Moved Up) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="addDateOfBirth" className="block text-sm font-bold mb-2">
                    Date of Birth:
                  </label>
                  <input
                    type="date"
                    id="addDateOfBirth"
                    value={formDateOfBirth}
                    onChange={(e) => {
                      const newDob = e.target.value;
                      setFormDateOfBirth(newDob);
                      const { display, valueForBackend } = calculateAgeDisplayAndValue(newDob);
                      setFormAge(valueForBackend);
                      setFormAgeDisplay(display);
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                {/* Address (Auto-filled) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="addAddress" className="block text-sm font-bold mb-2">
                    Address:
                  </label>
                  <input
                    type="text"
                    id="addAddress"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)} // Still allow manual edit if needed
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    readOnly={formOwnerId !== ''} // Make read-only if an owner is selected
                  />
                </div>
                {/* Age (Moved Down and Read-Only) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="addAge" className="block text-sm font-bold mb-2">
                    Age:
                  </label>
                  <input
                    type="text" // Changed to text as it's a display string
                    id="addAge"
                    value={formAgeDisplay} // Display the calculated age string
                    readOnly // Make it read-only
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                {/* Pet's Name (Moved Up) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="addName" className="block text-sm font-bold mb-2">
                    Pet's Name:
                  </label>
                  <input
                    type="text"
                    id="addName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                {/* Breed (Moved Down) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="addBreed" className="block text-sm font-bold mb-2">
                    Breed:
                  </label>
                  <input
                    type="text"
                    id="addBreed"
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  />
                </div>
                {/* Species */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="addSpecies" className="block text-sm font-bold mb-2">
                    Species:
                  </label>
                  <select
                    id="addSpecies"
                    value={formSpecies}
                    onChange={(e) => setFormSpecies(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  >
                    <option value="">Select Species</option>
                    <option value="Canine">Canine</option>
                    <option value="Feline">Feline</option>
                  </select>
                </div>
                {/* Gender */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="addGender" className="block text-sm font-bold mb-2">
                    Gender:
                  </label>
                  <select
                    id="addGender"
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {/* Sterilized checkbox */}
                <div className="col-span-1 sm:col-span-2 flex items-center mt-4">
                  <label htmlFor="addSterilized" className="block text-sm font-bold">
                    Sterilized:
                  </label>
                  <input
                    type="checkbox"
                    id="addSterilized"
                    checked={formSterilized}
                    onChange={(e) => setFormSterilized(e.target.checked)}
                    className="ml-2 form-checkbox h-5 w-5 text-green-600 rounded"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Add Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Pet Modal --- */}
      {isEditModalOpen && petToEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Pet Information</h3>
              <button onClick={closeEditModal} className="text-gray-300 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {message}
              </div>
            )}
            <form onSubmit={handleUpdateSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Owners Name with Autocomplete */}
                <div className="mb-4 sm:mb-0 relative">
                  <label htmlFor="editOwnerName" className="block text-sm font-bold mb-2">
                    Owner's Name:
                  </label>
                  <input
                    type="text"
                    id="editOwnerName"
                    value={formOwnerName}
                    onChange={handleOwnerNameChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                    autoComplete="off"
                  />
                  {filteredOwners.length > 0 && formOwnerName.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
                      {filteredOwners.map((owner) => (
                        <li
                          key={owner.id}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
                          onClick={() => handleOwnerSelect(owner)}
                        >
                          {owner.name} ({owner.email})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Color */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="editColor" className="block text-sm font-bold mb-2">
                    Color:
                  </label>
                  <input
                    type="text"
                    id="editColor"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  />
                </div>
                {/* Contact Number (Auto-filled) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="editContactNumber" className="block text-sm font-bold mb-2">
                    Contact Number:
                  </label>
                  <input
                    type="text"
                    id="editContactNumber"
                    value={formContactNumber}
                    onChange={(e) => setFormContactNumber(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    readOnly={formOwnerId !== ''}
                  />
                </div>
                {/* Date of Birth (Moved Up) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="editDateOfBirth" className="block text-sm font-bold mb-2">
                    Date of Birth:
                  </label>
                  <input
                    type="date"
                    id="editDateOfBirth"
                    value={formDateOfBirth}
                    onChange={(e) => {
                      const newDob = e.target.value;
                      setFormDateOfBirth(newDob);
                      const { display, valueForBackend } = calculateAgeDisplayAndValue(newDob);
                      setFormAge(valueForBackend);
                      setFormAgeDisplay(display);
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                {/* Address (Auto-filled) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="editAddress" className="block text-sm font-bold mb-2">
                    Address:
                  </label>
                  <input
                    type="text"
                    id="editAddress"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    readOnly={formOwnerId !== ''}
                  />
                </div>
                {/* Age (Moved Down and Read-Only) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="editAge" className="block text-sm font-bold mb-2">
                    Age:
                  </label>
                  <input
                    type="text" // Changed to text as it's a display string
                    id="editAge"
                    value={formAgeDisplay} // Display the calculated age string
                    readOnly // Make it read-only
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                {/* Pet's Name (Moved Up) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="editName" className="block text-sm font-bold mb-2">
                    Pet's Name:
                  </label>
                  <input
                    type="text"
                    id="editName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                {/* Breed (Moved Down) */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="editBreed" className="block text-sm font-bold mb-2">
                    Breed:
                  </label>
                  <input
                    type="text"
                    id="editBreed"
                    value={formBreed}
                    onChange={(e) => setFormBreed(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 placeholder-gray-500 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  />
                </div>
                {/* Species */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="editSpecies" className="block text-sm font-bold mb-2">
                    Species:
                  </label>
                  <select
                    id="editSpecies"
                    value={formSpecies}
                    onChange={(e) => setFormSpecies(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  >
                    <option value="">Select Species</option>
                    <option value="Canine">Canine</option>
                    <option value="Feline">Feline</option>
                  </select>
                </div>
                {/* Gender */}
                <div className="mb-4 sm:mb-0">
                  <label htmlFor="editGender" className="block text-sm font-bold mb-2">
                    Gender:
                  </label>
                  <select
                    id="editGender"
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {/* Sterilized checkbox */}
                <div className="col-span-1 sm:col-span-2 flex items-center mt-4">
                  <label htmlFor="editSterilized" className="block text-sm font-bold">
                    Sterilized:
                  </label>
                  <input
                    type="checkbox"
                    id="editSterilized"
                    checked={formSterilized}
                    onChange={(e) => setFormSterilized(e.target.checked)}
                    className="ml-2 form-checkbox h-5 w-5 text-green-600 rounded"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Pet Confirmation Modal --- */}
      {isDeleteModalOpen && petToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center text-white">
            <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete pet "<strong>{petToDelete.name}</strong>"? This action cannot be undone.
            </p>
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {message}
              </div>
            )}
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default PetRecordsPage;
