import React, { useState } from 'react';
import { Search, PlusSquare, Upload, Edit, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import { useShippingPermitRecords } from '../hooks/useShippingPermitRecords';
import AddShippingPermitRecordModal from '../components/AddShippingPermitRecordModal';
import EditShippingPermitRecordModal from '../components/EditShippingPermitRecordModal';
import DeleteShippingPermitRecordModal from '../components/DeleteShippingPermitRecordModal';
import ShippingPermitExportModal from '../components/ShippingPermitExportModal';
import LoadingSpinner from '../components/LoadingSpinner';

const TABLE_COLUMNS = [
  'Owner Name',
  'Contact Number',
  'Birthdate',
  'Pet Name',
  'Pet Age',
  'Permit Number',
  'Status',
  'Action',
];

const ShippingPermitRecordsPage: React.FC = () => {
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();
  const {
    records,
    loading,
    error,
    search,
    setSearch,
    createRecord,
    updateRecord,
    deleteRecord,
  } = useShippingPermitRecords();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const handleBack = () => {
    router.navigate({ to: '/records' });
  };

  const handleAddRecord = async (recordData: any) => {
    try {
      await createRecord(recordData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create record:', error);
    }
  };

  const handleEditRecord = async (id: number, recordData: any) => {
    try {
      await updateRecord(id, recordData);
      setShowEditModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Failed to update record:', error);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;
    
    setDeleteLoading(true);
    try {
      await deleteRecord(selectedRecord.id);
      setShowDeleteModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Failed to delete record:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (record: any) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const openDeleteModal = (record: any) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <header className="bg-white shadow-md p-4 flex items-center gap-2">
          <button
            className="text-green-800 hover:text-green-900 p-1 mr-1"
            onClick={handleBack}
            aria-label="Back to Records"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Shipping Permit Records</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Top Control Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              {/* Left side - can be used for future features */}
              <div className="flex space-x-2">
                {/* Future tabs or filters can go here */}
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

          {/* Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-green-800 text-white">
                <tr>
                  {TABLE_COLUMNS.map(col => (
                    <th key={col} className="px-6 py-4 text-left font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-8 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-8 text-center text-gray-500">
                      No shipping permit records found
                    </td>
                  </tr>
                ) : (
                  records.map((record, index) => (
                    <tr
                      key={record.id}
                      className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}
                    >
                      <td className="px-6 py-4 font-medium">{record.owner_name}</td>
                      <td className="px-6 py-4">{record.contact_number || '-'}</td>
                      <td className="px-6 py-4">{formatDate(record.birthdate)}</td>
                      <td className="px-6 py-4">{record.pet_name}</td>
                      <td className="px-6 py-4">{record.pet_age} years</td>
                      <td className="px-6 py-4 font-mono text-sm">{record.permit_number || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status || 'Active')}`}>
                          {record.status || 'Active'}
                        </span>
                      </td>
                      {/* Action icons */}
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
      <AddShippingPermitRecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRecord}
      />

      <EditShippingPermitRecordModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRecord(null);
        }}
        onSubmit={handleEditRecord}
        record={selectedRecord}
      />

      <DeleteShippingPermitRecordModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleDeleteRecord}
        record={selectedRecord}
        loading={deleteLoading}
      />

      <ShippingPermitExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        records={records}
        search={search}
      />
    </div>
  );
};

export default ShippingPermitRecordsPage; 