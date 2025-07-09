// src/pages/PetVaccineCardPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, PlusCircle, Edit, Trash2, XCircle, AlertTriangle, Search } from 'lucide-react';

// Define the structure for a single vaccine record
interface VaccineRecord {
  id: number;
  pet_id: number; // Added pet_id as it's part of the database schema
  date_of_vaccination: string; //YYYY-MM-DD
  vaccine_used: string;
  batch_lot_no: string | null; // Can be null in DB
  date_of_next_vaccination: string | null; // Can be null in DB
  veterinarian_lic_no_ptr: string;
}

// Define props for PetVaccineCardPage
interface PetVaccineCardPageProps {
  petId: number;
  petName: string;
  loggedInUserRole: string; // Will be used for authorization headers
  onBackToProfile: () => void; // Callback to go back to Pet Profile
}

const PetVaccineCardPage: React.FC<PetVaccineCardPageProps> = ({ petId, petName, loggedInUserRole, onBackToProfile }) => {
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<VaccineRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Set to true initially as we'll fetch data
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // State for Add/Edit Modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<VaccineRecord | null>(null); // For editing or deleting

  // Form states
  const [formDateOfVaccination, setFormDateOfVaccination] = useState('');
  const [formVaccineUsed, setFormVaccineUsed] = useState('');
  const [formBatchLotNo, setFormBatchLotNo] = useState('');
  const [formDateOfNextVaccination, setFormDateOfNextVaccination] = useState('');
  const VETERINARIAN_INFO = "Dr. Ma Fe V. Templado PRC # 4585"; // Pre-filled value

  // Utility to calculate next vaccination date (e.g., 1 year later)
  const calculateNextVaccinationDate = useCallback((vaccinationDate: string): string => {
    if (!vaccinationDate) return '';
    const date = new Date(vaccinationDate);
    date.setFullYear(date.getFullYear() + 1); // Add one year
    return date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
  }, []);

  // --- API Calls ---
  const fetchVaccineRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/api/pets/${petId}/vaccine-records`, {
        headers: {
          'X-User-Role': loggedInUserRole, // Send user role for authorization
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setVaccineRecords(data.vaccineRecords);
    } catch (err: any) {
      console.error('Failed to fetch vaccine records:', err);
      setError(`Failed to load vaccine records: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [petId, loggedInUserRole]);

  // Effect to fetch vaccine records on component mount or petId/userRole change
  useEffect(() => {
    fetchVaccineRecords();
  }, [fetchVaccineRecords]);

  // Effect to filter vaccine records whenever vaccineRecords or searchTerm changes
  useEffect(() => {
    let currentRecords = [...vaccineRecords];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentRecords = currentRecords.filter(record =>
        record.vaccine_used.toLowerCase().includes(lowerCaseSearchTerm) ||
        (record.batch_lot_no && record.batch_lot_no.toLowerCase().includes(lowerCaseSearchTerm)) ||
        record.date_of_vaccination.includes(lowerCaseSearchTerm) ||
        (record.date_of_next_vaccination && record.date_of_next_vaccination.includes(lowerCaseSearchTerm))
      );
    }
    setFilteredRecords(currentRecords);
  }, [vaccineRecords, searchTerm]);

  // --- Modal Control Functions ---
  const openAddModal = () => {
    setCurrentRecord(null); // Clear for add operation
    setFormDateOfVaccination('');
    setFormVaccineUsed('');
    setFormBatchLotNo('');
    setFormDateOfNextVaccination(''); // Will be calculated or left empty
    setMessage(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (record: VaccineRecord) => {
    setCurrentRecord(record);
    setFormDateOfVaccination(record.date_of_vaccination);
    setFormVaccineUsed(record.vaccine_used);
    setFormBatchLotNo(record.batch_lot_no || '');
    setFormDateOfNextVaccination(record.date_of_next_vaccination || '');
    setMessage(null);
    setIsAddEditModalOpen(true);
  };

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setCurrentRecord(null);
    setMessage(null); // Clear message on modal close
  };

  const openDeleteModal = (record: VaccineRecord) => {
    setCurrentRecord(record);
    setMessage(null);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentRecord(null);
    setMessage(null); // Clear message on modal close
  };

  // --- Form Submission Handlers ---
  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formDateOfVaccination || !formVaccineUsed || !VETERINARIAN_INFO) {
      setMessage('Please fill in all required fields (Date, Vaccine, Veterinarian Info).');
      return;
    }

    const recordData = {
      date_of_vaccination: formDateOfVaccination,
      vaccine_used: formVaccineUsed,
      batch_lot_no: formBatchLotNo || null,
      date_of_next_vaccination: formDateOfNextVaccination || null,
      veterinarian_lic_no_ptr: VETERINARIAN_INFO,
    };

    setLoading(true); // Start loading for API call
    try {
      let response;
      if (currentRecord) {
        // Update existing record
        response = await fetch(`http://localhost:5001/api/vaccine-records/${currentRecord.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Role': loggedInUserRole,
          },
          body: JSON.stringify(recordData),
        });
      } else {
        // Add new record
        response = await fetch(`http://localhost:5001/api/pets/${petId}/vaccine-records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Role': loggedInUserRole,
          },
          body: JSON.stringify(recordData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setMessage(`Vaccine record ${currentRecord ? 'updated' : 'added'} successfully!`);
      fetchVaccineRecords(); // Re-fetch all records to update the table
      closeAddEditModal();
    } catch (err: any) {
      console.error(`Error ${currentRecord ? 'updating' : 'adding'} vaccine record:`, err);
      setMessage(`Failed to ${currentRecord ? 'update' : 'add'} record: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setMessage(null);
    if (!currentRecord) return;

    setLoading(true); // Start loading for API call
    try {
      const response = await fetch(`http://localhost:5001/api/vaccine-records/${currentRecord.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': loggedInUserRole,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setMessage('Vaccine record deleted successfully!');
      fetchVaccineRecords(); // Re-fetch all records to update the table
      closeDeleteModal();
    } catch (err: any) {
      console.error('Error deleting vaccine record:', err);
      setMessage(`Failed to delete record: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading vaccine card...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-80px)]">
      {/* Back button and Title */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBackToProfile}
          className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
          title="Back to Pet Profile"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Vaccine Card for {petName}</h2>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message}
        </div>
      )}

      {/* Controls: Search and Add New Vaccine Record */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search vaccine records"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Add New Vaccine Record Button */}
        <button
          onClick={openAddModal}
          className="flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-md"
        >
          <PlusCircle size={20} className="mr-2" /> Add New Vaccine Record
        </button>
      </div>

      {/* Vaccine Records Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Date of Vaccination
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Vaccine Used
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Batch No./Lot No.
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Date of Next Vaccination
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Veterinarian Lic No. PTR
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.date_of_vaccination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.vaccine_used}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.batch_lot_no || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date_of_next_vaccination || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.veterinarian_lic_no_ptr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => openEditModal(record)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Record"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(record)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No vaccine records found for {petName}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Add/Edit Vaccine Record Modal --- */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{currentRecord ? 'Edit Vaccine Record' : 'Add New Vaccine Record'}</h3>
              <button onClick={closeAddEditModal} className="text-gray-300 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {message}
              </div>
            )}
            <form onSubmit={handleAddEditSubmit}>
              <div className="grid grid-cols-1 gap-4">
                {/* Date of Vaccination */}
                <div>
                  <label htmlFor="dateOfVaccination" className="block text-sm font-bold mb-2">
                    Date of Vaccination:
                  </label>
                  <input
                    type="date"
                    id="dateOfVaccination"
                    value={formDateOfVaccination}
                    onChange={(e) => {
                      setFormDateOfVaccination(e.target.value);
                      setFormDateOfNextVaccination(calculateNextVaccinationDate(e.target.value));
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                {/* Vaccine Used */}
                <div>
                  <label htmlFor="vaccineUsed" className="block text-sm font-bold mb-2">
                    Vaccine Used:
                  </label>
                  <input
                    type="text"
                    id="vaccineUsed"
                    value={formVaccineUsed}
                    onChange={(e) => setFormVaccineUsed(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                {/* Batch No./Lot No. */}
                <div>
                  <label htmlFor="batchLotNo" className="block text-sm font-bold mb-2">
                    Batch No./Lot No.:
                  </label>
                  <input
                    type="text"
                    id="batchLotNo"
                    value={formBatchLotNo}
                    onChange={(e) => setFormBatchLotNo(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  />
                </div>
                {/* Date of Next Vaccination (Auto-calculated) */}
                <div>
                  <label htmlFor="dateOfNextVaccination" className="block text-sm font-bold mb-2">
                    Date of Next Vaccination:
                  </label>
                  <input
                    type="date"
                    id="dateOfNextVaccination"
                    value={formDateOfNextVaccination}
                    readOnly
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                {/* Veterinarian Lic No. PTR (Pre-filled and Read-only) */}
                <div>
                  <label htmlFor="veterinarianLicNo" className="block text-sm font-bold mb-2">
                    Veterinarian Lic No. PTR:
                  </label>
                  <input
                    type="text"
                    id="veterinarianLicNo"
                    value={VETERINARIAN_INFO}
                    readOnly
                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-200 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={closeAddEditModal}
                  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  {currentRecord ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {isDeleteModalOpen && currentRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center text-white">
            <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the vaccine record for "<strong>{currentRecord.vaccine_used}</strong>" on {currentRecord.date_of_vaccination}? This action cannot be undone.
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

export default PetVaccineCardPage;
