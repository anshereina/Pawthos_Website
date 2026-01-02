import React, { useState, useEffect, useCallback } from 'react';
import { UserCircle, ChevronDown, CalendarClock, Search, Edit, Trash2, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { vaccinationRecordService, VaccinationRecord, VaccinationRecordWithPet } from '../services/vaccinationRecordService';
import { petService, Pet } from '../services/petService';
import { useVaccinationEvents } from '../hooks/useVaccinationEvents';
import { VaccinationEvent } from '../services/vaccinationEventService';
import { vaccinationDriveService } from '../services/vaccinationDriveService';
import AddVaccinationEventModal from '../components/AddVaccinationEventModal';
import EditVaccinationEventModal from '../components/EditVaccinationEventModal';
import DeleteVaccinationEventModal from '../components/DeleteVaccinationEventModal';
import VaccinationDriveModal from '../components/VaccinationDriveModal';
import AddVaccinationRecordFromListModal from '../components/AddVaccinationRecordFromListModal';
import EditVaccinationRecordModal from '../components/EditVaccinationRecordModal';
import DeleteVaccinationRecordModal from '../components/DeleteVaccinationRecordModal';
import ViewVaccinationRecordModal from '../components/ViewVaccinationRecordModal';

const TABS = [
  { label: 'Upcoming Vaccination Events', value: 'upcoming' },
  { label: 'Vaccination Events List', value: 'all' },
  { label: 'Vaccine Records', value: 'vaccine-records' },
];

const VACCINATION_EVENTS_COLUMNS = [
  'Event Date',
  'Subdivision/Barangay',
  'Service Coordinator',
  'Status',
  'Event Title',
  'Action',
];

const VACCINE_RECORDS_COLUMNS = [
  'Pet Name',
  'Species',
  'Vaccine Name',
  'Vaccination Date',
  'Next Vaccination Date',
  'Veterinarian',
  'Batch/Lot No.',
  'Action',
];

const VaccinationRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();
  const [records, setRecords] = useState<VaccinationRecordWithPet[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'feline' | 'canine'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Vaccination events hook
  const {
    events: vaccinationEvents,
    loading: eventsLoading,
    error: eventsError,
    fetchAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useVaccinationEvents();
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAntiRabiesModalOpen, setIsAntiRabiesModalOpen] = useState(false);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<VaccinationEvent | null>(null);
  
  // Vaccination record edit/delete states
  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
  const [isDeleteRecordModalOpen, setIsDeleteRecordModalOpen] = useState(false);
  const [isViewRecordModalOpen, setIsViewRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecordWithPet | null>(null);

  // Memoize fetch functions to prevent infinite re-renders
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch vaccination records with pet information (now includes all pet data)
      const recordsData = await vaccinationRecordService.getVaccinationRecordsWithPets();
      
      // Also fetch pets for the add record modal
      const petsData = await petService.getPets();
      
      setRecords(recordsData);
      setPets(petsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'vaccine-records') {
      fetchRecords();
    } else {
      // For both 'upcoming' and 'all' tabs, fetch all events and filter by status on frontend
      fetchAllEvents();
    }
  }, [activeTab, fetchRecords, fetchAllEvents]);

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'vaccine-records') {
      return records;
    }
    return vaccinationEvents;
  };

  const getCurrentLoading = () => {
    if (activeTab === 'vaccine-records') {
      return loading;
    }
    return eventsLoading;
  };

  const getCurrentError = () => {
    if (activeTab === 'vaccine-records') {
      return error;
    }
    return eventsError;
  };


  const handleItemClick = (item: string) => {
    router.navigate({ to: `/${item.toLowerCase().replace(' ', '-')}` });
  };

  const handleRowClick = (event: VaccinationEvent) => {
    setSelectedEvent(event);
    setIsAntiRabiesModalOpen(true);
  };

  const handleEditClick = (event: VaccinationEvent) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (event: VaccinationEvent) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleAddEvent = async (eventData: any) => {
    try {
      await createEvent(eventData);
      setIsAddModalOpen(false);
      // Refetch data for both upcoming and all tabs
      fetchAllEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleEditEvent = async (eventData: any) => {
    if (!selectedEvent) return;
    try {
      await updateEvent(selectedEvent.id, eventData);
      setIsEditModalOpen(false);
      setSelectedEvent(null);
      // Refetch data for both upcoming and all tabs
      fetchAllEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      // First, try to delete vaccination drives associated with this event
      try {
        await vaccinationDriveService.deleteVaccinationDrivesByEvent(selectedEvent.id);
      } catch (driveError) {
        // If there are no vaccination drives, this is fine - continue with event deletion
        console.log('No vaccination drives to delete for this event');
      }
      
      // Then delete the vaccination event
      await deleteEvent(selectedEvent.id);
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
      // Refetch data for both upcoming and all tabs
      fetchAllEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      
      // Check if it's a 400 error (foreign key constraint)
      if (error?.response?.status === 400) {
        const errorMessage = error.response?.data?.detail || 'Cannot delete this vaccination event';
        alert(`Error: ${errorMessage}`);
      } else {
        alert('An error occurred while deleting the vaccination event. Please try again.');
      }
    }
  };

  const handleAddVaccinationRecord = async (recordData: any) => {
    try {
      // Map the form data to the API format
      const mappedData = {
        pet_id: parseInt(recordData.petId),
        vaccine_name: recordData.vaccineName,
        vaccination_date: recordData.vaccinationDate,
        expiration_date: recordData.expirationDate || null, // Map next vaccination date to expiration_date
        veterinarian: recordData.veterinarian,
        batch_lot_no: recordData.batchLotNo,
      };
      
      await vaccinationRecordService.createVaccinationRecord(parseInt(recordData.petId), mappedData);
      setIsAddRecordModalOpen(false);
      // Refetch records with a small delay to ensure backend has processed the request
      setTimeout(() => {
        fetchRecords();
      }, 500);
    } catch (error) {
      console.error('Error adding vaccination record:', error);
      alert(error instanceof Error ? error.message : 'Failed to add vaccination record. Please try again.');
    }
  };

  const handleEditVaccinationRecord = (record: VaccinationRecordWithPet) => {
    setSelectedRecord(record);
    setIsEditRecordModalOpen(true);
  };

  const handleUpdateVaccinationRecord = async (recordId: number, recordData: any) => {
    try {
      // Map the form data to the API format
      const mappedData = {
        vaccine_name: recordData.vaccineName,
        vaccination_date: recordData.vaccinationDate,
        expiration_date: recordData.expirationDate || null,
        veterinarian: recordData.veterinarian,
        batch_lot_no: recordData.batchLotNo,
      };
      
      await vaccinationRecordService.updateVaccinationRecord(recordId, mappedData);
      setIsEditRecordModalOpen(false);
      setSelectedRecord(null);
      // Refetch records
      fetchRecords();
    } catch (error) {
      console.error('Error updating vaccination record:', error);
    }
  };

  const handleDeleteVaccinationRecord = (record: VaccinationRecordWithPet) => {
    setSelectedRecord(record);
    setIsDeleteRecordModalOpen(true);
  };

  const handleViewVaccinationRecord = (record: VaccinationRecordWithPet) => {
    setSelectedRecord(record);
    setIsViewRecordModalOpen(true);
  };

  const handleConfirmDeleteVaccinationRecord = async () => {
    if (!selectedRecord) return;
    
    try {
      await vaccinationRecordService.deleteVaccinationRecord(selectedRecord.id);
      setIsDeleteRecordModalOpen(false);
      setSelectedRecord(null);
      // Refetch records
      fetchRecords();
    } catch (error) {
      console.error('Error deleting vaccination record:', error);
    }
  };

  // Reset to first page when tab, search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, filter]);

  const isLoading = getCurrentLoading();
  const currentError = getCurrentError();

  // Build filtered arrays per tab for pagination
  const vaccineRecordsFiltered = records.filter(record => {
    if (activeTab !== 'vaccine-records') return false;
    if (filter !== 'all' && record.pet_species !== filter) return false;
    const searchLower = search.toLowerCase();
    return (
      record.pet_name?.toLowerCase().includes(searchLower) ||
      record.vaccine_name.toLowerCase().includes(searchLower) ||
      record.veterinarian.toLowerCase().includes(searchLower) ||
      record.batch_lot_no?.toLowerCase().includes(searchLower)
    );
  });

  const eventsFiltered = (activeTab === 'upcoming' || activeTab === 'all' ? vaccinationEvents : []).filter((event: VaccinationEvent) => {
    // Filter by status based on active tab
    if (activeTab === 'upcoming') {
      // Only show 'Scheduled' and 'Confirmed' events in upcoming tab
      if (event.status !== 'Scheduled' && event.status !== 'Confirmed') {
        return false;
      }
    } else if (activeTab === 'all') {
      // Only show 'Completed' and 'Cancelled' events in Vaccination Events List tab
      if (event.status !== 'Completed' && event.status !== 'Cancelled') {
        return false;
      }
    }
    
    // Apply search filter
    const searchLower = search.toLowerCase();
    return (
      event.event_title?.toLowerCase().includes(searchLower) ||
      event.barangay?.toLowerCase().includes(searchLower) ||
      event.service_coordinator?.toLowerCase().includes(searchLower)
    );
  });

  const isVaccineTab = activeTab === 'vaccine-records';
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalItems = isVaccineTab ? vaccineRecordsFiltered.length : eventsFiltered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentRecordsPage: VaccinationRecordWithPet[] = isVaccineTab
    ? vaccineRecordsFiltered.slice(startIndex, endIndex)
    : [];
  const currentEventsPage: VaccinationEvent[] = !isVaccineTab
    ? eventsFiltered.slice(startIndex, endIndex)
    : [];

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

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
        <PageHeader title="Vaccination Records" />

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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.value
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow'
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
                {/* Schedule New Vaccination Button - only show for events tabs */}
                {(activeTab === 'upcoming' || activeTab === 'all') && (
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow"
                  >
                    <CalendarClock size={16} />
                    <span>Schedule New Vaccination</span>
                  </button>
                )}
                {/* Add Record Button - only show in 'vaccine-records' tab */}
                {activeTab === 'vaccine-records' && (
                  <button 
                    onClick={() => setIsAddRecordModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow"
                  >
                    <Plus size={16} />
                    <span>Add Record</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Instructional Note */}
          <div className="mb-4 text-green-700 text-sm font-medium">
            Note: You can view the details by clicking the row.
          </div>

          {/* Tab Content */}
          {activeTab === 'vaccine-records' ? (
            <div className="space-y-4">
              {/* Filter Buttons */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Filter by:</span>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-green-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({records.length})
                  </button>
                  <button
                    onClick={() => setFilter('feline')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === 'feline'
                        ? 'bg-green-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cats ({records.filter(r => r.pet_species === 'feline').length})
                  </button>
                  <button
                    onClick={() => setFilter('canine')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === 'canine'
                        ? 'bg-green-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Dogs ({records.filter(r => r.pet_species === 'canine').length})
                  </button>
                </div>
              </div>
              
              {/* Records Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
              {loading ? (
                <div className="p-6 text-center">Loading...</div>
              ) : error ? (
                <div className="p-6 text-center text-red-600">{error}</div>
              ) : (
                <>
                <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
                  <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                    <tr>
                      {VACCINE_RECORDS_COLUMNS.map(col => (
                        <th key={col} className="px-4 py-3 text-left font-semibold text-sm">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={VACCINE_RECORDS_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">Loading records...</td></tr>
                    ) : error ? (
                      <tr><td colSpan={VACCINE_RECORDS_COLUMNS.length} className="px-4 py-8 text-center text-red-600">{error}</td></tr>
                    ) : currentRecordsPage.length === 0 ? (
                      <tr><td colSpan={VACCINE_RECORDS_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">No vaccine records found.</td></tr>
                    ) : (
                      currentRecordsPage
                        .map((record: VaccinationRecordWithPet, i: number) => {
                          // Get date values (handle both field name variants)
                          const vaccinationDate = record.date_given || record.vaccination_date;
                          const nextDueDate = record.next_due_date || record.expiration_date;
                          
                          const formatDate = (dateString?: string | null) => {
                            if (!dateString) return '-';
                            try {
                              return new Date(dateString).toLocaleDateString();
                            } catch {
                              return '-';
                            }
                          };
                          
                          return (
                            <tr 
                              key={record.id} 
                              onClick={() => handleViewVaccinationRecord(record)}
                              className={`${i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100 cursor-pointer`}
                            >
                              <td className="px-4 py-3">{record.pet_name || 'Unknown'}</td>
                              <td className="px-4 py-3 capitalize">{record.pet_species || 'Unknown'}</td>
                              <td className="px-4 py-3">{record.vaccine_name}</td>
                              <td className="px-4 py-3">{formatDate(vaccinationDate)}</td>
                              <td className="px-4 py-3">{formatDate(nextDueDate)}</td>
                              <td className="px-4 py-3">{record.veterinarian}</td>
                              <td className="px-4 py-3">{record.batch_lot_no || '-'}</td>
                              <td className="px-4 py-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => handleEditVaccinationRecord(record)}
                                  className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300"
                                  title="Edit"
                                >
                                  <Edit size={16} className="text-green-600" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteVaccinationRecord(record)}
                                  className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300"
                                  title="Delete"
                                >
                                  <Trash2 size={16} className="text-red-600" />
                                </button>
                            </td>
                          </tr>
                          );
                        })
                    )}
                  </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                {activeTab === 'vaccine-records' && totalPages > 1 && (
                  <div className="bg-white px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreviousPage()}
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
                        onClick={() => handleNextPage()}
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
                </>
              )}
            </div>
            </div>
          ) : (activeTab === 'upcoming' || activeTab === 'all') ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
              {isLoading ? (
                <div className="p-6 text-center">Loading...</div>
              ) : currentError ? (
                <div className="p-6 text-center text-red-600">{currentError}</div>
              ) : (
                <>
                <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
                  <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                    <tr>
                      {VACCINATION_EVENTS_COLUMNS.map(col => (
                        <th key={col} className="px-4 py-3 text-left font-semibold text-sm">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={VACCINATION_EVENTS_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">Loading events...</td>
                      </tr>
                    ) : currentError ? (
                      <tr>
                        <td colSpan={VACCINATION_EVENTS_COLUMNS.length} className="px-4 py-8 text-center text-red-600">{currentError}</td>
                      </tr>
                    ) : eventsFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={VACCINATION_EVENTS_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">
                          {activeTab === 'upcoming' ? 'No Upcoming Vaccination Events' : 'No Vaccination Events Found'}
                        </td>
                      </tr>
                    ) : (
                      currentEventsPage
                        .map((event: VaccinationEvent, i: number) => (
                        <tr 
                          key={event.id} 
                          className={`${i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100 cursor-pointer`}
                          onClick={() => handleRowClick(event)}
                        >
                          <td className="px-4 py-3">{event.event_date}</td>
                          <td className="px-4 py-3">{event.barangay}</td>
                          <td className="px-4 py-3">{event.service_coordinator}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              event.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                              event.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{event.event_title}</td>
                          <td className="px-4 py-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => handleEditClick(event)}
                              className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300"
                              title="Edit"
                            >
                              <Edit size={16} className="text-green-600" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(event)}
                              className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                {(activeTab === 'upcoming' || activeTab === 'all') && totalPages > 1 && (
                  <div className="bg-white px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreviousPage()}
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
                        onClick={() => handleNextPage()}
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
                </>
              )}
            </div>
          ) : null}
        </main>
      </div>

      {/* Modals */}
      <AddVaccinationEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEvent}
      />
      
      <EditVaccinationEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditEvent}
        event={selectedEvent}
      />
      
      <DeleteVaccinationEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEvent}
        event={selectedEvent}
      />
      
      <VaccinationDriveModal
        isOpen={isAntiRabiesModalOpen}
        onClose={() => setIsAntiRabiesModalOpen(false)}
        event={selectedEvent}
        readOnly={activeTab === 'all'} // Read-only for Vaccination Events List tab
      />
      
      <AddVaccinationRecordFromListModal
        isOpen={isAddRecordModalOpen}
        onClose={() => setIsAddRecordModalOpen(false)}
        onSubmit={handleAddVaccinationRecord}
        pets={pets}
      />
      
      {/* Vaccination Record Edit Modal */}
      {selectedRecord && (
        <EditVaccinationRecordModal
          isOpen={isEditRecordModalOpen}
          onClose={() => {
            setIsEditRecordModalOpen(false);
            setSelectedRecord(null);
          }}
          onSubmit={(data) => handleUpdateVaccinationRecord(selectedRecord.id, data)}
          record={selectedRecord}
        />
      )}
      
      {/* Vaccination Record View Modal */}
      <ViewVaccinationRecordModal
        isOpen={isViewRecordModalOpen}
        onClose={() => {
          setIsViewRecordModalOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />

      {/* Vaccination Record Delete Modal */}
      {selectedRecord && (
        <DeleteVaccinationRecordModal
          isOpen={isDeleteRecordModalOpen}
          onClose={() => {
            setIsDeleteRecordModalOpen(false);
            setSelectedRecord(null);
          }}
          onConfirm={handleConfirmDeleteVaccinationRecord}
          record={selectedRecord}
        />
      )}
    </div>
  );
};

export default VaccinationRecordsPage; 