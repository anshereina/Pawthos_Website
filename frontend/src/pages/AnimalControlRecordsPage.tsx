import React, { useState } from 'react';
import { Search, Upload, Edit, Trash2, ArrowLeft, PlusSquare, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { config } from '../config';
import { useAnimalControlRecords } from '../hooks/useAnimalControlRecords';
import AddAnimalControlRecordModal from '../components/AddAnimalControlRecordModal';
import EditAnimalControlRecordModal from '../components/EditAnimalControlRecordModal';
import DeleteAnimalControlRecordModal from '../components/DeleteAnimalControlRecordModal';
import ExportModal from '../components/ExportModal';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { label: 'Catch Record', value: 'catch' },
  { label: 'Animal Surrendered', value: 'surrendered' },
];

const AnimalControlRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catch' | 'surrendered'>('catch');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{ id: number; ownerName: string } | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<any>(null);
  
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();
  const { records, loading, error, createRecord, updateRecord, deleteRecord } = useAnimalControlRecords();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const handleBack = () => {
    router.navigate({ to: '/records' });
  };

  const handleAddRecord = async (recordData: any) => {
    try {
      await createRecord({
        ...recordData,
        record_type: activeTab,
      });
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  };

  const handleUpdateRecord = async (id: number, recordData: any) => {
    try {
      await updateRecord(id, recordData);
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;
    try {
      await deleteRecord(selectedRecord.id);
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  };

  const openEditModal = (record: any) => {
    setRecordToEdit(record);
    setShowEditModal(true);
  };

  const openDeleteModal = (record: any) => {
    setSelectedRecord({ id: record.id, ownerName: record.owner_name });
    setShowDeleteModal(true);
  };

  // Filter records based on active tab and search
  const filteredRecords = records.filter(record => {
    const matchesTab = record.record_type === activeTab;
    const matchesSearch = search === '' || 
      record.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      (record.contact_number && record.contact_number.toLowerCase().includes(search.toLowerCase())) ||
      (record.address && record.address.toLowerCase().includes(search.toLowerCase())) ||
      (record.breed && record.breed.toLowerCase().includes(search.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  // Table columns based on tab
  const getColumns = () => {
    if (activeTab === 'catch') {
      return ['Photo', 'Owner Name', 'Contact Number', 'Address', 'Breed', 'Date', 'Action'];
    } else {
      return ['Photo', 'Owner Name', 'Contact Number', 'Address', 'Breed', 'Detail/Purpose', 'Date', 'Action'];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Reset page when tab or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  // Pagination calc
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = filteredRecords.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const resolveImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    // Ensure it points to backend uploads
    const path = url.startsWith('/uploads/') ? url : `/uploads/${url.replace(/^\//, '')}`;
    return `${config.apiUrl}${path}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 font-inter w-full">
        <Sidebar
          items={navigationItems}
          activeItem={activeItem}
          onItemClick={handleItemClick}
          isExpanded={isExpanded}
          onToggleExpand={toggleSidebar}
        />
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ease-in-out ${
          isExpanded ? 'ml-64' : 'ml-16'
        }`}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

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
        <PageHeader title="Animal Control Records" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
          )}

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
                    onClick={() => setActiveTab(tab.value as 'catch' | 'surrendered')}
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
                {/* Add New Record Button */}
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <PlusSquare size={20} />
                  <span className="font-semibold">Add New Record</span>
                </button>
                {/* Export Button */}
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Upload size={20} />
                  <span className="font-semibold">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Animal Control Records Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                <tr>
                  {getColumns().map(col => (
                    <th key={col} className="px-4 py-3 text-left font-semibold text-sm">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={getColumns().length} className="px-4 py-8 text-center text-gray-500">
                      No {activeTab} records found
                    </td>
                  </tr>
                ) : (
                  currentRows.map((record, index) => (
                    <tr
                      key={record.id}
                      onClick={() => openEditModal(record)}
                      className={`${index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100 cursor-pointer`}
                    >
                      <td className="px-4 py-3">
                        {record.image_url ? (
                          <img
                            src={resolveImageUrl(record.image_url)}
                            alt="Animal photo"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No photo</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{record.owner_name}</td>
                      <td className="px-4 py-3">{record.contact_number || '-'}</td>
                      <td className="px-4 py-3">{record.address || '-'}</td>
                      <td className="px-4 py-3">{record.breed || '-'}</td>
                      {activeTab === 'surrendered' && (
                        <td className="px-4 py-3">{record.detail || '-'}</td>
                      )}
                      <td className="px-4 py-3">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(record); }}
                          className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm"
                          title="Edit record"
                        >
                          <Edit size={18} className="text-green-800" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openDeleteModal(record); }}
                          className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm"
                          title="Delete record"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination Controls */}
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
                  {/* Page Numbers */}
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
        </main>
      </div>

      {/* Modals */}
      <AddAnimalControlRecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRecord}
        recordType={activeTab}
      />

      <EditAnimalControlRecordModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setRecordToEdit(null);
        }}
        onSubmit={handleUpdateRecord}
        record={recordToEdit}
      />

      <DeleteAnimalControlRecordModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRecord}
        recordId={selectedRecord?.id || 0}
        ownerName={selectedRecord?.ownerName || ''}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        records={records}
        activeTab={activeTab}
        search={search}
      />
    </div>
  );
};

export default AnimalControlRecordsPage; 