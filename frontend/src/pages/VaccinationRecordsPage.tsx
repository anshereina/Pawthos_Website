import React, { useState, useEffect, useCallback } from 'react';
import { UserCircle, ChevronDown, CalendarClock, Upload, Search, Edit, Trash2, ArrowLeft, Plus, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import { vaccinationRecordService, VaccinationRecord, VaccinationRecordWithPet } from '../services/vaccinationRecordService';
import { petService, Pet } from '../services/petService';
import { useVaccinationEvents } from '../hooks/useVaccinationEvents';
import { VaccinationEvent } from '../services/vaccinationEventService';
import AddVaccinationEventModal from '../components/AddVaccinationEventModal';
import EditVaccinationEventModal from '../components/EditVaccinationEventModal';
import DeleteVaccinationEventModal from '../components/DeleteVaccinationEventModal';
import VaccinationDriveModal from '../components/VaccinationDriveModal';
import AddVaccinationRecordFromListModal from '../components/AddVaccinationRecordFromListModal';
import EditVaccinationRecordModal from '../components/EditVaccinationRecordModal';
import DeleteVaccinationRecordModal from '../components/DeleteVaccinationRecordModal';

const TABS = [
  { label: 'Upcoming Vaccination Events', value: 'upcoming' },
  { label: 'Vaccination Events List', value: 'all' },
  { label: 'Vaccine Records', value: 'vaccine-records' },
];

const VACCINATION_EVENTS_COLUMNS = [
  'Event Date',
  'Barangay',
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
  
  // Vaccination events hook
  const {
    events: vaccinationEvents,
    loading: eventsLoading,
    error: eventsError,
    fetchAllEvents,
    fetchUpcomingEvents,
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
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecordWithPet | null>(null);

  // Memoize fetch functions to prevent infinite re-renders
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both vaccination records and pets
      const [recordsData, petsData] = await Promise.all([
        vaccinationRecordService.getVaccinationRecordsWithPets(),
        petService.getPets()
      ]);
      
      // Combine records with pet information
      const recordsWithPets = recordsData.map(record => {
        const pet = petsData.find(p => p.id === record.pet_id);
        return {
          ...record,
          pet_name: pet?.name || 'Unknown Pet',
          pet_species: pet?.species || 'Unknown'
        };
      });
      
      setRecords(recordsWithPets);
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
    } else if (activeTab === 'upcoming') {
      fetchUpcomingEvents();
    } else if (activeTab === 'all') {
      fetchAllEvents();
    }
  }, [activeTab, fetchRecords, fetchUpcomingEvents, fetchAllEvents]);

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

  const handleBack = () => {
    router.navigate({ to: '/records' });
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
      // Refetch data
      if (activeTab === 'upcoming') {
        fetchUpcomingEvents();
      } else if (activeTab === 'all') {
        fetchAllEvents();
      }
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
      // Refetch data
      if (activeTab === 'upcoming') {
        fetchUpcomingEvents();
      } else if (activeTab === 'all') {
        fetchAllEvents();
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    try {
      await deleteEvent(selectedEvent.id);
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
      // Refetch data
      if (activeTab === 'upcoming') {
        fetchUpcomingEvents();
      } else if (activeTab === 'all') {
        fetchAllEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
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
      // Refetch records
      fetchRecords();
    } catch (error) {
      console.error('Error adding vaccination record:', error);
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

  const currentData = getCurrentData();
  const isLoading = getCurrentLoading();
  const currentError = getCurrentError();

  return (
    <div className="flex h-screen bg-gray-50 font-inter">
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
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className="text-green-800 hover:text-green-900 p-1 mr-1"
              onClick={handleBack}
              aria-label="Back to Records"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Vaccination Records</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Top Control Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              {/* Tabs */}
              <div className="flex space-x-1">
                {TABS.map(tab => (
                  <button
                    key={tab.value}
                    className={`px-3 py-1 text-sm rounded-md font-medium transition-colors duration-200 ${
                      activeTab === tab.value
                        ? 'bg-green-800 text-white'
                        : 'bg-white text-green-800 border border-green-800 hover:bg-green-50'
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
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search here"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {/* Schedule New Vaccination Button - only show for events tabs */}
                {(activeTab === 'upcoming' || activeTab === 'all') && (
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                  >
                    <CalendarClock size={20} />
                    <span>Schedule New Vaccination</span>
                  </button>
                )}
                {/* Add Record Button - only show in 'vaccine-records' tab */}
                {activeTab === 'vaccine-records' && (
                  <button 
                    onClick={() => setIsAddRecordModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                  >
                    <Plus size={20} />
                    <span>Add Record</span>
                  </button>
                )}
                {/* Export Button */}
                <button className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  <Upload size={20} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'vaccine-records' ? (
            <div className="space-y-4">
              {/* Filter Buttons */}
              <div className="bg-white rounded-lg shadow-md p-4">
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading ? (
                <div className="p-6 text-center">Loading...</div>
              ) : error ? (
                <div className="p-6 text-center text-red-600">{error}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-green-800 text-white">
                    <tr>
                      {VACCINE_RECORDS_COLUMNS.map(col => (
                        <th key={col} className="px-6 py-4 text-left font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr><td colSpan={VACCINE_RECORDS_COLUMNS.length} className="px-6 py-4 text-center">No vaccine records found.</td></tr>
                    ) : (
                      records
                        .filter(record => {
                            if (filter !== 'all' && record.pet_species !== filter) {
                              return false;
                            }
                          const searchLower = search.toLowerCase();
                          return (
                            record.pet_name?.toLowerCase().includes(searchLower) ||
                            record.vaccine_name.toLowerCase().includes(searchLower) ||
                            record.veterinarian.toLowerCase().includes(searchLower) ||
                            record.batch_lot_no?.toLowerCase().includes(searchLower)
                          );
                        })
                        .map((record, i) => (
                            <tr 
                              key={record.id} 
                              className={`${i % 2 === 0 ? 'bg-green-50' : 'bg-white'} cursor-pointer hover:bg-green-100 transition-colors`}
                              onClick={() => router.navigate({ to: `/pets/${record.pet_id}` })}
                            >
                              <td className="px-6 py-4">{record.pet_name || 'Unknown'}</td>
                              <td className="px-6 py-4">{record.pet_species || 'Unknown'}</td>
                              <td className="px-6 py-4">{record.vaccine_name}</td>
                              <td className="px-6 py-4">{record.vaccination_date}</td>
                              <td className="px-6 py-4">{record.expiration_date || '-'}</td>
                              <td className="px-6 py-4">{record.veterinarian}</td>
                              <td className="px-6 py-4">{record.batch_lot_no || '-'}</td>
                              <td className="px-6 py-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => handleEditVaccinationRecord(record)}
                                  className="p-1 rounded hover:bg-green-200 transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={18} className="text-green-800" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteVaccinationRecord(record)}
                                  className="p-1 rounded hover:bg-red-100 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} className="text-red-600" />
                                </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            </div>
          ) : (activeTab === 'upcoming' || activeTab === 'all') ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {isLoading ? (
                <div className="p-6 text-center">Loading...</div>
              ) : currentError ? (
                <div className="p-6 text-center text-red-600">{currentError}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-green-800 text-white">
                    <tr>
                      {VACCINATION_EVENTS_COLUMNS.map(col => (
                        <th key={col} className="px-6 py-4 text-left font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan={VACCINATION_EVENTS_COLUMNS.length} className="px-6 py-4 text-center text-gray-400 italic">
                          {activeTab === 'upcoming' ? 'No Upcoming Vaccination Events' : 'No Vaccination Events Found'}
                        </td>
                      </tr>
                    ) : (
                      (currentData as VaccinationEvent[])
                        .filter((event: VaccinationEvent) => {
                          const searchLower = search.toLowerCase();
                          return (
                            event.event_title?.toLowerCase().includes(searchLower) ||
                            event.barangay?.toLowerCase().includes(searchLower) ||
                            event.service_coordinator?.toLowerCase().includes(searchLower)
                          );
                        })
                        .map((event: VaccinationEvent, i: number) => (
                        <tr 
                          key={event.id} 
                          className={`${i % 2 === 0 ? 'bg-green-50' : 'bg-white'} cursor-pointer hover:bg-green-100 transition-colors`}
                          onClick={() => handleRowClick(event)}
                        >
                          <td className="px-6 py-4">{event.event_date}</td>
                          <td className="px-6 py-4">{event.barangay}</td>
                          <td className="px-6 py-4">{event.service_coordinator}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              event.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                              event.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{event.event_title}</td>
                          <td className="px-6 py-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => handleEditClick(event)}
                              className="p-1 rounded hover:bg-green-200 transition-colors"
                            >
                              <Edit size={18} className="text-green-800" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(event)}
                              className="p-1 rounded hover:bg-red-100 transition-colors"
                            >
                              <Trash2 size={18} className="text-red-600" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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