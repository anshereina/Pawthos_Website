import React, { useState, useEffect } from 'react';
import { Search, Upload, Download, Edit, Trash2, ArrowLeft, Plus, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { useAppointments } from '../hooks/useAppointments';
import { usePets } from '../hooks/usePets';
import { medicalRecordService } from '../services/medicalRecordService';
import { appointmentService } from '../services/appointmentService';
import AddMedicalRecordModal from '../components/AddMedicalRecordModal';
import EditMedicalRecordModal from '../components/EditMedicalRecordModal';
import DeleteMedicalRecordModal from '../components/DeleteMedicalRecordModal';

import DeleteAppointmentModal from '../components/DeleteAppointmentModal';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { label: 'Upcoming Appointments', value: 'upcoming' },
  { label: 'Medical History', value: 'history' },
];

const MedicalRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isDeleteAppointmentModalOpen, setIsDeleteAppointmentModalOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);
  
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();
  
  // Fetch data from backend
  const { medicalRecords, loading: medicalRecordsLoading, error: medicalRecordsError, updateMedicalRecord, deleteMedicalRecord } = useMedicalRecords();
  const { appointments, loading: appointmentsLoading, error: appointmentsError, updateAppointment } = useAppointments();
  const { pets, loading: petsLoading, error: petsError, fetchPets } = usePets();

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const handleBack = () => {
    router.navigate({ to: '/records' });
  };

  const handleAddRecord = async (data: any) => {
    try {
      // For now, we'll use the first pet as default
      // In a real application, you'd want to add pet selection to the modal
      if (pets.length === 0) {
        alert('No pets available. Please add a pet first.');
        return;
      }
      
      const petId = pets[0].id; // Use first pet as default
      await medicalRecordService.createMedicalRecord(petId, {
        reason_for_visit: data.reasonForVisit,
        date_visited: data.dateOfVisit,
        date_of_next_visit: data.nextVisit || undefined,
        procedures_done: data.procedureDone,
        findings: data.findings,
        recommendations: data.recommendation,
        medications: data.vaccineUsedMedication,
        veterinarian: "Dr. Ma Fe Templado", // Default veterinarian
      });
      setIsAddModalOpen(false);
      // Refresh the medical records
      window.location.reload();
    } catch (error) {
      console.error('Failed to create medical record:', error);
    }
  };

  const handleEditRecord = async (data: any) => {
    try {
      await updateMedicalRecord(selectedRecord.id, {
        reason_for_visit: data.reasonForVisit,
        date_visited: data.dateOfVisit,
        date_of_next_visit: data.nextVisit || undefined,
        procedures_done: data.procedureDone,
        findings: data.findings,
        recommendations: data.recommendation,
        medications: data.vaccineUsedMedication,
        veterinarian: "Dr. Ma Fe Templado", // Default veterinarian
      });
      setIsEditModalOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Failed to update medical record:', error);
    }
  };

  const handleDeleteRecord = async () => {
    try {
      await deleteMedicalRecord(selectedRecord.id);
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Failed to delete medical record:', error);
    }
  };

  const handleEditClick = (record: any) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (record: any) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChange = async (appointment: any, newStatus: string) => {
    try {
      await updateAppointment(appointment.id, {
        pet_id: appointment.pet_id,
        type: appointment.type,
        date: appointment.date,
        time: appointment.time,
        veterinarian: appointment.veterinarian,
        notes: appointment.notes,
        status: newStatus,
      });
      setStatusDropdownOpen(null);
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };



  const handleDeleteAppointment = async () => {
    try {
      await appointmentService.deleteAppointment(selectedAppointment.id);
      setIsDeleteAppointmentModalOpen(false);
      setSelectedAppointment(null);
      // Refresh the appointments
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };



  const handleDeleteAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDeleteAppointmentModalOpen(true);
  };

  // Fetch pets on component mount
  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Close status dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest('.status-dropdown') === null) {
        setStatusDropdownOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter data based on search
  const filteredAppointments = appointments.filter(appointment => 
    appointment.pet?.name?.toLowerCase().includes(search.toLowerCase()) ||
    appointment.type?.toLowerCase().includes(search.toLowerCase()) ||
    appointment.veterinarian?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMedicalRecords = medicalRecords.filter(record => 
    record.pet?.name?.toLowerCase().includes(search.toLowerCase()) ||
    record.reason_for_visit?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const list = activeTab === 'upcoming' ? filteredAppointments : filteredMedicalRecords;
  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = list.slice(startIndex, endIndex);
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Table columns based on tab
  let columns: string[] = [];
  if (activeTab === 'upcoming') {
    columns = ['Date of Visit', 'Reason for Visit', 'Type of Species', 'Pet Name', 'Status', 'Action'];
  } else if (activeTab === 'history') {
    columns = ['Date of Visit', 'Reason for Visit', 'Type of Species', 'Pet Name', 'Next Visit', 'Action'];
  }

  const isLoading = medicalRecordsLoading || appointmentsLoading || petsLoading;

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-white font-sans w-full min-h-screen">
      <Sidebar
        items={navigationItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        isExpanded={isExpanded}
        onToggleExpand={toggleSidebar}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? 'ml-64' : 'ml-16'
        }`}
      >
        <PageHeader title="Medical Records" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Top Control Panel */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center">
              {/* Tabs */}
              <div className="flex space-x-2">
                {TABS.map(tab => (
                  <button
                    key={tab.value}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === tab.value
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                        : 'bg-white text-green-700 border border-green-300 hover:bg-green-50 hover:border-green-400'
                    }`}
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Search and Actions */}
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  <input
                    type="text"
                    placeholder="Search here"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 hover:border-green-300"
                  />
                </div>
                {/* Add Button */}
                <button 
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={20} />
                  <span className="font-semibold">Add Record</span>
                </button>
                {/* Export Button */}
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg">
                  <Upload size={20} />
                  <span className="font-semibold">Export</span>
                </button>
                {/* Import Button */}
                <button className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  <Download size={20} />
                  <span>Import</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {(medicalRecordsError || appointmentsError || petsError) && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {medicalRecordsError && <p>Medical Records Error: {medicalRecordsError}</p>}
              {appointmentsError && <p>Appointments Error: {appointmentsError}</p>}
              {petsError && <p>Pets Error: {petsError}</p>}
            </div>
          )}

          {/* Instructional Note */}
          <div className="mb-4 text-green-700 text-sm font-medium">
            Note: You can update the appointment status using the dropdown.
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {/* Data Table */}
          {!isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="px-4 py-3 text-left font-semibold text-sm">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'upcoming' && currentItems.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                        No upcoming appointments found.
                      </td>
                    </tr>
                  )}
                  {activeTab === 'history' && currentItems.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                        No medical records found.
                      </td>
                    </tr>
                  )}
                  
                  {/* Upcoming Appointments Tab */}
                  {activeTab === 'upcoming' && currentItems.map((appointment: any, i: number) => (
                    <tr
                      key={appointment.id}
                      className={`${i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
                    >
                      <td className="px-4 py-3">
                        {new Date(appointment.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{appointment.type}</td>
                      <td className="px-4 py-3 capitalize">{appointment.pet?.species || '-'}</td>
                      <td className="px-4 py-3">{appointment.pet?.name || '-'}</td>
                      <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-block relative status-dropdown">
                          <button
                            className="flex items-center space-x-1 px-3 py-1 border rounded-lg transition-colors duration-200 border-green-800 bg-white text-green-800 hover:bg-green-50"
                            onClick={() => setStatusDropdownOpen(statusDropdownOpen === appointment.id ? null : appointment.id)}
                          >
                            <span>{appointment.status || 'Pending'}</span>
                            <ChevronDown size={18} />
                          </button>
                          {statusDropdownOpen === appointment.id && (
                            <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-green-800 rounded-lg shadow-xl z-[9999]">
                              {['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'].map((option: string) => (
                                <div
                                  key={option}
                                  className="px-4 py-2 hover:bg-green-50 cursor-pointer text-green-800 whitespace-nowrap"
                                  onClick={() => handleStatusChange(appointment, option)}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm" 
                            title="Delete"
                            onClick={() => handleDeleteAppointmentClick(appointment)}
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Medical History Tab */}
                  {activeTab === 'history' && currentItems.map((record: any, i: number) => (
                    <tr
                      key={record.id}
                      className={`${i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
                    >
                      <td className="px-4 py-3">
                        {new Date(record.date_visited).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{record.reason_for_visit}</td>
                      <td className="px-4 py-3 capitalize">{record.pet?.species || '-'}</td>
                      <td className="px-4 py-3">{record.pet?.name || '-'}</td>
                      <td className="px-4 py-3">
                        {record.date_of_next_visit ? new Date(record.date_of_next_visit).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm" 
                            title="Edit"
                            onClick={() => handleEditClick(record)}
                          >
                            <Edit size={18} className="text-green-600" />
                          </button>
                          <button 
                            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm" 
                            title="Delete"
                            onClick={() => handleDeleteClick(record)}
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="bg-white px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const shouldShow = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                        if (!shouldShow) {
                          if (page === 2 && currentPage > 4) return (<span key={`ellipsis-start`} className="px-3 py-2 text-gray-400">...</span>);
                          if (page === totalPages - 1 && currentPage < totalPages - 3) return (<span key={`ellipsis-end`} className="px-3 py-2 text-gray-400">...</span>);
                          return null;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page ? 'bg-green-600 text-white' : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                          : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddMedicalRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRecord}
      />

      <EditMedicalRecordModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecord(null);
        }}
        onSubmit={handleEditRecord}
        record={selectedRecord}
      />

      <DeleteMedicalRecordModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleDeleteRecord}
        record={selectedRecord}
      />



      <DeleteAppointmentModal
        isOpen={isDeleteAppointmentModalOpen}
        onClose={() => {
          setIsDeleteAppointmentModalOpen(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleDeleteAppointment}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default MedicalRecordsPage; 