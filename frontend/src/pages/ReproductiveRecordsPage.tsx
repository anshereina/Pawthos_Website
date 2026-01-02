import React, { useState, useEffect } from 'react';
import { Search, PlusSquare, Upload, Edit, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../features/auth/AuthContext';
import { petService, Pet } from '../services/petService';
import { reproductiveRecordService, CreateReproductiveRecord, ReproductiveRecord } from '../services/reproductiveRecordService';
import AddReproductiveRecordModal from '../components/AddReproductiveRecordModal';
import EditReproductiveRecordModal from '../components/EditReproductiveRecordModal';
import DeletePetModal from '../components/DeletePetModal';
import ViewReproductiveRecordModal from '../components/ViewReproductiveRecordModal';

const FILTERS = [
  { label: 'ALL', value: 'all' },
  { label: 'FELINE', value: 'feline' },
  { label: 'CANINE', value: 'canine' },
];

const TABLE_COLUMNS = [
  'Name',
  "Owner's Name",
  'Contact Number',
  "Owner's Birthday",
  'Species',
  'Date',
  'Date of Birth',
  'Color',
  'Breed',
  'Gender',
  'Reproductive Status',
  'Action',
];

const ReproductiveRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const router = useRouter();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<ReproductiveRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<ReproductiveRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await reproductiveRecordService.list(filter !== 'all' ? filter : undefined, search || undefined);
        setRecords(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load records');
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user, filter, search]);

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const handleBack = () => {
    router.navigate({ to: '/records' });
  };

  const handleAddPet = async (petData: any) => {
    try {
      setLoading(true);
      setError(null);
      await reproductiveRecordService.create(petData as CreateReproductiveRecord);
      const data = await reproductiveRecordService.list(filter !== 'all' ? filter : undefined, search || undefined);
      setRecords(data);
      setIsAddModalOpen(false);
      setSuccessMessage('Record added successfully');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e: any) {
      setError(e.message || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePet = async (id: number, petData: any) => {
    try {
      setLoading(true);
      setError(null);
      await reproductiveRecordService.update(id, petData);
      const data = await reproductiveRecordService.list(filter !== 'all' ? filter : undefined, search || undefined);
      setRecords(data);
      setIsEditModalOpen(false);
      setSelectedPet(null);
      setSuccessMessage('Record updated successfully');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e: any) {
      setError(e.message || 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async () => {
    if (!selectedPet) return;
    
    console.log('Attempting to delete record:', {
      id: selectedPet.id,
      name: selectedPet.name,
      pet_id: selectedPet.pet_id
    });
    
    try {
      setLoading(true);
      setError(null);
      
      // Delete ReproductiveRecord
      await reproductiveRecordService.delete(selectedPet.id);
      
      const data = await reproductiveRecordService.list(filter !== 'all' ? filter : undefined, search || undefined);
      setRecords(data);
      setIsDeleteModalOpen(false);
      setSelectedPet(null);
      setSuccessMessage('Record deleted successfully');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (e: any) {
      console.error('Delete error:', e);
      const errorMessage = e.message || 'Failed to delete record';
      setError(errorMessage);
      // Keep modal open if there's an error so user can see the message
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // const formatAge = (dateOfBirth?: string) => {
  //   const age = petService.calculateAge(dateOfBirth);
  //   if (age === null) return '-';
  //   return age === 1 ? '1 year' : `${age} years';
  // };

  // Derived filtering and pagination
  const filteredPets = records
    .filter(p => {
      if (filter !== 'all' && p.species !== filter) return false;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.owner_name || '').toLowerCase().includes(q) ||
        (p.breed || '').toLowerCase().includes(q)
      );
    });

  // Reset to first page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const totalItems = filteredPets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPetsPage = filteredPets.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const openViewModal = (record: any) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

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
        <PageHeader title="Spay/Neuter Records" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Error / Success */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{successMessage}</div>
          )}

          {/* Top Control Panel */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center">
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      filter === f.value
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                        : 'bg-white text-green-700 border border-green-300 hover:bg-green-50 hover:border-green-400'
                    }`}
                    onClick={() => setFilter(f.value)}
                  >
                    {f.label}
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
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <PlusSquare size={20} />
                  <span className="font-semibold">Add New Record</span>
                </button>
                {/* Export Button */}
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Upload size={20} />
                  <span className="font-semibold">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instructional Note */}
          <div className="mb-4 text-green-700 text-sm font-medium">
            Note: You can view the details by clicking the row.
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
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredPets.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">No records found</td>
                  </tr>
                ) : (
                  currentPetsPage
                    .map((pet, index) => (
                      <tr
                        key={pet.id}
                        onClick={() => openViewModal(pet)}
                        className={`${index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100 cursor-pointer`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">{pet.name}</td>
                        <td className="px-4 py-3">{pet.owner_name || '-'}</td>
                        <td className="px-4 py-3">{pet.contact_number || '-'}</td>
                        <td className="px-4 py-3">{formatDate(pet.owner_birthday)}</td>
                        <td className="px-4 py-3 capitalize">{pet.species}</td>
                        <td className="px-4 py-3">{formatDate(pet.date)}</td>
                        <td className="px-4 py-3">{formatDate(pet.date_of_birth)}</td>
                        <td className="px-4 py-3">{pet.color || '-'}</td>
                        <td className="px-4 py-3">{pet.breed || '-'}</td>
                        <td className="px-4 py-3 capitalize">{pet.gender || '-'}</td>
                        <td className="px-4 py-3 capitalize">{pet.reproductive_status || '-'}</td>
                        <td className="px-4 py-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedPet(pet); setIsEditModalOpen(true); }}
                            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm"
                            title="Edit record"
                          >
                            <Edit size={18} className="text-green-600" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedPet(pet); setIsDeleteModalOpen(true); }}
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
            {filteredPets.length > 0 && totalPages > 1 && (
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
                      const shouldShow = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      if (!shouldShow) {
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
      <AddReproductiveRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPet}
        loading={loading}
      />

      <EditReproductiveRecordModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPet(null);
        }}
        onSubmit={handleUpdatePet}
        record={selectedPet}
        loading={loading}
      />

      <DeletePetModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePet}
        pet={selectedPet}
        loading={loading}
      />

      <ViewReproductiveRecordModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />
    </div>
  );
};

export default ReproductiveRecordsPage;



