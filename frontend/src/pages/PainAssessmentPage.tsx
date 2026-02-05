import React, { useState } from 'react';
import { Search, Upload, Eye, Trash2, Camera } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { usePainAssessments } from '../hooks/usePainAssessments';
import LoadingSpinner from '../components/LoadingSpinner';
import PainAssessmentDetailsModal from '../components/PainAssessmentDetailsModal';
import DeletePainAssessmentModal from '../components/DeletePainAssessmentModal';
import PainAssessmentExportModal from '../components/PainAssessmentExportModal';
import { PainAssessment } from '../services/painAssessmentService';

// Function to format assessment date to show only date or shorter time
const formatAssessmentDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Handle date strings that might be in local time without timezone info
    let date: Date;
    
    // If the string contains a space (date and time), assume it's local time
    if (dateString.includes(' ')) {
      // Parse as local time by adding timezone offset
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      
      // Create date in local timezone
      date = new Date(year, month - 1, day, hours, minutes, seconds || 0);
    } else {
      // Fallback to standard parsing
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    // Format as MM/DD/YYYY HH:MM (shorter time format)
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};



// const TABLE_COLUMNS = [
//   'Assessment ID',
//   'Pet Name',
//   'Pet Type',
//   'Assessment Date',
//   'Pain Level',
//   'Status',
//   'Action',
// ];

