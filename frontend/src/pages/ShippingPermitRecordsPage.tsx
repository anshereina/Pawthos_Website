import React, { useState } from 'react';
import { Search, PlusSquare, Upload, Edit, Trash2, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { useShippingPermitRecords } from '../hooks/useShippingPermitRecords';
import AddShippingPermitRecordModal from '../components/AddShippingPermitRecordModal';
import EditShippingPermitRecordModal from '../components/EditShippingPermitRecordModal';
import DeleteShippingPermitRecordModal from '../components/DeleteShippingPermitRecordModal';
import ShippingPermitExportModal from '../components/ShippingPermitExportModal';
import ViewShippingPermitRecordModal from '../components/ViewShippingPermitRecordModal';
import LoadingSpinner from '../components/LoadingSpinner';

const TABLE_COLUMNS = [
  'Owner Name',
  'Contact Number',
  'Pet Name',
  'Species',
  'Purpose',
  'Issue Date',
  'Destination',
  'Status',
  'Action',
];

const VetHealthRecordsPage: React.FC = () => {
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
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

  const openViewModal = (record: any) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Recovered':
        return 'bg-blue-100 text-blue-800';
      case 'Under Treatment':
        return 'bg-yellow-100 text-yellow-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'Discharged':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Pagination
  const totalItems = records.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = records.slice(startIndex, endIndex);
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

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
        <PageHeader title="Vet Health Records" />

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
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center">
              {/* Left side - can be used for future features */}
              <div className="flex space-x-2">
                {/* Future tabs or filters can go here */}
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

          {/* Records Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
            <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
              <table className="w-full">
              <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                <tr>
                  {TABLE_COLUMNS.map(col => (
                    <th key={col} className="px-4 py-3 text-left font-semibold text-sm">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-8 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : totalItems === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">
                      No vet health records found
                    </td>
                  </tr>
                ) : (
                  currentRows.map((record, index) => (
                    <tr
                      key={record.id}
                      onClick={() => openViewModal(record)}
                      className={`${index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100 cursor-pointer`}
                    >
                      <td className="px-4 py-3 font-medium">{record.owner_name}</td>
                      <td className="px-4 py-3">{record.contact_number || '-'}</td>
                      <td className="px-4 py-3">{record.pet_name}</td>
                      <td className="px-4 py-3 capitalize">{record.pet_species || '-'}</td>
                      <td className="px-4 py-3">{record.purpose || '-'}</td>
                      <td className="px-4 py-3">{formatDate(record.issue_date)}</td>
                      <td className="px-4 py-3">{record.destination || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status || 'Active')}`}>
                          {record.status || 'Active'}
                        </span>
                      </td>
                      {/* Action icons */}
                      <td className="px-4 py-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => openEditModal(record)}
                          className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm"
                          title="Edit record"
                        >
                          <Edit size={18} className="text-green-800" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(record)}
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
            </div>
            {/* Pagination Controls */}
            {totalItems > 0 && totalPages > 1 && (
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

      <ViewShippingPermitRecordModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
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

export default VetHealthRecordsPage; 