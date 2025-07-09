// src/pages/PetMedicalHistoryPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, PlusCircle, Edit, Trash2, XCircle, AlertTriangle, Search } from 'lucide-react';

// Define the structure for a single medical record
interface MedicalRecord {
  id: number;
  pet_id: number;
  reason_for_visit: string;
  date_of_visit: string; //YYYY-MM-DD
  next_visit: string | null; //YYYY-MM-DD, nullable
  procedure_done: string | null; // Nullable
  findings: string | null; // Nullable
  recommendation: string | null; // Nullable
  vaccine_used_medication: string | null; // Nullable
}

// Define props for PetMedicalHistoryPage
interface PetMedicalHistoryPageProps {
  petId: number;
  petName: string;
  loggedInUserRole: string;
  onBackToProfile: () => void; // Callback to go back to Pet Profile
}

const PetMedicalHistoryPage: React.FC<PetMedicalHistoryPageProps> = ({ petId, petName, loggedInUserRole, onBackToProfile }) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // State for Add/Edit Modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MedicalRecord | null>(null); // For editing or deleting

  // Form states
  const [formReasonForVisit, setFormReasonForVisit] = useState('');
  const [formDateOfVisit, setFormDateOfVisit] = useState('');
  const [formNextVisit, setFormNextVisit] = useState('');
  const [formProcedureDone, setFormProcedureDone] = useState('');
  const [formFindings, setFormFindings] = useState('');
  const [formRecommendation, setFormRecommendation] = useState('');
  const [formVaccineUsedMedication, setFormVaccineUsedMedication] = useState('');

  // --- API Calls ---
  const fetchMedicalRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/api/pets/${petId}/medical-records`, {
        headers: {
          'X-User-Role': loggedInUserRole, // Send user role for authorization
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMedicalRecords(data.medicalRecords);
    } catch (err: any) {
      console.error('Failed to fetch medical records:', err);
      setError(`Failed to load medical records: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [petId, loggedInUserRole]);

  // Effect to fetch medical records on component mount or petId/userRole change
  useEffect(() => {
    fetchMedicalRecords();
  }, [fetchMedicalRecords]);

  // Effect to filter medical records whenever medicalRecords or searchTerm changes
  useEffect(() => {
    let currentRecords = [...medicalRecords];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentRecords = currentRecords.filter(record =>
        record.reason_for_visit.toLowerCase().includes(lowerCaseSearchTerm) ||
        record.date_of_visit.includes(lowerCaseSearchTerm) ||
        (record.procedure_done && record.procedure_done.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (record.findings && record.findings.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (record.recommendation && record.recommendation.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (record.vaccine_used_medication && record.vaccine_used_medication.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    setFilteredRecords(currentRecords);
  }, [medicalRecords, searchTerm]);

  // --- Modal Control Functions ---
  const openAddModal = () => {
    setCurrentRecord(null); // Clear for add operation
    setFormReasonForVisit('');
    setFormDateOfVisit('');
    setFormNextVisit('');
    setFormProcedureDone('');
    setFormFindings('');
    setFormRecommendation('');
    setFormVaccineUsedMedication('');
    setMessage(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (record: MedicalRecord) => {
    setCurrentRecord(record);
    setFormReasonForVisit(record.reason_for_visit);
    setFormDateOfVisit(record.date_of_visit);
    setFormNextVisit(record.next_visit || '');
    setFormProcedureDone(record.procedure_done || '');
    setFormFindings(record.findings || '');
    setFormRecommendation(record.recommendation || '');
    setFormVaccineUsedMedication(record.vaccine_used_medication || '');
    setMessage(null);
    setIsAddEditModalOpen(true);
  };

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setCurrentRecord(null);
    setMessage(null); // Clear message on modal close
  };

  const openDeleteModal = (record: MedicalRecord) => {
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

    // Basic validation for required fields (as per server.ts)
    if (!formReasonForVisit || !formDateOfVisit || !formFindings || !formRecommendation || !formVaccineUsedMedication) {
      setMessage('Please fill in all required fields: Reason for Visit, Date of Visit, Findings, Recommendation, and Medicine/Vaccine Used.');
      return;
    }

    const recordData = {
      reason_for_visit: formReasonForVisit,
      date_of_visit: formDateOfVisit,
      next_visit: formNextVisit || null,
      procedure_done: formProcedureDone || null,
      findings: formFindings || null,
      recommendation: formRecommendation || null,
      vaccine_used_medication: formVaccineUsedMedication || null,
    };

    setLoading(true); // Start loading for API call
    try {
      let response;
      if (currentRecord) {
        // Update existing record
        response = await fetch(`http://localhost:5001/api/medical-records/${currentRecord.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Role': loggedInUserRole,
          },
          body: JSON.stringify(recordData),
        });
      } else {
        // Add new record
        response = await fetch(`http://localhost:5001/api/pets/${petId}/medical-records`, {
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

      setMessage(`Medical record ${currentRecord ? 'updated' : 'added'} successfully!`);
      fetchMedicalRecords(); // Re-fetch all records to update the table
      closeAddEditModal();
    } catch (err: any) {
      console.error(`Error ${currentRecord ? 'updating' : 'adding'} medical record:`, err);
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
      const response = await fetch(`http://localhost:5001/api/medical-records/${currentRecord.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': loggedInUserRole,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setMessage('Medical record deleted successfully!');
      fetchMedicalRecords(); // Re-fetch all records to update the table
      closeDeleteModal();
    } catch (err: any) {
      console.error('Error deleting medical record:', err);
      setMessage(`Failed to delete record: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading medical history...</div>;
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
        <h2 className="text-2xl font-bold text-gray-800">Medical History for {petName}</h2>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message}
        </div>
      )}

      {/* Controls: Search and Add New Medical Record */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search medical records"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Add New Medical Record Button */}
        <button
          onClick={openAddModal}
          className="flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-md"
        >
          <PlusCircle size={20} className="mr-2" /> Add New Medical Record
        </button>
      </div>

      {/* Medical Records Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Reason for Visit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Date of Visit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Next Visit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Procedure Done
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Findings
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Recommendations
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Medicine/Vaccine Used
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
                    {record.reason_for_visit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date_of_visit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.next_visit || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.procedure_done || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.findings || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.recommendation || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.vaccine_used_medication || 'N/A'}
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
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No medical records found for {petName}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Add/Edit Medical Record Modal --- */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 p-8 rounded-lg shadow-xl w-full max-w-2xl text-white"> {/* Increased max-w to 2xl */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{currentRecord ? 'Edit Medical Record' : 'Add New Medical Record'}</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Two columns on medium screens and up */}
                {/* Left Column Fields */}
                <div className="space-y-4">
                  {/* Findings */}
                  <div>
                    <label htmlFor="findings" className="block text-sm font-bold mb-2">
                      Findings:
                    </label>
                    <textarea
                      id="findings"
                      value={formFindings}
                      onChange={(e) => setFormFindings(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400 h-28" // Adjusted height
                      required
                    ></textarea>
                  </div>
                  {/* Recommendations */}
                  <div>
                    <label htmlFor="recommendation" className="block text-sm font-bold mb-2">
                      Recommendations:
                    </label>
                    <textarea
                      id="recommendation"
                      value={formRecommendation}
                      onChange={(e) => setFormRecommendation(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400 h-28" // Adjusted height
                      required
                    ></textarea>
                  </div>
                  {/* Medicine/Vaccine Used */}
                  <div>
                    <label htmlFor="vaccineUsedMedication" className="block text-sm font-bold mb-2">
                      Medicine/Vaccine Used:
                    </label>
                    <input
                      type="text"
                      id="vaccineUsedMedication"
                      value={formVaccineUsedMedication}
                      onChange={(e) => setFormVaccineUsedMedication(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                </div>

                {/* Right Column Fields */}
                <div className="space-y-4">
                  {/* Reason for Visit */}
                  <div>
                    <label htmlFor="reasonForVisit" className="block text-sm font-bold mb-2">
                      Reason for Visit:
                    </label>
                    <input
                      type="text"
                      id="reasonForVisit"
                      value={formReasonForVisit}
                      onChange={(e) => setFormReasonForVisit(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Date of Visit */}
                  <div>
                    <label htmlFor="dateOfVisit" className="block text-sm font-bold mb-2">
                      Date of Visit:
                    </label>
                    <input
                      type="date"
                      id="dateOfVisit"
                      value={formDateOfVisit}
                      onChange={(e) => setFormDateOfVisit(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  {/* Next Visit (if applicable) */}
                  <div>
                    <label htmlFor="nextVisit" className="block text-sm font-bold mb-2">
                      Next Visit (if applicable):
                    </label>
                    <input
                      type="date"
                      id="nextVisit"
                      value={formNextVisit}
                      onChange={(e) => setFormNextVisit(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  {/* Procedure Done */}
                  <div>
                    <label htmlFor="procedureDone" className="block text-sm font-bold mb-2">
                      Procedure Done:
                    </label>
                    <input
                      type="text"
                      id="procedureDone"
                      value={formProcedureDone}
                      onChange={(e) => setFormProcedureDone(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-900 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    />
                  </div>
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
              Are you sure you want to delete the medical record for "<strong>{currentRecord.reason_for_visit}</strong>" on {currentRecord.date_of_visit}? This action cannot be undone.
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

export default PetMedicalHistoryPage;
