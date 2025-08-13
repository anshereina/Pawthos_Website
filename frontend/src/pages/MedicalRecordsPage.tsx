import React, { useState } from 'react';
import { Search, Upload, Download, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';

const TABS = [
  { label: 'Upcoming Appointments', value: 'upcoming' },
  { label: 'Medical History', value: 'history' },
];

const MedicalRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const handleBack = () => {
    router.navigate({ to: '/records' });
  };

  // Table columns based on tab
  let columns: string[] = [];
  if (activeTab === 'upcoming') {
    columns = ['Date of Visit', 'Reason for Visit', 'Type of Species', 'Pet Name', 'Status', 'Action'];
  } else if (activeTab === 'history') {
    columns = ['Date of Visit', 'Reason for Visit', 'Type of Species', 'Pet Name', 'Next Visit', 'Action'];
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
          <div className="flex items-center gap-2">
            <button
              className="text-green-800 hover:text-green-900 p-1 mr-1"
              onClick={handleBack}
              aria-label="Back to Records"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
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
                {/* Export Button */}
                <button className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  <Upload size={20} />
                  <span>Export</span>
                </button>
                {/* Import Button */}
                <button className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200">
                  <Download size={20} />
                  <span>Import</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instructional Note */}
          <div className="mb-4 text-green-700 text-sm font-medium">
            Note: You can update the appointment by clicking the status.
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-green-800 text-white">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-6 py-4 text-center font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-green-50' : 'bg-white'}
                  >
                    {/* Upcoming Appointments Tab */}
                    {activeTab === 'upcoming' && (
                      <>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">
                          {i === 0 ? (
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                                <Edit size={18} className="text-blue-600" />
                              </button>
                              <button className="p-1 rounded hover:bg-red-100 transition-colors" title="Delete">
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      </>
                    )}
                    {/* Medical History Tab */}
                    {activeTab === 'history' && (
                      <>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">-</td>
                        <td className="px-6 py-4 text-center">
                          {i === 0 ? (
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1 rounded hover:bg-blue-50 transition-colors" title="Edit">
                                <Edit size={18} className="text-blue-600" />
                              </button>
                              <button className="p-1 rounded hover:bg-red-100 transition-colors" title="Delete">
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {/* Empty state */}
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                    No records found for this view.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MedicalRecordsPage; 