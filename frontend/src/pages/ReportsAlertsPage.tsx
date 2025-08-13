import React, { useState } from 'react';
import { Search, FileText, Bell, ChevronDown, ArrowLeft, UserCircle, User, Settings, LogOut, Edit, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import { useAuth } from '../features/auth/AuthContext';
import { useReports } from '../hooks/useReports';
import { useAlerts } from '../hooks/useAlerts';
import AddReportModal from '../components/AddReportModal';
import AddAlertModal from '../components/AddAlertModal';
import EditReportModal from '../components/EditReportModal';
import DeleteReportModal from '../components/DeleteReportModal';
import EditAlertModal from '../components/EditAlertModal';
import DeleteAlertModal from '../components/DeleteAlertModal';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { label: 'Submitted Reports', value: 'reports' },
  { label: 'Submitted Alerts', value: 'alerts' },
];

const STATUS_OPTIONS: string[] = ['New', 'In Progress', 'Resolved'];

const ReportsAlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [search, setSearch] = useState('');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);
  const [debugClick, setDebugClick] = useState(0);
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
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
      if (
        target.closest('.user-info-area') === null &&
        target.closest('.user-dropdown-menu') === null &&
        target.closest('.status-dropdown') === null
      ) {
        setIsDropdownOpen(false);
        setStatusDropdownOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // Table columns based on tab
  const columns = activeTab === 'reports'
    ? ['Report ID', 'Title', 'Submitted By', 'Status', 'Action']
    : ['Alert ID', 'Title', 'Submitted By', 'Priority', 'Recipients', 'Action'];

  const isLoading = reportsLoading || alertsLoading;
  const currentData = activeTab === 'reports' ? reports : alerts;
  
  // Debug logging
  console.log('Active tab:', activeTab);
  console.log('Reports:', reports);
  console.log('Alerts:', alerts);
  console.log('Current data:', currentData);
  console.log('Status dropdown open:', statusDropdownOpen);

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
          <h1 className="text-2xl font-bold text-gray-800">Reports & Alerts</h1>
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
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {/* Generate Report Button */}
                <button 
                  className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                  onClick={() => setIsAddReportModalOpen(true)}
                >
                  <FileText size={20} />
                  <span>Generate Report</span>
                </button>
                {/* Send New Alert Button */}
                <button 
                  className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                  onClick={() => setIsAddAlertModalOpen(true)}
                >
                  <Bell size={20} />
                  <span>Send New Alert</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {(reportsError || alertsError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {reportsError || alertsError}
            </div>
          )}

          {/* Reports & Alerts Table */}
          <div className="bg-white rounded-lg shadow-md relative">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
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
                        No {activeTab === 'reports' ? 'reports' : 'alerts'} found
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item, i) => {
                      console.log('Rendering item:', item, 'index:', i);
                      if (activeTab === 'reports') {
                        const report = item as any;
                        console.log('Rendering report:', report);
                        return (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-green-50' : 'bg-white'}
                  >
                            <td className="px-6 py-4">{report.report_id}</td>
                            <td className="px-6 py-4">{report.title}</td>
                            <td className="px-6 py-4">{report.submitted_by}</td>
                            <td className="px-6 py-4">
                              <div className="relative status-dropdown">
                              <button
                                  type="button"
                                  className={`flex items-center space-x-1 px-3 py-1 border rounded-lg transition-colors duration-200 ${
                                    statusDropdownOpen === i 
                                      ? 'border-green-600 bg-green-50 text-green-700' 
                                      : 'border-green-800 bg-white text-green-800 hover:bg-green-50'
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDebugClick(prev => prev + 1);
                                    console.log('Dropdown clicked! Click count:', debugClick + 1);
                                    console.log('Current state:', statusDropdownOpen, 'new state:', statusDropdownOpen === i ? null : i);
                                    setStatusDropdownOpen(statusDropdownOpen === i ? null : i);
                                  }}
                              >
                                  <span>{report.status}</span>
                                <ChevronDown size={18} />
                              </button>
                              {statusDropdownOpen === i && (
                                  <div 
                                    className="absolute left-0 top-full mt-1 w-32 bg-white border border-green-800 rounded-lg shadow-xl z-[9999]"
                                    style={{
                                      position: 'absolute',
                                      zIndex: 9999,
                                      backgroundColor: 'white',
                                      border: '1px solid #166534',
                                      borderRadius: '8px',
                                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                    }}
                                  >
                                  {STATUS_OPTIONS.map((option: string) => (
                                    <div
                                      key={option}
                                        className="px-4 py-2 hover:bg-green-50 cursor-pointer text-green-800 first:rounded-t-lg last:rounded-b-lg"
                                        style={{
                                          padding: '8px 16px',
                                          cursor: 'pointer',
                                          borderBottom: option !== STATUS_OPTIONS[STATUS_OPTIONS.length - 1] ? '1px solid #e5e7eb' : 'none'
                                        }}
                                        onClick={() => handleStatusChange(report.report_id, option)}
                                    >
                                      {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <button 
                            className="p-1 rounded hover:bg-green-200 transition-colors"
                            onClick={() => handleEditReport(report)}
                          >
                            <Edit size={18} className="text-green-800" />
                          </button>
                          <button 
                            className="p-1 rounded hover:bg-red-100 transition-colors"
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
                            className={i % 2 === 0 ? 'bg-green-50' : 'bg-white'}
                          >
                            <td className="px-6 py-4">{alert.alert_id}</td>
                            <td className="px-6 py-4">{alert.title}</td>
                            <td className="px-6 py-4">{alert.submitted_by}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                alert.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                alert.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                alert.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {alert.priority}
                              </span>
                        </td>
                        <td className="px-6 py-4">
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
                                    <div className="flex flex-wrap gap-1">
                                      {recipientsList.slice(0, 3).map((recipient: string, index: number) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                        >
                                          {recipient}
                                        </span>
                                      ))}
                                      {recipientsList.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                          +{recipientsList.length - 3} more
                                        </span>
                                      )}
                                    </div>
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
                        <td className="px-6 py-4 flex items-center gap-2">
                          <button 
                            className="p-1 rounded hover:bg-green-200 transition-colors"
                            onClick={() => handleEditAlert(alert)}
                          >
                            <Edit size={18} className="text-green-800" />
                          </button>
                          <button 
                            className="p-1 rounded hover:bg-red-100 transition-colors"
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