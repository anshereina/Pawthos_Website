import React, { useState } from 'react';
import { Search, Filter, Upload, Eye, Trash2, UserCircle, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '@tanstack/react-router';

const TABS = [
  { label: 'All Assessments', value: 'all' },
  { label: 'Pending Review', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

const TABLE_COLUMNS = [
  'Assessment ID',
  'Pet Name',
  'Owner Name',
  'Submitted Date',
  'Severity',
  'Status',
  'Action',
];

const PainAssessmentPage: React.FC = () => {
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleViewAssessment = (assessmentId: number) => {
    console.log('View assessment:', assessmentId);
    // Add view functionality here
  };

  const handleDeleteAssessment = (assessmentId: number) => {
    console.log('Delete assessment:', assessmentId);
    // Add delete functionality here
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Pain Assessment</h1>
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
              {/* Assessment Type Tabs */}
              <div className="flex space-x-2">
                {TABS.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === tab.value
                        ? 'bg-green-800 text-white'
                        : 'bg-white text-green-800 border border-green-800 hover:bg-green-50'
                    }`}
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

          {/* Pain Assessment Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-green-800 text-white">
                <tr>
                  {TABLE_COLUMNS.map(col => (
                    <th key={col} className="px-6 py-4 text-left font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr 
                    key={i}
                    className={`${
                      i % 2 === 0 ? 'bg-green-50' : 'bg-white'
                    } hover:bg-green-100 transition-colors duration-150`}
                  >
                    <td className="px-6 py-4 text-gray-900">-</td>
                    <td className="px-6 py-4 text-gray-900">-</td>
                    <td className="px-6 py-4 text-gray-900">-</td>
                    <td className="px-6 py-4 text-gray-900">-</td>
                    <td className="px-6 py-4 text-gray-900">-</td>
                    <td className="px-6 py-4 text-gray-900">-</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewAssessment(i + 1)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="View assessment"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAssessment(i + 1)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                          title="Delete assessment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Empty state */}
                {false && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No assessments found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PainAssessmentPage; 