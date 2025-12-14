import React, { useState } from 'react';
import { Search, Filter, Upload, Eye, Trash2, Camera } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '@tanstack/react-router';
import PageHeader from '../components/PageHeader';
import { usePainAssessments } from '../hooks/usePainAssessments';
import LoadingSpinner from '../components/LoadingSpinner';
import PainAssessmentDetailsModal from '../components/PainAssessmentDetailsModal';
import DeletePainAssessmentModal from '../components/DeletePainAssessmentModal';
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
  const [selectedAssessment, setSelectedAssessment] = useState<PainAssessment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<PainAssessment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { assessments, loading, error, deleteAssessment, getAssessment } = usePainAssessments();

  // Add custom styles for table scrolling
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .table-scroll-container {
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        scrollbar-color: #d1d5db #f3f4f6;
      }
      .table-scroll-container::-webkit-scrollbar {
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


  if (user === undefined) {
    return <div>Loading...</div>;
  }
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

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
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-end items-center">
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
                {/* Filter Button */}
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg">
                  <Filter size={20} />
                  <span className="font-semibold">Filter</span>
                </button>
                {/* Export Button */}
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg">
                  <Upload size={20} />
                  <span className="font-semibold">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pain Assessment Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="table-scroll-container max-w-full">
              <table className="w-full min-w-[1200px] table-fixed">
                {/* Table Header */}
                <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-sm whitespace-nowrap w-32">Assessment ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm whitespace-nowrap w-48">Pet Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm whitespace-nowrap w-48">Pet Type</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm whitespace-nowrap w-48">Assessment Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm whitespace-nowrap w-48">Pain Level</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm whitespace-nowrap w-48">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm whitespace-nowrap w-32">Action</th>
                  </tr>
                </thead>
                
                {/* Table Body */}
                <tbody>
                  {assessments.length > 0 ? (
                    assessments.map((assessment, i) => (
                                          <tr 
                      key={assessment.id}
                      className={`${
                        i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'
                      } hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 cursor-pointer border-b border-gray-100`}
                      onClick={() => handleRowClick(assessment.id)}
                    >
                        <td className="px-6 py-4 text-gray-900 whitespace-nowrap w-32">{assessment.id}</td>
                        <td className="px-6 py-4 text-gray-900 whitespace-nowrap w-48">{assessment.pet_name}</td>
                        <td className="px-6 py-4 text-gray-900 whitespace-nowrap w-48">{assessment.pet_type}</td>
                        <td className="px-6 py-4 text-gray-900 whitespace-nowrap w-48">
                          <div className="flex items-center space-x-2">
                            <span>{formatAssessmentDate(assessment.assessment_date)}</span>
                            {assessment.image_url && (
                              <div title="Has photo">
                                <Camera size={16} className="text-green-600" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 whitespace-nowrap w-48">{assessment.pain_level}</td>
                        <td className="px-6 py-4 text-gray-900 whitespace-nowrap w-48">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assessment.questions_completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {assessment.questions_completed ? 'Completed' : 'Pending Review'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-32">
                          <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleViewAssessment(assessment.id)}
                              className="p-2.5 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 hover:shadow-sm"
                              title="View assessment"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteAssessment(assessment.id)}
                              className="p-2.5 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:shadow-sm"
                              title="Delete assessment"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No assessments found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
    </div>
  );
};

export default PainAssessmentPage; 