const PainAssessmentPage: React.FC = () => {
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'feline' | 'canine'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedAssessment, setSelectedAssessment] = useState<PainAssessment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<PainAssessment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { assessments, loading, error, deleteAssessment, getAssessment } = usePainAssessments();

  // Add custom styles for table scrolling
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .table-scroll-container {
        overflow-x: auto;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        scrollbar-color: #d1d5db #f3f4f6;
      }
      .table-scroll-container::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .table-scroll-container::-webkit-scrollbar-track {
        background: #f3f4f6;
        border-radius: 4px;
      }
      .table-scroll-container::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 4px;
      }
      .table-scroll-container::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  React.useEffect(() => {
    if (user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router]);

  // Reset to first page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  if (user === undefined) {
    return <div>Loading...</div>;
  }
  if (user === null) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans w-full">
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


  const handleViewAssessment = async (assessmentId: number) => {
    try {
      const assessment = await getAssessment(assessmentId);
      setSelectedAssessment(assessment);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching assessment details:', error);
    }
  };

  const handleRowClick = async (assessmentId: number) => {
    await handleViewAssessment(assessmentId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAssessment(null);
  };

  const handleDeleteAssessment = async (assessmentId: number) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (assessment) {
      setAssessmentToDelete(assessment);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async (assessmentId: number) => {
    try {
      await deleteAssessment(assessmentId);
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleDeleteSuccess = () => {
    // Success is handled by the modal
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setAssessmentToDelete(null);
  };

  // Filter and sort assessments based on search and filter
  const filteredAssessments = assessments
    .filter(assessment => {
      // Filter by pet type
      if (filter !== 'all') {
        const petTypeLower = (assessment.pet_type || '').toLowerCase();
        if (filter === 'feline' && !petTypeLower.includes('cat') && !petTypeLower.includes('feline')) {
          return false;
        }
        if (filter === 'canine' && !petTypeLower.includes('dog') && !petTypeLower.includes('canine')) {
          return false;
        }
      }
      
      // Filter by search term
      const searchLower = search.toLowerCase();
      return (
        assessment.pet_name?.toLowerCase().includes(searchLower) ||
        assessment.pet_type?.toLowerCase().includes(searchLower) ||
        assessment.pain_level?.toLowerCase().includes(searchLower) ||
        assessment.id.toString().includes(searchLower)
      );
    })
    .sort((a, b) => {
      // Sort by date (newest first)
      // Try created_at first, then assessment_date, then id as fallback
      const dateA = a.created_at || a.assessment_date || '';
      const dateB = b.created_at || b.assessment_date || '';
      
      if (dateA && dateB) {
        const timeA = new Date(dateA).getTime();
        const timeB = new Date(dateB).getTime();
        // Return negative if A is newer (should come first)
        return timeB - timeA;
      }
      
      // Fallback to ID (higher ID = newer, so should come first)
      return (b.id || 0) - (a.id || 0);
    });

  // Pagination calculations
  const totalItems = filteredAssessments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssessmentsPage = filteredAssessments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

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
        <PageHeader title="Pain Assessment" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {/* Top Control Panel */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center">
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
                {/* Export Button */}
                <button 
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg relative z-10"
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

          {/* Filter Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-green-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({assessments.length})
              </button>
              <button
                onClick={() => setFilter('feline')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'feline'
                    ? 'bg-green-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cats ({assessments.filter(a => {
                  const petType = (a.pet_type || '').toLowerCase();
                  return petType.includes('cat') || petType.includes('feline');
                }).length})
              </button>
              <button
                onClick={() => setFilter('canine')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'canine'
                    ? 'bg-green-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dogs ({assessments.filter(a => {
                  const petType = (a.pet_type || '').toLowerCase();
                  return petType.includes('dog') || petType.includes('canine');
                }).length})
              </button>
            </div>
          </div>

          {/* Pain Assessment Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
            {loading ? (
              <div className="p-6 text-center">Loading...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : (
              <>
                <div className="table-scroll-container max-w-full max-h-[calc(100vh-400px)]">
              <table className="w-full min-w-[1200px] table-fixed">
                {/* Table Header */}
                <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                  <tr>
                        <th className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap w-32">Assessment ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap w-48">Pet Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap w-48">Pet Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap w-48">Assessment Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap w-48">Pain Level</th>
                        <th className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap w-32">Action</th>
                  </tr>
                </thead>
                
                {/* Table Body */}
                <tbody>
                      {currentAssessmentsPage.length > 0 ? (
                        currentAssessmentsPage.map((assessment, i) => (
                                          <tr 
                      key={assessment.id}
                      className={`${
                        i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'
                      } hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 cursor-pointer border-b border-gray-100`}
                      onClick={() => handleRowClick(assessment.id)}
                    >
                            <td className="px-4 py-3 text-gray-900 whitespace-nowrap w-32">{assessment.id}</td>
                            <td className="px-4 py-3 text-gray-900 whitespace-nowrap w-48">{assessment.pet_name}</td>
                            <td className="px-4 py-3 text-gray-900 whitespace-nowrap w-48 capitalize">{assessment.pet_type}</td>
                            <td className="px-4 py-3 text-gray-900 whitespace-nowrap w-48">
                          <div className="flex items-center space-x-2">
                            <span>{formatAssessmentDate(assessment.assessment_date)}</span>
                            {assessment.image_url && (
                              <div title="Has photo">
                                <Camera size={16} className="text-green-600" />
                              </div>
                            )}
                          </div>
                        </td>
                            <td className="px-4 py-3 text-gray-900 whitespace-nowrap w-48">{assessment.pain_level}</td>
                            <td className="px-4 py-3 whitespace-nowrap w-32" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewAssessment(assessment.id)}
                                  className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300"
                              title="View assessment"
                            >
                                  <Eye size={16} className="text-green-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteAssessment(assessment.id)}
                                  className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300"
                              title="Delete assessment"
                            >
                                  <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No assessments found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                        onClick={() => handlePreviousPage()}
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
                        onClick={() => handleNextPage()}
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
              </>
            )}
          </div>
        </main>
      </div>

      {/* Pain Assessment Details Modal */}
      <PainAssessmentDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        assessment={selectedAssessment}
      />

      {/* Delete Pain Assessment Modal */}
      <DeletePainAssessmentModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onSuccess={handleDeleteSuccess}
        assessment={assessmentToDelete}
        onDelete={handleDeleteConfirm}
      />

      {/* Export Pain Assessment Modal */}
      <PainAssessmentExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        assessments={assessments}
        filteredAssessments={filteredAssessments}
      />
    </div>
  );
};

export default PainAssessmentPage; 