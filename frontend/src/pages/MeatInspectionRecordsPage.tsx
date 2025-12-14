import React, { useState } from 'react';
import { Search, PlusSquare, Upload, Edit, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { useMeatInspectionRecords } from '../hooks/useMeatInspectionRecords';
import { usePostAbattoirRecords } from '../hooks/usePostAbattoirRecords';
import AddPostAbattoirRecordModal from '../components/AddPostAbattoirRecordModal';
import EditPostAbattoirRecordModal from '../components/EditPostAbattoirRecordModal';
import DeletePostAbattoirRecordModal from '../components/DeletePostAbattoirRecordModal';
import AddMeatInspectionRecordModal from '../components/AddMeatInspectionRecordModal';
import EditMeatInspectionRecordModal from '../components/EditMeatInspectionRecordModal';
import DeleteMeatInspectionRecordModal from '../components/DeleteMeatInspectionRecordModal';
import MeatInspectionExportModal from '../components/MeatInspectionExportModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PostAbattoirExportModal from '../components/PostAbattoirExportModal';
import RecordDetailModal from '../components/RecordDetailModal';

const TABLE_COLUMNS = [
  'Date of Inspection',
  'Time',
  'Name of Dealer',
  'Kilo/s',
  'Date of Meat Slaughter',
  'Issued a certificate?',
  'Status',
  'Action',
];

const MeatInspectionRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MIC' | 'POST_ABATTOIR'>('MIC');
  const [search, setSearch] = useState('');
  const [searchPA, setSearchPA] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{ id: number; dealerName: string } | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<any>(null);
  const [detailRecord, setDetailRecord] = useState<any>(null);
  const [showAddPAModal, setShowAddPAModal] = useState(false);
  const [showEditPAModal, setShowEditPAModal] = useState(false);
  const [showDeletePAModal, setShowDeletePAModal] = useState(false);
  const [showPAExportModal, setShowPAExportModal] = useState(false);
  const [paRecordToEdit, setPaRecordToEdit] = useState<any>(null);
  const [paSelected, setPaSelected] = useState<{ id: number; establishment: string } | null>(null);
  
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();
  const { records, loading, error, createRecord, updateRecord, deleteRecord } = useMeatInspectionRecords();
  const { records: paRecords, loading: paLoading, error: paError, createRecord: createPA, updateRecord: updatePA, deleteRecord: deletePA } = usePostAbattoirRecords();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPAPage, setCurrentPAPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const handleBack = () => {
    router.navigate({ to: '/records' });
  };

  const handleAddRecord = async (recordData: any) => {
    try {
      await createRecord(recordData);
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
    setSelectedRecord({ id: record.id, dealerName: record.dealer_name });
    setShowDeleteModal(true);
  };

  // Post Abattoir handlers
  const handleAddPARecord = async (data: any) => { await createPA(data); };
  const handleUpdatePARecord = async (id: number, data: any) => { await updatePA(id, data); };
  const handleDeletePARecord = async () => { if (paSelected) { await deletePA(paSelected.id); } };
  const openEditPAModal = (record: any) => { setPaRecordToEdit(record); setShowEditPAModal(true); };
  const openDeletePAModal = (record: any) => { setPaSelected({ id: record.id, establishment: record.establishment }); setShowDeletePAModal(true); };

  // Filter records based on search
  const filteredRecords = records.filter(record => {
    return search === '' || 
      record.dealer_name.toLowerCase().includes(search.toLowerCase()) ||
      record.inspector_name?.toLowerCase().includes(search.toLowerCase()) ||
      record.remarks?.toLowerCase().includes(search.toLowerCase());
  });

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Reset Post Abattoir page when search changes
  React.useEffect(() => {
    setCurrentPAPage(1);
  }, [searchPA]);

  // Reset pagination when switching tabs
  React.useEffect(() => {
    if (activeTab === 'MIC') {
      setCurrentPage(1);
    } else {
      setCurrentPAPage(1);
    }
  }, [activeTab]);

  // Filter Post Abattoir by search
  const filteredPA = paRecords.filter(r => {
    return searchPA === '' || r.establishment.toLowerCase().includes(searchPA.toLowerCase()) || r.barangay.toLowerCase().includes(searchPA.toLowerCase());
  });

  // Post Abattoir Pagination
  const totalPAItems = filteredPA.length;
  const totalPAPages = Math.ceil(totalPAItems / itemsPerPage) || 1;
  const startPAIndex = (currentPAPage - 1) * itemsPerPage;
  const endPAIndex = startPAIndex + itemsPerPage;
  const currentPARows = filteredPA.slice(startPAIndex, endPAIndex);
  const handlePAPageChange = (page: number) => setCurrentPAPage(page);
  const handlePAPreviousPage = () => currentPAPage > 1 && setCurrentPAPage(currentPAPage - 1);
  const handlePANextPage = () => currentPAPage < totalPAPages && setCurrentPAPage(currentPAPage + 1);

  // Pagination
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRows = filteredRecords.slice(startIndex, endIndex);
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'text-green-600 bg-green-100';
      case 'Rejected':
        return 'text-red-600 bg-red-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if ((activeTab === 'MIC' && loading) || (activeTab === 'POST_ABATTOIR' && paLoading)) {
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
        <PageHeader title="Meat Inspection Records" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Tabs */}
          <div className="mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('MIC')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab==='MIC'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                    : 'bg-white text-green-700 border border-green-300 hover:bg-green-50 hover:border-green-400'
                }`}
              >
                Meat Inspection Certificate
              </button>
              <button
                onClick={() => setActiveTab('POST_ABATTOIR')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab==='POST_ABATTOIR'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                    : 'bg-white text-green-700 border border-green-300 hover:bg-green-50 hover:border-green-400'
                }`}
              >
                Post Abattoir Inspection
              </button>
            </div>
          </div>

          {/* Error Display */}
          {(activeTab==='MIC' ? error : paError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <span className="text-red-700">{activeTab==='MIC' ? error : paError}</span>
            </div>
          )}

          {/* Top Control Panel */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center">
              {/* Left side - can be used for future features */}
              <div className="flex space-x-2">
                {/* Tabs are above */}
              </div>
              {/* Search and Actions */}
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  <input
                    type="text"
                    placeholder="Search here"
                    value={activeTab==='MIC' ? search : searchPA}
                    onChange={e => activeTab==='MIC' ? setSearch(e.target.value) : setSearchPA(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 hover:border-green-300"
                  />
                </div>
                {/* Add New Record Button */}
                <button 
                  onClick={() => activeTab==='MIC' ? setShowAddModal(true) : setShowAddPAModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <PlusSquare size={20} />
                  <span className="font-semibold">Add New Record</span>
                </button>
                {activeTab==='MIC' && (
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Upload size={20} />
                    <span className="font-semibold">Export</span>
                  </button>
                )}
                {activeTab==='POST_ABATTOIR' && (
                  <button 
                    onClick={() => setShowPAExportModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Upload size={20} />
                    <span className="font-semibold">Export</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Instructional Note */}
          <div className="mb-4 text-green-700 text-sm font-medium">
            Note: You can view the details by clicking the row.
          </div>

          {activeTab==='MIC' ? (
          /* Meat Inspection Records Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                <tr>
                  {TABLE_COLUMNS.map(col => (
                    <th key={col} className="px-4 py-3 text-left font-semibold text-sm">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">
                      No meat inspection records found
                    </td>
                  </tr>
                ) : (
                  currentRows.map((record, index) => (
                    <tr
                      key={record.id}
                      className={`${index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100 cursor-pointer`}
                      onClick={() => setDetailRecord({ type: 'MIC', data: record })}
                    >
                      <td className="px-4 py-3">{formatDate(record.date_of_inspection)}</td>
                      <td className="px-4 py-3">{formatTime(record.time)}</td>
                      <td className="px-4 py-3 font-medium">{record.dealer_name}</td>
                      <td className="px-4 py-3">{record.kilos} kg</td>
                      <td className="px-4 py-3">{formatDate(record.date_of_slaughter)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.certificate_issued 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-red-600 bg-red-100'
                        }`}>
                          {record.certificate_issued ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
          ) : (
          /* Post Abattoir Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                <tr>
                  {['Date','Time','Barangay','Establishment','Action'].map(col => (
                    <th key={col} className="px-4 py-3 text-left font-semibold text-sm">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentPARows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No post abattoir records found</td>
                  </tr>
                ) : (
                  currentPARows.map((r, index) => (
                    <tr key={r.id} className={`${index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100 cursor-pointer`} onClick={() => setDetailRecord({ type: 'PA', data: r })}>
                      <td className="px-4 py-3">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{r.time}</td>
                      <td className="px-4 py-3">{r.barangay}</td>
                      <td className="px-4 py-3 font-medium">{r.establishment}</td>
                      <td className="px-4 py-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => { e.stopPropagation(); openEditPAModal(r); }} className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm" title="Edit record">
                          <Edit size={18} className="text-green-800" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openDeletePAModal(r); }} className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm" title="Delete record">
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Post Abattoir Pagination Controls */}
            {totalPAItems > 0 && (
              <div className="bg-white px-4 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Showing {startPAIndex + 1} to {Math.min(endPAIndex, totalPAItems)} of {totalPAItems} results
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePAPreviousPage}
                    disabled={currentPAPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPAPage === 1
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
                    }`}
                  >
                    Previous
                  </button>
                  {totalPAPages > 1 && (
                    <>
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPAPages }, (_, i) => i + 1).map((page) => {
                          const shouldShow = page === 1 || page === totalPAPages || (page >= currentPAPage - 1 && page <= currentPAPage + 1);
                          if (!shouldShow) {
                            if (page === 2 && currentPAPage > 4) return (<span key={`ellipsis-start`} className="px-3 py-2 text-gray-400">...</span>);
                            if (page === totalPAPages - 1 && currentPAPage < totalPAPages - 3) return (<span key={`ellipsis-end`} className="px-3 py-2 text-gray-400">...</span>);
                            return null;
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => handlePAPageChange(page)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentPAPage === page ? 'bg-green-600 text-white' : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={handlePANextPage}
                        disabled={currentPAPage === totalPAPages}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPAPage === totalPAPages
                            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                            : 'text-green-700 bg-white border border-green-300 hover:bg-green-50'
                        }`}
                      >
                        Next
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddMeatInspectionRecordModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRecord}
      />

      <EditMeatInspectionRecordModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setRecordToEdit(null);
        }}
        onSubmit={handleUpdateRecord}
        record={recordToEdit}
      />

      <DeleteMeatInspectionRecordModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRecord}
        recordId={selectedRecord?.id || 0}
        dealerName={selectedRecord?.dealerName || ''}
      />

      <MeatInspectionExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        records={records}
        search={search}
      />

      {/* Post Abattoir Modals */}
      <AddPostAbattoirRecordModal
        isOpen={showAddPAModal}
        onClose={() => setShowAddPAModal(false)}
        onSubmit={handleAddPARecord}
      />
      <EditPostAbattoirRecordModal
        isOpen={showEditPAModal}
        onClose={() => { setShowEditPAModal(false); setPaRecordToEdit(null); }}
        onSubmit={handleUpdatePARecord}
        record={paRecordToEdit}
      />
      <DeletePostAbattoirRecordModal
        isOpen={showDeletePAModal}
        onClose={() => setShowDeletePAModal(false)}
        onConfirm={handleDeletePARecord}
        establishment={paSelected?.establishment || ''}
      />
      <PostAbattoirExportModal
        isOpen={showPAExportModal}
        onClose={() => setShowPAExportModal(false)}
        records={paRecords}
        search={searchPA}
      />

      <RecordDetailModal
        isOpen={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        type={detailRecord?.type}
        data={detailRecord?.data}
      />
    </div>
  );
};

export default MeatInspectionRecordsPage; 