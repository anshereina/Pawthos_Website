import React, { useState } from 'react';
import { Search, FileText, Bell, ChevronDown, Edit, Trash2, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import { useAuth } from '../features/auth/AuthContext';
import PageHeader from '../components/PageHeader';
import { useReports } from '../hooks/useReports';
import { useAlerts } from '../hooks/useAlerts';
import AddReportModal from '../components/AddReportModal';
import AddAlertModal from '../components/AddAlertModal';
import EditReportModal from '../components/EditReportModal';
import DeleteReportModal from '../components/DeleteReportModal';
import EditAlertModal from '../components/EditAlertModal';
import DeleteAlertModal from '../components/DeleteAlertModal';
import RecipientsPreview from '../components/RecipientsPreview';
import { API_BASE_URL } from '../config';

const TABS = [
  { label: 'Submitted Reports', value: 'reports' },
  { label: 'Submitted Alerts', value: 'alerts' },
];

const STATUS_OPTIONS: string[] = ['New', 'In Progress', 'Resolved'];

const ReportsAlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [search, setSearch] = useState('');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();
  const { user } = useAuth();
  
  // Modal states
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [isAddAlertModalOpen, setIsAddAlertModalOpen] = useState(false);
  const [isEditReportModalOpen, setIsEditReportModalOpen] = useState(false);
  const [isDeleteReportModalOpen, setIsDeleteReportModalOpen] = useState(false);
  const [isEditAlertModalOpen, setIsEditAlertModalOpen] = useState(false);
  const [isDeleteAlertModalOpen, setIsDeleteAlertModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  // Hooks for data management
  const { 
    reports, 
    loading: reportsLoading, 
    error: reportsError, 
    createReport, 
    updateReport, 
    deleteReport, 
    searchReports 
  } = useReports();
  
  const { 
    alerts, 
    loading: alertsLoading, 
    error: alertsError, 
    createAlert, 
    updateAlert, 
    deleteAlert, 
    searchAlerts 
  } = useAlerts();

  React.useEffect(() => {
    if (user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router]);

  React.useEffect(() => {
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

  // Reset to first page when tab or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (user === undefined) {
    return <div>Loading...</div>;
  }
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      console.log('Updating report status:', reportId, 'to:', newStatus);
      await updateReport(reportId, { status: newStatus });
    setStatusDropdownOpen(null);
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    
    try {
      if (activeTab === 'reports') {
        await searchReports(search);
      } else {
        await searchAlerts(search);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };



  const handleEditReport = (report: any) => {
    setSelectedReport(report);
    setIsEditReportModalOpen(true);
  };

  const handleDeleteReport = (report: any) => {
    setSelectedReport(report);
    setIsDeleteReportModalOpen(true);
  };

  const handleEditAlert = (alert: any) => {
    setSelectedAlert(alert);
    setIsEditAlertModalOpen(true);
  };

  const handleDeleteAlert = (alert: any) => {
    setSelectedAlert(alert);
    setIsDeleteAlertModalOpen(true);
  };

  const handleConfirmDeleteReport = async (reportId: string) => {
    try {
      await deleteReport(reportId);
      setIsDeleteReportModalOpen(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleConfirmDeleteAlert = async (alertId: string) => {
    try {
      await deleteAlert(alertId);
      setIsDeleteAlertModalOpen(false);
      setSelectedAlert(null);
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };


  // Table columns based on tab
  const columns = activeTab === 'reports'
    ? ['Report ID', 'Title', 'Submitted By', 'Recipient', 'Image', 'Status', 'Action']
    : ['Alert ID', 'Title', 'Submitted By', 'Priority', 'Recipients', 'Action'];

  const isLoading = reportsLoading || alertsLoading;
  const currentData = activeTab === 'reports' ? reports : alerts;
  
  // Pagination logic
  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDataPage = currentData.slice(startIndex, endIndex);
  
  // Debug logging
  console.log('Active tab:', activeTab);
  console.log('Reports:', reports);
  console.log('Alerts:', alerts);
  console.log('Current data:', currentData);
  console.log('Status dropdown open:', statusDropdownOpen);

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
        <PageHeader title="Reports & Alerts" />

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
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 hover:border-green-300"
                  />
                </div>
                {/* Generate Report Button */}
                <button 
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() => setIsAddReportModalOpen(true)}
                >
                  <FileText size={20} />
                  <span className="font-semibold">Generate Report</span>
                </button>
                {/* Send New Alert Button */}
                <button 
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() => setIsAddAlertModalOpen(true)}
                >
                  <Bell size={20} />
                  <span className="font-semibold">Send New Alert</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instructional Note */}
          <div className="mb-4 text-green-700 text-sm font-medium">
            Note: You can view the details by clicking the row.
          </div>

          {/* Error Display */}
          {(reportsError || alertsError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {reportsError || alertsError}
            </div>
          )}

          {/* Reports & Alerts Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 mb-4">
            <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
              <table className="w-full">
              <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-4 py-3 text-left font-semibold text-sm">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      Loading {activeTab === 'reports' ? 'reports' : 'alerts'}...
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      No {activeTab === 'reports' ? 'reports' : 'alerts'} found
                    </td>
                  </tr>
                ) : (
                  currentDataPage.map((item, i) => {
                      console.log('Rendering item:', item, 'index:', i);
                      if (activeTab === 'reports') {
                        const report = item as any;
                        console.log('Rendering report:', report);
                        return (
                  <tr
                    key={i}
                    className={`${i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
                  >
                            <td className="px-4 py-3">{report.report_id}</td>
                            <td className="px-4 py-3">{report.title}</td>
                            <td className="px-4 py-3">{report.submitted_by}</td>
                            <td className="px-4 py-3">
                              {report.recipient ? (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {report.recipient}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400 italic">No recipient</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {report.image_url ? (
                                <a
                                  href={`${API_BASE_URL}${report.image_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                                >
                                  <Eye size={14} />
                                  <span className="text-xs">View</span>
                                </a>
                              ) : (
                                <span className="text-sm text-gray-400 italic">No image</span>
                              )}
                            </td>
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block status-dropdown">
                                <button
                                  id={`status-btn-report-${report.id}`}
                                  type="button"
                                  className="flex items-center space-x-1 px-3 py-2 border border-green-300 bg-white text-green-700 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all duration-300"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setStatusDropdownOpen(statusDropdownOpen === report.id ? null : report.id);
                                  }}
                                >
                                  <span>{report.status}</span>
                                  <ChevronDown size={18} />
                                </button>
                              </div>
                            </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button 
                            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm"
                            onClick={() => handleEditReport(report)}
                          >
                            <Edit size={18} className="text-green-600" />
                          </button>
                          <button 
                            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm"
                            onClick={() => handleDeleteReport(report)}
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </td>
                          </tr>
                        );
                      } else {
                        const alert = item as any;
                        return (
                          <tr
                            key={i}
                            className={`${i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
                          >
                            <td className="px-4 py-3">{alert.alert_id}</td>
                            <td className="px-4 py-3">{alert.title}</td>
                            <td className="px-4 py-3">{alert.submitted_by}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                alert.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                alert.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                alert.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {alert.priority}
                              </span>
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            console.log('Alert recipients data:', alert.recipients);
                            if (alert.recipients) {
                              try {
                                let recipientsList = JSON.parse(alert.recipients);
                                console.log('Parsed recipients list:', recipientsList, 'Type:', typeof recipientsList);
                                
                                // Handle double-encoded JSON (if the parsed result is still a string)
                                if (typeof recipientsList === 'string') {
                                  try {
                                    recipientsList = JSON.parse(recipientsList);
                                    console.log('Double-parsed recipients list:', recipientsList, 'Type:', typeof recipientsList);
                                  } catch (e) {
                                    console.error('Error parsing double-encoded recipients:', e);
                                  }
                                }
                                
                                if (Array.isArray(recipientsList) && recipientsList.length > 0) {
                                  return (
                                    <RecipientsPreview 
                                      recipients={recipientsList}
                                      maxVisible={3}
                                    />
                                  );
                                } else {
                                  console.log('Recipients list is not an array or is empty:', recipientsList);
                                }
                              } catch (e) {
                                console.error('Error parsing recipients:', e);
                              }
                            } else {
                              console.log('No recipients field in alert');
                            }
                            return <span className="text-gray-500 text-sm">No recipients</span>;
                          })()}
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button 
                            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm"
                            onClick={() => handleEditAlert(alert)}
                          >
                            <Edit size={18} className="text-green-600" />
                          </button>
                          <button 
                            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm"
                            onClick={() => handleDeleteAlert(alert)}
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </td>
                          </tr>
                        );
                      }
                    })
                    )}
              </tbody>
            </table>
            </div>

            {/* Status Dropdown Menu - Rendered outside table to avoid z-index issues */}
            {activeTab === 'reports' && statusDropdownOpen !== null && (() => {
              const buttonElement = document.getElementById(`status-btn-report-${statusDropdownOpen}`);
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
                  className="bg-white border border-gray-200 rounded-xl shadow-2xl"
                  style={dropdownStyle}
                >
                  {STATUS_OPTIONS.map((option: string) => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-green-50 cursor-pointer text-green-700 whitespace-nowrap transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => {
                        const report = reports.find((r: any) => r.id === statusDropdownOpen);
                        if (report) {
                          handleStatusChange(report.report_id, option);
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
            {currentData.length > 0 && totalPages > 1 && (
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
                  
                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      const shouldShow = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      if (!shouldShow) {
                        // Show ellipsis for gaps
                        if (page === 2 && currentPage > 4) {
                          return (
                            <span key={`ellipsis-start`} className="px-3 py-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        if (page === totalPages - 1 && currentPage < totalPages - 3) {
                          return (
                            <span key={`ellipsis-end`} className="px-3 py-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-green-600 text-white'
                              : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
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
        </main>
      </div>

      {/* Modals */}
      <AddReportModal
        isOpen={isAddReportModalOpen}
        onClose={() => setIsAddReportModalOpen(false)}
        onSubmit={createReport}
        userEmail={user?.email || ''}
        userName={user?.name || ''}
      />

      <AddAlertModal
        isOpen={isAddAlertModalOpen}
        onClose={() => setIsAddAlertModalOpen(false)}
        onSubmit={createAlert}
        userEmail={user?.email || ''}
        userName={user?.name || ''}
      />

      {/* Edit and Delete Report Modals */}
      <EditReportModal
        isOpen={isEditReportModalOpen}
        onClose={() => {
          setIsEditReportModalOpen(false);
          setSelectedReport(null);
        }}
        onSubmit={updateReport}
        report={selectedReport}
      />

      <DeleteReportModal
        isOpen={isDeleteReportModalOpen}
        onClose={() => {
          setIsDeleteReportModalOpen(false);
          setSelectedReport(null);
        }}
        onConfirm={handleConfirmDeleteReport}
        report={selectedReport}
      />

      {/* Edit and Delete Alert Modals */}
      <EditAlertModal
        isOpen={isEditAlertModalOpen}
        onClose={() => {
          setIsEditAlertModalOpen(false);
          setSelectedAlert(null);
        }}
        onSubmit={updateAlert}
        alert={selectedAlert}
      />

      <DeleteAlertModal
        isOpen={isDeleteAlertModalOpen}
        onClose={() => {
          setIsDeleteAlertModalOpen(false);
          setSelectedAlert(null);
        }}
        onConfirm={handleConfirmDeleteAlert}
        alert={selectedAlert}
      />
    </div>
  );
};

export default ReportsAlertsPage; 