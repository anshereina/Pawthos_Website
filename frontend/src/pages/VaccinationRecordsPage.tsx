import React, { useState, useEffect, useCallback } from 'react';
import { UserCircle, ChevronDown, CalendarClock, Upload, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import { vaccinationRecordService, VaccinationRecord } from '../services/vaccinationRecordService';
import { useVaccinationEvents } from '../hooks/useVaccinationEvents';
import { VaccinationEvent } from '../services/vaccinationEventService';
import AddVaccinationEventModal from '../components/AddVaccinationEventModal';
import EditVaccinationEventModal from '../components/EditVaccinationEventModal';
import DeleteVaccinationEventModal from '../components/DeleteVaccinationEventModal';
import VaccinationDriveModal from '../components/VaccinationDriveModal';

const TABS = [
  { label: 'Upcoming Vaccination Events', value: 'upcoming' },
  { label: 'Vaccination Events List', value: 'all' },
  { label: 'Vaccine Records', value: 'vaccine-records' }, // New tab
];

const TABLE_COLUMNS = [
  'Event Date',
  'Barangay',
  'Service Coordinator',
  'Status',
  'Event Title',
  'Action',
];

const VACCINE_RECORDS_COLUMNS = [
  'Date of Vaccination',
  'Vaccine Used',
  'Batch No. / Lot No.',
  'Date of Next Vaccination',
  'Veterinarian Lic No. PTR',
  'Action',
];

const VaccinationRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  const [selectedEvent, setSelectedEvent] = useState<VaccinationEvent | null>(null);

  // Memoize fetch functions to prevent infinite re-renders
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vaccinationRecordService.getAllVaccinationRecords();
      setRecords(data);
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

  // Placeholder user info
  const user = {
    name: 'Edelyn Balberona',
    role: 'SuperAdmin',
  };

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const handleBack = () => {
    router.navigate({ to: '/records' });
  };

  // Modal handlers
  const handleAddEvent = async (eventData: any) => {
    try {
      await createEvent(eventData);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleEditEvent = async (eventData: any) => {
    if (selectedEvent) {
      try {
        await updateEvent(selectedEvent.id, eventData);
        setIsEditModalOpen(false);
        setSelectedEvent(null);
      } catch (err) {
        console.error('Failed to update event:', err);
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await deleteEvent(selectedEvent.id);
        setIsDeleteModalOpen(false);
        setSelectedEvent(null);
      } catch (err) {
        console.error('Failed to delete event:', err);
      }
    }
  };

  const handleEditClick = (event: VaccinationEvent) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (event: VaccinationEvent) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleRowClick = (event: VaccinationEvent) => {
    setSelectedEvent(event);
    setIsAntiRabiesModalOpen(true);
  };

  // Filter data based on search
  const filterEvents = (data: VaccinationEvent[]) => {
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter(event => 
      event.event_title.toLowerCase().includes(searchLower) ||
      event.barangay.toLowerCase().includes(searchLower) ||
      event.service_coordinator.toLowerCase().includes(searchLower) ||
      event.status.toLowerCase().includes(searchLower)
    );
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'upcoming' || activeTab === 'all') {
      return filterEvents(vaccinationEvents);
    }
    return [];
  };

  const currentData = getCurrentData();
  const isLoading = activeTab === 'vaccine-records' ? loading : eventsLoading;
  const currentError = activeTab === 'vaccine-records' ? error : eventsError;

  return (
    <div className="flex min-h-screen bg-gray-100 font-inter w-full">
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
                {/* Schedule New Vaccination Button - only show if not in 'vaccine-records' tab */}
                {activeTab !== 'vaccine-records' && (
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                  >
                    <CalendarClock size={20} />
                    <span>Schedule New Vaccination</span>
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
                          const searchLower = search.toLowerCase();
                          return (
                            record.vaccine_used.toLowerCase().includes(searchLower) ||
                            (record.batch_no_lot_no && record.batch_no_lot_no.toLowerCase().includes(searchLower)) ||
                            (record.veterinarian_lic_no_ptr && record.veterinarian_lic_no_ptr.toLowerCase().includes(searchLower))
                          );
                        })
                        .map((record, i) => (
                          <tr key={record.id} className={i % 2 === 0 ? 'bg-green-50' : 'bg-white'}>
                            <td className="px-6 py-4">{record.date_of_vaccination}</td>
                            <td className="px-6 py-4">{record.vaccine_used}</td>
                            <td className="px-6 py-4">{record.batch_no_lot_no}</td>
                            <td className="px-6 py-4">{record.date_of_next_vaccination || '-'}</td>
                            <td className="px-6 py-4">{record.veterinarian_lic_no_ptr}</td>
                            <td className="px-6 py-4 flex items-center gap-2">
                              <button className="p-1 rounded hover:bg-green-200 transition-colors"><Edit size={18} className="text-green-800" /></button>
                              <button className="p-1 rounded hover:bg-red-100 transition-colors"><Trash2 size={18} className="text-red-600" /></button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ) : activeTab === 'upcoming' ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {isLoading ? (
                <div className="p-6 text-center">Loading...</div>
              ) : currentError ? (
                <div className="p-6 text-center text-red-600">{currentError}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-green-800 text-white">
                    <tr>
                      {TABLE_COLUMNS.map(col => (
                        <th key={col} className="px-6 py-4 text-left font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 ? (
                      <tr><td colSpan={TABLE_COLUMNS.length} className="px-6 py-4 text-center text-gray-400 italic">No Upcoming Vaccination Events</td></tr>
                    ) : (
                      currentData.map((event, i) => (
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
          ) : activeTab === 'all' ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {isLoading ? (
                <div className="p-6 text-center">Loading...</div>
              ) : currentError ? (
                <div className="p-6 text-center text-red-600">{currentError}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-green-800 text-white">
                    <tr>
                      {TABLE_COLUMNS.map(col => (
                        <th key={col} className="px-6 py-4 text-left font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 ? (
                      <tr><td colSpan={TABLE_COLUMNS.length} className="px-6 py-4 text-center text-gray-400 italic">No Vaccination Events lists found</td></tr>
                    ) : (
                      currentData.map((event, i) => (
                        <tr key={event.id} className={i % 2 === 0 ? 'bg-green-50' : 'bg-white'}>
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
                          <td className="px-6 py-4 flex items-center gap-2">
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
    </div>
  );
};

export default VaccinationRecordsPage; 