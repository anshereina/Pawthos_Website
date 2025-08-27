import React, { useState } from 'react';
import { Search, Filter, Upload, Trash2, ChevronDown, UserCircle, User, Settings, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '@tanstack/react-router';
import { useAppointments, useServiceRequests } from '../hooks/useAppointments';
import LoadingSpinner from '../components/LoadingSpinner';
import AppointmentDetailsModal from '../components/AppointmentDetailsModal';
import AppointmentStatusModal from '../components/AppointmentStatusModal';
import { Appointment, ServiceRequest } from '../services/appointmentService';

const TABS = [
  { label: 'Appointments', value: 'appointments' },
  { label: 'History', value: 'history' },
];

const STATUS_OPTIONS: string[] = ['Pending', 'Approved', 'Completed', 'Rescheduled', 'Rejected'];

const AppointmentsPage: React.FC = () => {
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('appointments');
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Appointment | ServiceRequest | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'appointment' | 'request'>('appointment');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'Pending' | 'Approved' | 'Completed' | 'Rescheduled' | 'Rejected'>('Pending');
  const [selectedItemForStatus, setSelectedItemForStatus] = useState<{id: number, type: 'appointment' | 'request'} | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  // Use real data hooks
  const { 
    appointments, 
    loading: appointmentsLoading, 
    error: appointmentsError,
    updateAppointment,
    deleteAppointment,
    fetchAppointments
  } = useAppointments();
  
  const { 
    serviceRequests, 
    loading: requestsLoading, 
    error: requestsError,
    updateServiceRequest,
    deleteServiceRequest,
    fetchServiceRequests
  } = useServiceRequests();

  React.useEffect(() => {
    if (user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        target.closest('.user-info-area') === null &&
        target.closest('.user-dropdown-menu') === null
      ) {
        setIsDropdownOpen(false);
      }
      // Close status dropdown when clicking outside
      if (target.closest('.status-dropdown') === null) {
        setStatusDropdownOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search with debouncing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'appointments') {
        fetchAppointments({ search });
      } else if (activeTab === 'request') {
        fetchServiceRequests({ search });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, activeTab, fetchAppointments, fetchServiceRequests]);

  if (user === undefined) {
    return <div>Loading...</div>;
  }
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleStatusChange = async (id: number, newStatus: string, type: 'appointment' | 'request') => {
    try {
      if (type === 'appointment') {
        await updateAppointment(id, { status: newStatus });
      } else {
        await updateServiceRequest(id, { status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
    setStatusDropdownOpen(null);
  };

  const handleDelete = async (id: number, type: 'appointment' | 'request') => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'appointment') {
          await deleteAppointment(id);
        } else {
          await deleteServiceRequest(id);
        }
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const handleRowClick = (item: Appointment | ServiceRequest, type: 'appointment' | 'request') => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedItem(null);
  };

  const openStatusModal = (status: 'Pending' | 'Approved' | 'Completed' | 'Rescheduled' | 'Rejected', itemId: number, type: 'appointment' | 'request') => {
    setSelectedStatus(status);
    setSelectedItemForStatus({ id: itemId, type });
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setSelectedItemForStatus(null);
  };

  const handleStatusUpdate = async (appointmentId: number, status: string, remarks: string, newDateTime?: string) => {
    setStatusUpdateLoading(true);
    try {
      if (selectedItemForStatus?.type === 'appointment') {
        await updateAppointment(appointmentId, { 
          status, 
          notes: remarks,
          ...(newDateTime && status === 'Rescheduled' && {
            date: newDateTime.split('T')[0],
            time: newDateTime.split('T')[1]
          })
        });
      } else {
        await updateServiceRequest(appointmentId, { 
          status, 
          notes: remarks 
        });
      }
      closeStatusModal();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'appointments':
        return appointments;
      case 'request':
        return serviceRequests;
      case 'history':
        // Filter completed appointments and requests
        const completedAppointments = appointments.filter(apt => apt.status === 'Completed');
        const completedRequests = serviceRequests.filter(req => req.status === 'Completed');
        return [...completedAppointments, ...completedRequests];
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  const isLoading = appointmentsLoading || requestsLoading;

  // Table columns based on tab
  let columns: string[] = [];
  if (activeTab === 'appointments') {
    columns = ['Appointment ID', 'Client Name', 'Pet Name', 'Service Type', 'Date & Time', 'Status', 'Action'];
  } else if (activeTab === 'request') {
    columns = ['Request ID', 'Client Name', 'Request Service/s', 'Request Details', 'Date & Time', 'Status', 'Action'];
  } else if (activeTab === 'history') {
    columns = ['ID', 'Client Name', 'Service Rendered', 'Date Completed', 'Handled by', 'Remarks', 'Status', 'Action'];
  }

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
          <h1 className="text-2xl font-bold text-gray-800">Appointment</h1>
          <div className="relative flex items-center space-x-4 user-info-area">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleDropdown}>
              <UserCircle size={28} className="text-gray-600" />
              <div className="flex flex-col items-start">
                <span className="text-gray-800 font-medium">{user?.name || ''}</span>
                <span className="text-gray-500 text-sm">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</span>
              </div>
              <ChevronDown size={20} className="text-gray-500" />
            </div>
            {isDropdownOpen && (
              <div className="user-dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 top-full">
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}>
                  <User size={16} className="mr-2" /> Profile
                </button>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}>
                  <Settings size={16} className="mr-2" /> Account Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => { logout(); setIsDropdownOpen(false); }}>
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Top Control Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              {/* Tabs */}
              <div className="flex space-x-2">
                {TABS.map(tab => (
                  <button
                    key={tab.value}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
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
                {/* Filter Button */}
                <button className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  <Filter size={20} />
                  <span>Filter</span>
                </button>
                {/* Export Button */}
                <button className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  <Upload size={20} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {(appointmentsError || requestsError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{appointmentsError || requestsError}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {/* Appointments & Requests Table */}
          {!isLoading && (
            <div className="bg-white rounded-lg shadow-md">
              <table className="w-full">
                <thead className="bg-green-800 text-white">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="px-6 py-4 text-left font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                        No {activeTab} found
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item: any, i: number) => (
                      <tr
                        key={item.id}
                        className={`${i % 2 === 0 ? 'bg-green-50' : 'bg-white'} cursor-pointer hover:bg-green-100 transition-colors duration-200`}
                        onClick={() => handleRowClick(item, activeTab === 'appointments' ? 'appointment' : 'request')}
                      >
                        {/* Appointments Tab */}
                        {activeTab === 'appointments' && (
                          <>
                            <td className="px-6 py-4">{item.id}</td>
                            <td className="px-6 py-4">{item.client_name || item.user?.name || item.pet?.owner_name || '-'}</td>
                            <td className="px-6 py-4">{item.pet?.name || '-'}</td>
                            <td className="px-6 py-4">{item.type}</td>
                            <td className="px-6 py-4">{item.date} {item.time}</td>
                            <td className="px-6 py-4 relative" onClick={(e) => e.stopPropagation()}>
                              <div className="inline-block relative status-dropdown">
                                <button
                                  className="flex items-center space-x-1 px-3 py-1 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                                  onClick={() => setStatusDropdownOpen(statusDropdownOpen === item.id ? null : item.id)}
                                >
                                  <span>{item.status || 'Pending'}</span>
                                  <ChevronDown size={18} />
                                </button>
                                {statusDropdownOpen === item.id && (
                                  <div className="absolute left-0 mt-1 w-full bg-white border border-green-800 rounded-lg shadow-lg z-50 min-w-max">
                                    {STATUS_OPTIONS.map((option: string) => (
                                      <div
                                        key={option}
                                        className="px-4 py-2 hover:bg-green-50 cursor-pointer text-green-800 whitespace-nowrap"
                                        onClick={() => {
                                          setStatusDropdownOpen(null);
                                          openStatusModal(option as any, item.id, 'appointment');
                                        }}
                                      >
                                        {option}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="p-1 rounded hover:bg-red-100 transition-colors"
                                onClick={() => handleDelete(item.id, 'appointment')}
                              >
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </td>
                          </>
                        )}
                        {/* Request Tab */}
                        {activeTab === 'request' && (
                          <>
                            <td className="px-6 py-4">{item.request_id}</td>
                            <td className="px-6 py-4">{item.client_name}</td>
                            <td className="px-6 py-4">{item.requested_services}</td>
                            <td className="px-6 py-4">{item.request_details || '-'}</td>
                            <td className="px-6 py-4">
                              {item.preferred_date && item.preferred_time 
                                ? `${item.preferred_date} ${item.preferred_time}` 
                                : '-'}
                            </td>
                            <td className="px-6 py-4 relative" onClick={(e) => e.stopPropagation()}>
                              <div className="inline-block relative status-dropdown">
                                <button
                                  className="flex items-center space-x-1 px-3 py-1 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                                  onClick={() => setStatusDropdownOpen(statusDropdownOpen === item.id ? null : item.id)}
                                >
                                  <span>{item.status || 'Pending'}</span>
                                  <ChevronDown size={18} />
                                </button>
                                {statusDropdownOpen === item.id && (
                                  <div className="absolute left-0 mt-1 w-full bg-white border border-green-800 rounded-lg shadow-lg z-50 min-w-max">
                                    {STATUS_OPTIONS.map((option: string) => (
                                      <div
                                        key={option}
                                        className="px-4 py-2 hover:bg-green-50 cursor-pointer text-green-800 whitespace-nowrap"
                                        onClick={() => {
                                          setStatusDropdownOpen(null);
                                          openStatusModal(option as any, item.id, 'request');
                                        }}
                                      >
                                        {option}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="p-1 rounded hover:bg-red-100 transition-colors"
                                onClick={() => handleDelete(item.id, 'request')}
                              >
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </td>
                          </>
                        )}
                        {/* History Tab */}
                        {activeTab === 'history' && (
                          <>
                            <td className="px-6 py-4">{item.id}</td>
                            <td className="px-6 py-4">
                              {item.pet?.owner_name || item.client_name || '-'}
                            </td>
                            <td className="px-6 py-4">
                              {item.type || item.requested_services || '-'}
                            </td>
                            <td className="px-6 py-4">
                              {item.date || item.preferred_date || '-'}
                            </td>
                            <td className="px-6 py-4">
                              {item.veterinarian || item.handled_by || '-'}
                            </td>
                            <td className="px-6 py-4">{item.notes || '-'}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="p-1 rounded hover:bg-red-100 transition-colors"
                                onClick={() => handleDelete(
                                  item.id, 
                                  item.request_id ? 'request' : 'appointment'
                                )}
                              >
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={detailsModalOpen}
        onClose={closeDetailsModal}
        data={selectedItem}
        type={selectedItemType}
      />

      {/* Appointment Status Modal */}
      <AppointmentStatusModal
        isOpen={statusModalOpen}
        onClose={closeStatusModal}
        status={selectedStatus}
        appointmentId={selectedItemForStatus?.id || 0}
        onStatusUpdate={handleStatusUpdate}
        loading={statusUpdateLoading}
      />
    </div>
  );
};

export default AppointmentsPage; 