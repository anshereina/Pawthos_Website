import React, { useState } from 'react';
import { Search, Filter, Upload, Trash2, ChevronDown, Plus, Edit } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { useAppointments, useServiceRequests } from '../hooks/useAppointments';
import { useWalkInRecords } from '../hooks/useWalkInRecords';
import LoadingSpinner from '../components/LoadingSpinner';
import AppointmentDetailsModal from '../components/AppointmentDetailsModal';
import AppointmentStatusModal from '../components/AppointmentStatusModal';
import AddAppointmentModal from '../components/AddAppointmentModal';
import AddWalkInModal from '../components/AddWalkInModal';
import EditWalkInModal from '../components/EditWalkInModal';
import WalkInDetailsModal from '../components/WalkInDetailsModal';
import { Appointment, ServiceRequest } from '../services/appointmentService';

const TABS = [
  { label: 'Appointments', value: 'appointments' },
  { label: 'Appointments History', value: 'history' },
  { label: 'Walk-In', value: 'walkin' },
];

const STATUS_OPTIONS: string[] = ['Pending', 'Approve', 'Completed', 'Cancel', 'Resched'];

const AppointmentsPage: React.FC = () => {
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('appointments');
  const [search, setSearch] = useState('');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Appointment | ServiceRequest | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'appointment' | 'request'>('appointment');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'Pending' | 'Approve' | 'Completed' | 'Cancel' | 'Resched'>('Pending');
  const [selectedItemForStatus, setSelectedItemForStatus] = useState<{id: number, type: 'appointment' | 'request'} | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addWalkInModalOpen, setAddWalkInModalOpen] = useState(false);
  const [editWalkInModalOpen, setEditWalkInModalOpen] = useState(false);
  const [walkInDetailsModalOpen, setWalkInDetailsModalOpen] = useState(false);
  const [selectedWalkInRecord, setSelectedWalkInRecord] = useState<any | null>(null);
  const [selectedWalkInForEdit, setSelectedWalkInForEdit] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Use real data hooks
  const { 
    appointments, 
    loading: appointmentsLoading, 
    error: appointmentsError,
    updateAppointment,
    deleteAppointment,
    fetchAppointments,
    createAppointment
  } = useAppointments();
  
  const { 
    serviceRequests, 
    loading: requestsLoading, 
    error: requestsError,
    updateServiceRequest,
    deleteServiceRequest,
    fetchServiceRequests
  } = useServiceRequests();

  const {
    walkInRecords,
    loading: walkInLoading,
    error: walkInError,
    fetchWalkInRecords,
    createWalkInRecord,
    updateWalkInRecord,
    deleteWalkInRecord
  } = useWalkInRecords();

  React.useEffect(() => {
    if (user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
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
      } else if (activeTab === 'walkin') {
        fetchWalkInRecords({ search });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, activeTab, fetchAppointments, fetchServiceRequests, fetchWalkInRecords]);

  // Reset to page 1 when tab or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  if (user === undefined) {
    return <div>Loading...</div>;
  }
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };


  // const handleStatusChange = async (id: number, newStatus: string, type: 'appointment' | 'request') => {
  //   try {
  //     if (type === 'appointment') {
  //       await updateAppointment(id, { status: newStatus });
  //     } else {
  //       await updateServiceRequest(id, { status: newStatus });
  //     }
  //   } catch (error) {
  //     console.error('Failed to update status:', error);
  //   }
  //   setStatusDropdownOpen(null);
  // };

  const handleDelete = async (id: number, type: 'appointment' | 'request' | 'walkin') => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'appointment') {
          await deleteAppointment(id);
        } else if (type === 'request') {
          await deleteServiceRequest(id);
        } else if (type === 'walkin') {
          await deleteWalkInRecord(id);
        }
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const handleRowClick = (item: Appointment | ServiceRequest, type: 'appointment' | 'request' | 'walkin') => {
    if (type === 'walkin') {
      setSelectedWalkInRecord(item);
      setWalkInDetailsModalOpen(true);
    } else {
      setSelectedItem(item);
      setSelectedItemType(type);
      setDetailsModalOpen(true);
    }
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedItem(null);
  };

  const closeWalkInDetailsModal = () => {
    setWalkInDetailsModalOpen(false);
    setSelectedWalkInRecord(null);
  };

  const openStatusModal = (status: 'Pending' | 'Approve' | 'Completed' | 'Resched' | 'Cancel', itemId: number, type: 'appointment' | 'request') => {
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
          ...(newDateTime && status === 'Resched' && {
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
      // If completed, navigate to History tab
      if (status === 'Completed') {
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleAddAppointment = async (data: any) => {
    try {
      await createAppointment(data);
      setAddModalOpen(false);
      // Switch to History tab since new records are saved as Completed
      setActiveTab('history');
      // Refresh appointments list
      await fetchAppointments({ search });
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create appointment');
    }
  };

  const handleAddWalkIn = async (data: any) => {
    try {
      await createWalkInRecord(data);
      setAddWalkInModalOpen(false);
      // Refresh walk-in records
      await fetchWalkInRecords({ search });
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create walk-in record');
    }
  };

  const handleEditWalkIn = async (data: any) => {
    try {
      if (selectedWalkInForEdit?.id) {
        await updateWalkInRecord(selectedWalkInForEdit.id, data);
        setEditWalkInModalOpen(false);
        setSelectedWalkInForEdit(null);
        // Refresh walk-in records
        await fetchWalkInRecords({ search });
      }
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to update walk-in record');
    }
  };

  const openEditWalkInModal = (record: any) => {
    setSelectedWalkInForEdit(record);
    setEditWalkInModalOpen(true);
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'appointments':
        // Show only pending appointments (exclude Approved and Completed)
        return appointments.filter(apt => apt.status !== 'Completed' && apt.status !== 'Approve');
      case 'request':
        // Show only non-completed service requests in Requests tab
        return serviceRequests.filter(req => req.status !== 'Completed');
      case 'walkin':
        // Show walk-in records
        return walkInRecords;
      case 'history':
        // Filter completed appointments and requests
        const completedAppointments = appointments.filter(apt => apt.status === 'Completed');
        const completedRequests = serviceRequests.filter(req => req.status === 'Completed');
        return [...completedAppointments, ...completedRequests];
      default:
        return [];
    }
  };

  const allData = getCurrentData();
  const isLoading = appointmentsLoading || requestsLoading || walkInLoading;

  // Pagination logic
  const totalPages = Math.ceil(allData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = allData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Table columns based on tab
  let columns: string[] = [];
  if (activeTab === 'appointments') {
    columns = ['Appointment ID', 'Client Name', 'Pet Name', 'Service Type', 'Date & Time', 'Status', 'Action'];
  } else if (activeTab === 'request') {
    columns = ['Request ID', 'Client Name', 'Request Service/s', 'Request Details', 'Date & Time', 'Status', 'Action'];
  } else if (activeTab === 'walkin') {
    columns = ['ID', 'Date', 'Client Name', 'Pet Name', 'Breed', 'Age', 'Gender', 'Service Type', 'Medicine Used', 'Action'];
  } else if (activeTab === 'history') {
    columns = ['ID', 'Client Name', 'Service Rendered', 'Date Completed', 'Handled by', 'Remarks', 'Status', 'Action'];
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans w-full">
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
        <PageHeader title="Appointments" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Top Control Panel */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow duration-300">
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
                {/* Add New Record Button - Show for Walk-In and History tabs only */}
                {activeTab === 'walkin' && (
                  <button 
                    onClick={() => setAddWalkInModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Plus size={20} />
                    <span className="font-semibold">Add New Walk-In Record</span>
                  </button>
                )}
                {activeTab === 'history' && (
                  <button 
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Plus size={20} />
                    <span className="font-semibold">Add New Record</span>
                  </button>
                )}
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
                {/* Filter Button */}
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg">
                  <Filter size={20} />
                  <span className="font-semibold">Filter</span>
                </button>
                {/* Export Button */}
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg">
                  <Upload size={20} />
                  <span className="font-semibold">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {(appointmentsError || requestsError || walkInError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{appointmentsError || requestsError || walkInError}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {/* Note */}
          {!isLoading && (
            <div className="mb-3 text-sm text-gray-600 italic">
              Note: You can view the details by clicking the row.
            </div>
          )}

          {/* Appointments & Requests Table */}
          {!isLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                    <tr>
                      {columns.map(col => (
                        <th key={col} className="px-6 py-4 text-left font-semibold text-sm">{col}</th>
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
                        className={`${i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} cursor-pointer hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
                        onClick={() => handleRowClick(item, activeTab === 'appointments' ? 'appointment' : activeTab === 'walkin' ? 'walkin' : 'request')}
                      >
                        {/* Appointments Tab */}
                        {activeTab === 'appointments' && (
                          <>
                            <td className="px-6 py-4">{item.id}</td>
                            <td className="px-6 py-4">{item.client_name || item.user?.name || item.pet?.owner_name || '-'}</td>
                            <td className="px-6 py-4">{item.pet_name || item.pet?.name || '-'}</td>
                            <td className="px-6 py-4">{item.type}</td>
                            <td className="px-6 py-4">{item.date} {item.time}</td>
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block status-dropdown">
                                <button
                                  id={`status-btn-${item.id}`}
                                  className="flex items-center space-x-1 px-3 py-2 border border-green-300 bg-white text-green-700 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all duration-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStatusDropdownOpen(statusDropdownOpen === item.id ? null : item.id);
                                  }}
                                >
                                  <span>{item.status || 'Pending'}</span>
                                  <ChevronDown size={18} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm"
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
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block status-dropdown">
                                <button
                                  id={`status-btn-${item.id}`}
                                  className="flex items-center space-x-1 px-3 py-2 border border-green-300 bg-white text-green-700 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all duration-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStatusDropdownOpen(statusDropdownOpen === item.id ? null : item.id);
                                  }}
                                >
                                  <span>{item.status || 'Pending'}</span>
                                  <ChevronDown size={18} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm"
                                onClick={() => handleDelete(item.id, 'request')}
                              >
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </td>
                          </>
                        )}
                        {/* Walk-In Tab */}
                        {activeTab === 'walkin' && (
                          <>
                            <td className="px-6 py-4">{item.id}</td>
                            <td className="px-6 py-4">{item.date || '-'}</td>
                            <td className="px-6 py-4">{item.client_name || '-'}</td>
                            <td className="px-6 py-4">{item.pet_name || '-'}</td>
                            <td className="px-6 py-4">{item.breed || '-'}</td>
                            <td className="px-6 py-4">{item.age || '-'}</td>
                            <td className="px-6 py-4">{item.gender || '-'}</td>
                            <td className="px-6 py-4">{item.service_type || '-'}</td>
                            <td className="px-6 py-4">{item.medicine_used || '-'}</td>
                            <td className="px-6 py-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:shadow-sm"
                                onClick={() => openEditWalkInModal(item)}
                              >
                                <Edit size={18} className="text-blue-600" />
                              </button>
                              <button 
                                className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm"
                                onClick={() => handleDelete(item.id, 'walkin')}
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
                                className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm"
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

              {/* Status Dropdown Menu - Rendered outside table to avoid z-index issues */}
              {statusDropdownOpen !== null && (() => {
                const buttonElement = document.getElementById(`status-btn-${statusDropdownOpen}`);
                if (!buttonElement) return null;
                
                const rect = buttonElement.getBoundingClientRect();
                const dropdownStyle = {
                  position: 'fixed' as const,
                  top: `${rect.bottom + 8}px`,
                  left: `${rect.left}px`,
                  minWidth: '150px',
                  zIndex: 9999
                };

                return (
                  <div 
                    className="status-dropdown bg-white border border-gray-200 rounded-xl shadow-2xl"
                    style={dropdownStyle}
                  >
                    {STATUS_OPTIONS.map((option: string) => (
                      <div
                        key={option}
                        className="px-4 py-2 hover:bg-green-50 cursor-pointer text-green-700 whitespace-nowrap transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                        onClick={async () => {
                          setStatusDropdownOpen(null);
                          const type = activeTab === 'appointments' ? 'appointment' : 'request';
                          // If selecting Completed, update immediately without modal and switch to History
                          if (option === 'Completed') {
                            try {
                              if (type === 'appointment') {
                                await updateAppointment(statusDropdownOpen as number, { status: 'Completed' });
                              } else {
                                await updateServiceRequest(statusDropdownOpen as number, { status: 'Completed' });
                              }
                              setActiveTab('history');
                            } catch (err) {
                              console.error('Failed to complete item:', err);
                            }
                          } else {
                            openStatusModal(
                              option as any,
                              statusDropdownOpen,
                              type
                            );
                          }
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Pagination Controls */}
              {allData.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, allData.length)} of {allData.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-400'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        const showEllipsis = 
                          (page === currentPage - 2 && currentPage > 3) ||
                          (page === currentPage + 2 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return <span key={page} className="px-2 text-gray-500">...</span>;
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-700 shadow-md'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-400'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-400'
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

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddAppointment}
      />

      {/* Add Walk-In Modal */}
      <AddWalkInModal
        isOpen={addWalkInModalOpen}
        onClose={() => setAddWalkInModalOpen(false)}
        onSubmit={handleAddWalkIn}
      />

      {/* Edit Walk-In Modal */}
      <EditWalkInModal
        isOpen={editWalkInModalOpen}
        onClose={() => {
          setEditWalkInModalOpen(false);
          setSelectedWalkInForEdit(null);
        }}
        onSubmit={handleEditWalkIn}
        initialData={selectedWalkInForEdit}
      />

      {/* Walk-In Details Modal */}
      <WalkInDetailsModal
        isOpen={walkInDetailsModalOpen}
        onClose={closeWalkInDetailsModal}
        data={selectedWalkInRecord}
      />
    </div>
  );
};

export default AppointmentsPage; 