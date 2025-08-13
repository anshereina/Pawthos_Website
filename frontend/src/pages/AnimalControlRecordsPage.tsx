import React, { useState } from 'react';
import { Search, Upload, Edit, Trash2, ArrowLeft, PlusSquare, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
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
      (record.species && record.species.toLowerCase().includes(search.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  // Table columns based on tab
  const getColumns = () => {
    if (activeTab === 'catch') {
      return ['Owner Name', 'Contact Number', 'Address', "Pet's Name", "Pet's Sex", 'Date', 'Action'];
    } else {
      return ['Owner Name', 'Contact Number', 'Address', "Pet's Name", "Pet's Sex", 'Detail/Purpose', 'Date', 'Action'];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            <h1 className="text-2xl font-bold text-gray-800">Animal Control Records</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
          )}

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
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search here"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {/* Add New Record Button */}
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                >
                  <PlusSquare size={20} />
                  <span>Add New Record</span>
                </button>
                {/* Export Button */}
                <button 
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                >
                  <Upload size={20} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Animal Control Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-green-800 text-white">
                <tr>
                  {getColumns().map(col => (
                    <th key={col} className="px-6 py-4 text-left font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={getColumns().length} className="px-6 py-8 text-center text-gray-500">
                      No {activeTab} records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}
                    >
                      <td className="px-6 py-4 font-medium">{record.owner_name}</td>
                      <td className="px-6 py-4">{record.contact_number || '-'}</td>
                      <td className="px-6 py-4">{record.address || '-'}</td>
                      <td className="px-6 py-4">{record.species || '-'}</td>
                      <td className="px-6 py-4">{record.gender || '-'}</td>
                      {activeTab === 'surrendered' && (
                        <td className="px-6 py-4">{record.detail || '-'}</td>
                      )}
                      <td className="px-6 py-4">{formatDate(record.date)}</td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(record)}
                          className="p-1 rounded hover:bg-green-200 transition-colors"
                          title="Edit record"
                        >
                          <Edit size={18} className="text-green-800" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(record)}
                          className="p-1 rounded hover:bg-red-100 transition-colors"
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