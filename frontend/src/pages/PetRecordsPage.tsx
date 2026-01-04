import React, { useState, useEffect } from 'react';
import { PlusSquare, Search, Edit, Trash2, ArrowLeft, Calendar, CheckSquare, UserCircle, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useAuth } from '../features/auth/AuthContext';
import PageHeader from '../components/PageHeader';
import { useRouter } from '@tanstack/react-router';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';
import { usePets } from '../hooks/usePets';
import { Pet } from '../services/petService';
import { medicalRecordService, MedicalRecord } from '../services/medicalRecordService';
import { vaccinationRecordService, VaccinationRecord } from '../services/vaccinationRecordService';
import { API_BASE_URL } from '../config';
import AddPetModal from '../components/AddPetModal';
import EditPetModal from '../components/EditPetModal';
import DeletePetModal from '../components/DeletePetModal';
import AddVaccinationRecordModal from '../components/AddVaccinationRecordModal';
import EditVaccinationRecordModal from '../components/EditVaccinationRecordModal';
import DeleteVaccinationRecordModal from '../components/DeleteVaccinationRecordModal';
import AddMedicalRecordModal from '../components/AddMedicalRecordModal';
import EditMedicalRecordModal from '../components/EditMedicalRecordModal';
import DeleteMedicalRecordModal from '../components/DeleteMedicalRecordModal';
import ViewMedicalRecordModal from '../components/ViewMedicalRecordModal';

const FILTERS = [
  { label: 'ALL', value: 'all' },
  { label: 'CANINE', value: 'canine' },
  { label: 'FELINE', value: 'feline' },
];

const TABLE_COLUMNS = [
  'Pet ID',
  "Name",
  "Owner's Name",
  "Owner's Birthday",
  "Species",
  "Pet's Date of Birth",
  "Age",
  "Color",
  "Breed",
  "Gender",
  "Reproductive Status",
  "Action",
];

const PetRecordsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showProfile, setShowProfile] = useState(false);
  const [showVaccinationCard, setShowVaccinationCard] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [vaccinationSearch, setVaccinationSearch] = useState('');
  const [medicalHistorySearch, setMedicalHistorySearch] = useState('');
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [medicalRecordsLoading, setMedicalRecordsLoading] = useState(false);
  const [vaccinationRecordsLoading, setVaccinationRecordsLoading] = useState(false);
  const [isAddMedicalRecordModalOpen, setIsAddMedicalRecordModalOpen] = useState(false);
  const [isEditMedicalRecordModalOpen, setIsEditMedicalRecordModalOpen] = useState(false);
  const [isDeleteMedicalRecordModalOpen, setIsDeleteMedicalRecordModalOpen] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecord | null>(null);
  const [isViewMedicalRecordModalOpen, setIsViewMedicalRecordModalOpen] = useState(false);
  const [isAddVaccinationRecordModalOpen, setIsAddVaccinationRecordModalOpen] = useState(false);
  const [isEditVaccinationRecordModalOpen, setIsEditVaccinationRecordModalOpen] = useState(false);
  const [isDeleteVaccinationRecordModalOpen, setIsDeleteVaccinationRecordModalOpen] = useState(false);
  const [selectedVaccinationRecord, setSelectedVaccinationRecord] = useState<VaccinationRecord | null>(null);
  const [medicalRecordError, setMedicalRecordError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const { pets, loading, error, successMessage, fetchPets, createPet, updatePet, deletePet } = usePets();

  React.useEffect(() => {
    if (user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      fetchPets(filter !== 'all' ? filter : undefined, search || undefined);
    }
  }, [user, filter, search, fetchPets]);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
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

  // Pagination logic
  const totalItems = pets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPets = pets.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Add useEffect to fetch medical records from backend when showMedicalHistory and selectedPet are set
  React.useEffect(() => {
    if (showMedicalHistory && selectedPet) {
      setMedicalRecordsLoading(true);
      medicalRecordService.getMedicalRecordsByPet(selectedPet.id)
        .then(records => {
          console.log('useEffect fetched medical records:', records);
          setMedicalRecords(records);
        })
        .catch((error) => {
          console.error('Error fetching medical records in useEffect:', error);
          setMedicalRecords([]);
        })
        .finally(() => setMedicalRecordsLoading(false));
    }
  }, [showMedicalHistory, selectedPet]);

  // Add useEffect to fetch vaccination records from backend when showVaccinationCard and selectedPet are set
  React.useEffect(() => {
    if (showVaccinationCard && selectedPet) {
      setVaccinationRecordsLoading(true);
      vaccinationRecordService.getVaccinationRecordsByPet(selectedPet.id)
        .then(records => {
          console.log('useEffect fetched vaccination records:', records);
          setVaccinationRecords(records);
        })
        .catch((error) => {
          console.error('Error fetching vaccination records in useEffect:', error);
          setVaccinationRecords([]);
        })
        .finally(() => setVaccinationRecordsLoading(false));
    }
  }, [showVaccinationCard, selectedPet]);

  // Refetch vaccination records when page becomes visible (user switches back to browser tab/window)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && showVaccinationCard && selectedPet) {
        console.log('🔄 Refetching vaccination records (page became visible)');
        vaccinationRecordService.getVaccinationRecordsByPet(selectedPet.id)
          .then(records => {
            setVaccinationRecords(records);
          })
          .catch((error) => {
            console.error('Error refetching vaccination records:', error);
          });
      }
    };

    const handleFocus = () => {
      if (showVaccinationCard && selectedPet) {
        console.log('🔄 Refetching vaccination records (window focused)');
        vaccinationRecordService.getVaccinationRecordsByPet(selectedPet.id)
          .then(records => {
            setVaccinationRecords(records);
          })
          .catch((error) => {
            console.error('Error refetching vaccination records:', error);
          });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [showVaccinationCard, selectedPet]);



  if (user === undefined) {
    return <div>Loading...</div>;
  }
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };


  // Handler for clicking Pet ID
  const handlePetIdClick = (petId: string) => {
    const pet = pets.find((p) => p.pet_id === petId);
    setSelectedPet(pet || null);
    setShowProfile(true);
  };

  const handleBackToTable = () => {
    setShowProfile(false);
    setSelectedPet(null);
    setShowVaccinationCard(false);
    setShowMedicalHistory(false);
  };

  const handleVaccineCardClick = () => {
    if (selectedPet) {
      setShowVaccinationCard(true);
      setShowMedicalHistory(false);
      // Records will be fetched automatically by the useEffect when showVaccinationCard changes
    }
  };

  const handleMedicalHistoryClick = () => {
    setShowMedicalHistory(true);
  };

  const handleBackToProfile = () => {
    setShowVaccinationCard(false);
    setShowMedicalHistory(false);
  };

  const handleAddNewRecord = () => {
    setIsAddVaccinationRecordModalOpen(true);
  };

  const handleAddNewMedicalRecord = () => {
    setMedicalRecordError(null);
    setIsAddMedicalRecordModalOpen(true);
  };

  const handleEditMedicalRecord = (record: any) => {
    setSelectedMedicalRecord(record);
    setIsEditMedicalRecordModalOpen(true);
  };

  const handleDeleteMedicalRecord = (record: any) => {
    setSelectedMedicalRecord(record);
    setIsDeleteMedicalRecordModalOpen(true);
  };

  const handleViewMedicalRecord = (record: any) => {
    setSelectedMedicalRecord(record);
    setIsViewMedicalRecordModalOpen(true);
  };

  const handleAddMedicalRecord = async (recordData: any) => {
    if (!selectedPet) return;
    setMedicalRecordError(null);
    try {
      setMedicalRecordsLoading(true);
      // Map modal fields to backend API fields
      const mappedData = {
        reason_for_visit: recordData.reasonForVisit,
        date_visited: recordData.dateOfVisit,
        date_of_next_visit: recordData.nextVisit || undefined,
        procedures_done: recordData.procedureDone,
        findings: recordData.findings,
        recommendations: recordData.recommendation,
        medications: recordData.vaccineUsedMedication,
      };
      console.log('Creating medical record with data:', mappedData);
      console.log('Pet ID:', selectedPet.id);
      
      const createdRecord = await medicalRecordService.createMedicalRecord(selectedPet.id, mappedData);
      console.log('Medical record created successfully:', createdRecord);
      
      // Refetch medical records from backend to ensure we have the latest data
      const records = await medicalRecordService.getMedicalRecordsByPet(selectedPet.id);
      console.log('Refetched medical records:', records);
      setMedicalRecords(records);
      setIsAddMedicalRecordModalOpen(false);
      setMedicalRecordError(null);
    } catch (error: any) {
      console.error('Error adding medical record:', error);
      const errorMessage = error?.message || 'Failed to add medical record. Please try again.';
      setMedicalRecordError(errorMessage);
      // Don't close the modal on error - let user see the error and try again
      throw error; // Re-throw so the modal can handle it
    } finally {
      setMedicalRecordsLoading(false);
    }
  };

  const handleUpdateMedicalRecord = async (id: number, recordData: any) => {
    try {
      const updatedRecord = await medicalRecordService.updateMedicalRecord(id, recordData);
      setMedicalRecords(prev => 
        prev.map(record => 
          record.id === id ? updatedRecord : record
        )
      );
      setIsEditMedicalRecordModalOpen(false);
      setSelectedMedicalRecord(null);
    } catch (error) {
      console.error('Error updating medical record:', error);
      // You might want to show an error message to the user
    }
  };

  const handleConfirmDeleteMedicalRecord = async () => {
    if (!selectedMedicalRecord || !selectedPet) return;
    try {
      setMedicalRecordsLoading(true);
      await medicalRecordService.deleteMedicalRecord(selectedMedicalRecord.id);
      const records = await medicalRecordService.getMedicalRecordsByPet(selectedPet.id);
      setMedicalRecords(records);
      setIsDeleteMedicalRecordModalOpen(false);
      setSelectedMedicalRecord(null);
    } catch (error) {
      console.error('Error deleting medical record:', error);
    } finally {
      setMedicalRecordsLoading(false);
    }
  };

  // Vaccination Record Handlers
  const handleAddVaccinationRecord = async (recordData: any) => {
    if (!selectedPet) return;
    console.log('Selected pet for vaccination record:', selectedPet); // Debug log
    try {
      setVaccinationRecordsLoading(true);
      // Map modal fields to backend API fields (schema expects date_given and next_due_date)
      const mappedData = {
        date_given: recordData.dateOfVaccination ? recordData.dateOfVaccination : undefined, // Schema expects date_given
        vaccine_name: recordData.vaccineUsed,
        batch_lot_no: recordData.batchNumber,
        next_due_date: recordData.dateOfNextVaccination ? recordData.dateOfNextVaccination : undefined, // Schema expects next_due_date
        veterinarian: recordData.veterinarianLicenseNumber,
      };
      console.log('Sending vaccination record data:', mappedData); // Debug log
      await vaccinationRecordService.createVaccinationRecord(selectedPet.id, mappedData); // Use numeric id
      // Refetch records from backend
      const records = await vaccinationRecordService.getVaccinationRecordsByPet(selectedPet.id); // Use numeric id
      console.log('Fetched vaccination records:', records); // Debug log
      setVaccinationRecords(records);
      setIsAddVaccinationRecordModalOpen(false);
    } catch (error: any) {
      console.error('Error adding vaccination record:', error);
      const errorMessage = error?.message || 'Failed to add vaccination record. Please try again.';
      alert(errorMessage); // Show error to user
    } finally {
      setVaccinationRecordsLoading(false);
    }
  };

  const handleEditVaccinationRecord = (record: any) => {
    setSelectedVaccinationRecord(record);
    setIsEditVaccinationRecordModalOpen(true);
  };

  const handleDeleteVaccinationRecord = (record: any) => {
    setSelectedVaccinationRecord(record);
    setIsDeleteVaccinationRecordModalOpen(true);
  };

  const handleUpdateVaccinationRecord = async (id: number, recordData: any) => {
    if (!selectedPet) return;
    try {
      setVaccinationRecordsLoading(true);
      // Map modal fields to backend API fields (schema expects date_given and next_due_date)
      // EditVaccinationRecordModal uses: vaccineName, vaccinationDate, expirationDate, veterinarian, batchLotNo
      const mappedData = {
        date_given: recordData.vaccinationDate ? recordData.vaccinationDate : undefined, // Schema expects date_given
        vaccine_name: recordData.vaccineName,
        batch_lot_no: recordData.batchLotNo,
        next_due_date: recordData.expirationDate ? recordData.expirationDate : undefined, // Schema expects next_due_date
        veterinarian: recordData.veterinarian,
      };
      await vaccinationRecordService.updateVaccinationRecord(id, mappedData);
      // Refetch records from backend
      const records = await vaccinationRecordService.getVaccinationRecordsByPet(selectedPet.id);
      setVaccinationRecords(records);
      setIsEditVaccinationRecordModalOpen(false);
      setSelectedVaccinationRecord(null);
    } catch (error) {
      console.error('Error updating vaccination record:', error);
    } finally {
      setVaccinationRecordsLoading(false);
    }
  };

  const handleConfirmDeleteVaccinationRecord = async () => {
    if (selectedVaccinationRecord && selectedPet) {
      try {
        setVaccinationRecordsLoading(true);
        await vaccinationRecordService.deleteVaccinationRecord(selectedVaccinationRecord.id);
        // Refetch records from backend
        const records = await vaccinationRecordService.getVaccinationRecordsByPet(selectedPet.id);
        setVaccinationRecords(records);
        setIsDeleteVaccinationRecordModalOpen(false);
        setSelectedVaccinationRecord(null);
      } catch (error) {
        console.error('Error deleting vaccination record:', error);
      } finally {
        setVaccinationRecordsLoading(false);
      }
    }
  };

  const handleAddPet = async (petData: any) => {
    await createPet(petData);
    await fetchPets(filter !== 'all' ? filter : undefined, search || undefined); // Refetch pets after add
    setIsAddModalOpen(false);
  };

  const handleUpdatePet = async (petId: string, petData: any) => {
    await updatePet(petId, petData);
    await fetchPets(filter !== 'all' ? filter : undefined, search || undefined); // Refetch pets after update
  };

  const handleDeletePet = async () => {
    if (selectedPet) {
      console.log('selectedPet object:', selectedPet);
      console.log('selectedPet.pet_id:', selectedPet.pet_id);
      console.log('selectedPet.id:', selectedPet.id);
      console.log('selectedPet.name:', selectedPet.name);
      
      try {
        await deletePet(selectedPet.pet_id);
        setIsDeleteModalOpen(false);
        setSelectedPet(null);
        // The success will be shown through the error/success state in the UI
      } catch (error) {
        // Error is already handled in the usePets hook
        console.error('Delete failed:', error);
      }
    }
  };

  const openEditModal = (pet: Pet) => {
    setSelectedPet(pet);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (pet: Pet) => {
    console.log('openDeleteModal called with pet:', pet);
    console.log('pet.pet_id:', pet.pet_id);
    console.log('pet.name:', pet.name);
    setSelectedPet(pet);
    setIsDeleteModalOpen(true);
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '-';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (today.getDate() < birthDate.getDate()) {
      months--;
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 1) {
      // Less than a year old, show months
      const totalMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
      return totalMonths <= 1 ? `${totalMonths} month` : `${totalMonths} months`;
    }
    return years === 1 ? '1 year' : `${years} years`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // const calculateAgeForProfile = (dateOfBirth?: string) => {
  //   if (!dateOfBirth) return '-';
  //   try {
  //     const birthDate = new Date(dateOfBirth);
  //     const today = new Date();
  //     let age = today.getFullYear() - birthDate.getFullYear();
  //     const monthDiff = today.getMonth() - birthDate.getMonth();
  //     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
  //       age--;
  //     }
  //     return `${age} years`;
  //   } catch {
  //     return '-';
  //   }
  // };

  const formatDateForProfile = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString();
    } catch {
      return '-';
    }
  };

  // Helper function to construct full photo URL for display
  const getPhotoUrlForDisplay = (photoUrl?: string): string | undefined => {
    if (!photoUrl) return undefined;
    
    // If it's already a full URL, return as is
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    
    // If it's a relative path, construct full URL
    // Remove any /api prefix from API_BASE_URL if present
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    
    // Ensure photoUrl starts with /
    const path = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
    
    return `${baseUrl}${path}`;
  };

  // Pet Profile Section
  const PetProfileSection = () => {
    if (!selectedPet) return null;

    // Debug logging for photo URL
    console.log('=== PET PHOTO DEBUG ===');
    console.log('Selected Pet:', selectedPet);
    console.log('Photo URL from database:', selectedPet.photo_url);
    console.log('Constructed Photo URL:', getPhotoUrlForDisplay(selectedPet.photo_url));
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Reproductive Status:', selectedPet.reproductive_status);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans overflow-y-auto">
        {/* Header */}
        <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackToTable}
              className="text-green-800 hover:text-green-900 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Pet Profile</h1>
          </div>
          <div className="relative user-info-area">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <UserCircle size={36} className="text-green-700" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-gray-900 leading-tight">{user?.name || ''}</span>
                <span className="text-xs text-gray-500 -mt-1">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</span>
              </div>
              <ChevronDown size={18} className="text-gray-500 ml-1" />
            </div>
            {isDropdownOpen && (
              <div className="user-dropdown-menu absolute right-0 mt-3 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50 top-full backdrop-blur-sm">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{user?.name || ''}</p>
                  <p className="text-xs text-green-600">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</p>
                </div>
                <button
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200"
                  onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <User size={16} className="text-green-600" />
                  </div>
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
                  onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Settings size={16} className="text-blue-600" />
                  </div>
                  <span className="font-medium">Account Settings</span>
                </button>
                <div className="border-t border-gray-100 my-2"></div>
                <button
                  className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200"
                  onClick={() => { setShowLogoutModal(true); setIsDropdownOpen(false); }}
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <LogOut size={16} className="text-red-600" />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Profile Section */}
        <section className="bg-gray-50 px-6 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
            {/* Left: Photo and Basic Info */}
            <div className="flex flex-col items-center gap-6 min-w-[280px]">
              {/* Photo Holder */}
              <div className="w-48 h-64 bg-white border-2 border-green-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                {selectedPet.photo_url ? (
                  <img 
                    src={getPhotoUrlForDisplay(selectedPet.photo_url)} 
                    alt={`${selectedPet.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load pet image:', selectedPet.photo_url);
                      console.error('Attempted URL:', getPhotoUrlForDisplay(selectedPet.photo_url));
                      // Show placeholder on error
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent && !parent.querySelector('.fallback-text')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'fallback-text text-gray-400 text-lg font-semibold flex flex-col items-center justify-center w-full h-full';
                        fallback.innerHTML = `
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>No Photo</span>
                        `;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-lg font-semibold flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>No Photo</span>
                  </div>
                )}
              </div>
              
              {/* Name and Pet ID */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-green-800 mb-2">{selectedPet.name}</h2>
                <div className="text-sm text-gray-500 font-medium">Pet ID: <span className="font-mono">{selectedPet.pet_id}</span></div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={handleVaccineCardClick}
                  className="w-full px-4 py-2 rounded-lg border border-green-600 text-green-700 bg-white font-semibold hover:bg-green-50 transition-colors"
                >
                  Vaccine Card
                </button>
                <button 
                  onClick={handleMedicalHistoryClick}
                  className="w-full px-4 py-2 rounded-lg border border-green-600 text-green-700 bg-white font-semibold hover:bg-green-50 transition-colors"
                >
                  Medical History
                </button>
              </div>

              {/* Reproductive Status */}
              <div className="w-full">
                <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Reproductive Status</h4>
                <div className="flex justify-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`inline-flex items-center justify-center w-4 h-4 border-2 border-green-800 rounded ${
                      selectedPet.reproductive_status?.toLowerCase() === 'intact' ? 'bg-green-800' : 'bg-white'
                    }`}>
                      {selectedPet.reproductive_status?.toLowerCase() === 'intact' && (
                        <CheckSquare size={14} className="text-white" />
                      )}
                    </span>
                    <span className="text-green-800 font-medium text-sm">Intact</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`inline-flex items-center justify-center w-4 h-4 border-2 border-green-800 rounded ${
                      selectedPet.reproductive_status?.toLowerCase() === 'castrated' || selectedPet.reproductive_status?.toLowerCase() === 'spayed' ? 'bg-green-800' : 'bg-white'
                    }`}>
                      {(selectedPet.reproductive_status?.toLowerCase() === 'castrated' || selectedPet.reproductive_status?.toLowerCase() === 'spayed') && (
                        <CheckSquare size={14} className="text-white" />
                      )}
                    </span>
                    <span className="text-green-800 font-medium text-sm">
                      {selectedPet.reproductive_status?.toLowerCase() === 'castrated' ? 'Castrated' : 
                       selectedPet.reproductive_status?.toLowerCase() === 'spayed' ? 'Spayed' : 'Castrated/Spayed'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Detailed Information */}
            <div className="flex-1 mt-8">
              <div className="bg-green-800 rounded-2xl px-8 py-8 shadow-lg">
                <h3 className="text-center text-white text-xl font-semibold mb-8">{selectedPet.name}'s Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="block text-white mb-1">Type of Species:</label>
                      <input 
                        type="text" 
                        value={selectedPet.species || ''} 
                        className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" 
                        disabled 
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-1">Age:</label>
                      <input 
                        type="text" 
                        value={calculateAge(selectedPet.date_of_birth)} 
                        className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" 
                        disabled 
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-1">Pet's Date of Birth:</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formatDateForProfile(selectedPet.date_of_birth)} 
                          className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800 pr-10" 
                          disabled 
                        />
                        <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700" />
                      </div>
                    </div>
                  </div>
                  {/* Right column */}
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="block text-white mb-1">Breed:</label>
                      <input 
                        type="text" 
                        value={selectedPet.breed || ''} 
                        className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" 
                        disabled 
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-1">Color:</label>
                      <input 
                        type="text" 
                        value={selectedPet.color || ''} 
                        className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" 
                        disabled 
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-1">Sex:</label>
                      <input 
                        type="text" 
                        value={selectedPet.gender || ''} 
                        className="w-full rounded-lg bg-gray-100 border-none px-4 py-2 text-gray-800" 
                        disabled 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  // Show pet profile if selected
  if (showProfile && selectedPet) {
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
          {showVaccinationCard ? (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans overflow-y-auto">
              {/* Vaccination Card Header */}
              <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleBackToProfile}
                    className="text-green-800 hover:text-green-900 transition-colors"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedPet.name}'s VacCard</h1>
                </div>
                <div className="relative user-info-area">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <UserCircle size={36} className="text-green-700" />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-gray-900 leading-tight">{user?.name || ''}</span>
                      <span className="text-xs text-gray-500 -mt-1">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</span>
                    </div>
                    <ChevronDown size={18} className="text-gray-500 ml-1" />
                  </div>
                  {isDropdownOpen && (
                    <div className="user-dropdown-menu absolute right-0 mt-3 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50 top-full backdrop-blur-sm">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || ''}</p>
                        <p className="text-xs text-green-600">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</p>
                      </div>
                      <button
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200"
                        onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <User size={16} className="text-green-600" />
                        </div>
                        <span className="font-medium">Profile</span>
                      </button>
                      <button
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
                        onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Settings size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium">Account Settings</span>
                      </button>
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200"
                        onClick={() => { setShowLogoutModal(true); setIsDropdownOpen(false); }}
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <LogOut size={16} className="text-red-600" />
                        </div>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* Vaccination Card Content */}
              <main className="flex-1 p-6 overflow-y-auto">
                {/* Top Control Panel */}
                <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-center">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search vaccination records..."
                        value={vaccinationSearch}
                        onChange={e => setVaccinationSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-80"
                      />
                    </div>
                    {/* Add New Record Button */}
                    <button 
                      onClick={handleAddNewRecord}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200"
                    >
                      <PlusSquare size={20} />
                      <span>Add New Record</span>
                    </button>
                  </div>
                </div>

                {/* Vaccination Records Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Date of Vaccination</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Vaccine Used</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Batch No. / Lot No.</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Date of Next Vaccination</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Veterinarian Lic No. PTR</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vaccinationRecords.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-lg font-medium italic">
                            No vaccination records found.<br />
                            <span className="text-gray-500">Click <span className="font-semibold">"Add New Record"</span> to add the first vaccination entry.</span>
                          </td>
                        </tr>
                      ) : (
                        vaccinationRecords
                          .filter(record =>
                            record.vaccine_name?.toLowerCase().includes(vaccinationSearch.toLowerCase()) ||
                            record.veterinarian?.toLowerCase().includes(vaccinationSearch.toLowerCase()) ||
                            record.batch_lot_no?.toLowerCase().includes(vaccinationSearch.toLowerCase())
                          )
                          .map((record, index) => (
                            <tr
                              key={record.id}
                              className={`${index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
                            >
                              <td className="px-6 py-4">
                                {(record.date_given || record.vaccination_date) 
                                  ? new Date(record.date_given || record.vaccination_date!).toLocaleDateString() 
                                  : 'Invalid Date'}
                              </td>
                              <td className="px-6 py-4">{record.vaccine_name}</td>
                              <td className="px-6 py-4">{record.batch_lot_no || '-'}</td>
                              <td className="px-6 py-4">
                                {(record.next_due_date || record.expiration_date)
                                  ? new Date(record.next_due_date || record.expiration_date!).toLocaleDateString()
                                  : '-'}
                              </td>
                              <td className="px-6 py-4">{record.veterinarian}</td>
                              <td className="px-6 py-4 flex items-center gap-2">
                                <button 
                                  className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm" 
                                  title="Edit"
                                  onClick={() => handleEditVaccinationRecord(record)}
                                >
                                  <Edit size={18} className="text-green-600" />
                                </button>
                                <button 
                                  className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm" 
                                  title="Delete"
                                  onClick={() => handleDeleteVaccinationRecord(record)}
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

              {/* Vaccination Record Modals */}
              {isAddVaccinationRecordModalOpen && (
                <AddVaccinationRecordModal
                  isOpen={isAddVaccinationRecordModalOpen}
                  onClose={() => setIsAddVaccinationRecordModalOpen(false)}
                  onSubmit={handleAddVaccinationRecord}
                  vacCardTitle={selectedPet ? `${selectedPet.name}'s VacCard` : 'VacCard'}
                />
              )}

              {isEditVaccinationRecordModalOpen && selectedVaccinationRecord && (
                <EditVaccinationRecordModal
                  isOpen={isEditVaccinationRecordModalOpen}
                  onClose={() => {
                    setIsEditVaccinationRecordModalOpen(false);
                    setSelectedVaccinationRecord(null);
                  }}
                  onSubmit={(data) => handleUpdateVaccinationRecord(selectedVaccinationRecord.id, data)}
                  record={selectedVaccinationRecord}
                  petName={selectedPet?.name}
                />
              )}

              {isDeleteVaccinationRecordModalOpen && selectedVaccinationRecord && (
                <DeleteVaccinationRecordModal
                  isOpen={isDeleteVaccinationRecordModalOpen}
                  onClose={() => {
                    setIsDeleteVaccinationRecordModalOpen(false);
                    setSelectedVaccinationRecord(null);
                  }}
                  onConfirm={handleConfirmDeleteVaccinationRecord}
                  record={selectedVaccinationRecord}
                />
              )}
            </div>
          ) : showMedicalHistory ? (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans overflow-y-auto">
              {/* Medical History Header */}
              <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleBackToProfile}
                    className="text-green-800 hover:text-green-900 transition-colors"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedPet.name}'s Medical History</h1>
                </div>
                <div className="relative user-info-area">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <UserCircle size={36} className="text-green-700" />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-gray-900 leading-tight">{user?.name || ''}</span>
                      <span className="text-xs text-gray-500 -mt-1">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</span>
                    </div>
                    <ChevronDown size={18} className="text-gray-500 ml-1" />
                  </div>
                  {isDropdownOpen && (
                    <div className="user-dropdown-menu absolute right-0 mt-3 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-2 z-50 top-full backdrop-blur-sm">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || ''}</p>
                        <p className="text-xs text-green-600">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</p>
                      </div>
                      <button
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition-all duration-200"
                        onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <User size={16} className="text-green-600" />
                        </div>
                        <span className="font-medium">Profile</span>
                      </button>
                      <button
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
                        onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Settings size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium">Account Settings</span>
                      </button>
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200"
                        onClick={() => { setShowLogoutModal(true); setIsDropdownOpen(false); }}
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <LogOut size={16} className="text-red-600" />
                        </div>
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {/* Medical History Content */}
              <main className="flex-1 p-6 overflow-y-auto">
                {/* Error Display */}
                {medicalRecordError && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {medicalRecordError}
                  </div>
                )}
                {/* Top Control Panel */}
                <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-center">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search here"
                        value={medicalHistorySearch}
                        onChange={e => setMedicalHistorySearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-80"
                      />
                    </div>
                    {/* Add New Medical Record Button */}
                    <button 
                      onClick={handleAddNewMedicalRecord}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200"
                    >
                      <PlusSquare size={20} />
                      <span>Add New Medical Record</span>
                    </button>
                  </div>
                </div>

                {/* Medical Records Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Reason for Visit</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Date of Visited</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Next Visit</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Procedure done</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Findings</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Recommendation</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Vaccine Used/Medication</th>
                        <th className="px-6 py-4 text-left font-semibold text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicalRecordsLoading ? (
                        <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-500">Loading medical records...</td></tr>
                      ) : medicalRecords.length === 0 ? (
                        <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400 italic">No medical records found.</td></tr>
                      ) : (
                        medicalRecords
                          .filter(record =>
                            record.reason_for_visit?.toLowerCase().includes(medicalHistorySearch.toLowerCase()) ||
                            record.procedures_done?.toLowerCase().includes(medicalHistorySearch.toLowerCase()) ||
                            record.medications?.toLowerCase().includes(medicalHistorySearch.toLowerCase()) ||
                            record.findings?.toLowerCase().includes(medicalHistorySearch.toLowerCase()) ||
                            record.recommendations?.toLowerCase().includes(medicalHistorySearch.toLowerCase())
                          )
                          .map((record, index) => (
                            <tr 
                              key={record.id} 
                              onClick={() => handleViewMedicalRecord(record)}
                              className={`${index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'} hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100 cursor-pointer`}
                            >
                              <td className="px-6 py-4">{record.reason_for_visit}</td>
                              <td className="px-6 py-4">{new Date(record.date_visited).toLocaleDateString()}</td>
                              <td className="px-6 py-4">{record.date_of_next_visit ? new Date(record.date_of_next_visit).toLocaleDateString() : '-'}</td>
                              <td className="px-6 py-4">{record.procedures_done}</td>
                              <td className="px-6 py-4">{record.findings}</td>
                              <td className="px-6 py-4">{record.recommendations}</td>
                              <td className="px-6 py-4">{record.medications}</td>
                              <td className="px-6 py-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm" 
                                  title="Edit"
                                  onClick={() => handleEditMedicalRecord(record)}
                                >
                                  <Edit size={18} className="text-green-600" />
                                </button>
                                <button 
                                  className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm" 
                                  title="Delete"
                                  onClick={() => handleDeleteMedicalRecord(record)}
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

              {/* Medical Record Modals */}
              {isViewMedicalRecordModalOpen && selectedMedicalRecord && (
                <ViewMedicalRecordModal
                  isOpen={isViewMedicalRecordModalOpen}
                  onClose={() => {
                    setIsViewMedicalRecordModalOpen(false);
                    setSelectedMedicalRecord(null);
                  }}
                  record={selectedMedicalRecord}
                />
              )}

              {isAddMedicalRecordModalOpen && (
                <AddMedicalRecordModal
                  isOpen={isAddMedicalRecordModalOpen}
                  onClose={() => {
                    setMedicalRecordError(null);
                    setIsAddMedicalRecordModalOpen(false);
                  }}
                  onSubmit={handleAddMedicalRecord}
                />
              )}

              {isEditMedicalRecordModalOpen && selectedMedicalRecord && (
                <EditMedicalRecordModal
                  isOpen={isEditMedicalRecordModalOpen}
                  onClose={() => {
                    setIsEditMedicalRecordModalOpen(false);
                    setSelectedMedicalRecord(null);
                  }}
                  onSubmit={(data) => handleUpdateMedicalRecord(selectedMedicalRecord.id, data)}
                  record={selectedMedicalRecord}
                />
              )}

              {isDeleteMedicalRecordModalOpen && selectedMedicalRecord && (
                <DeleteMedicalRecordModal
                  isOpen={isDeleteMedicalRecordModalOpen}
                  onClose={() => {
                    setIsDeleteMedicalRecordModalOpen(false);
                    setSelectedMedicalRecord(null);
                  }}
                  onConfirm={handleConfirmDeleteMedicalRecord}
                  record={selectedMedicalRecord}
                />
              )}
            </div>
          ) : (
            <PetProfileSection />
          )}
        </div>
      </div>
    );
  }

  // Show pet records table
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
        <PageHeader title="Pet Records" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Display */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
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
              {/* Search and Add Actions */}
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
                {/* Add New Pet Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <PlusSquare size={20} />
                  <span className="font-semibold">Add New Pet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instructional Note */}
          <div className="mb-4 text-green-700 text-sm font-medium">
            Note: You can view the Pets Profile by clicking the Pet ID.
          </div>

          {/* Pet Records Table */}
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
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">
                      Loading pets...
                    </td>
                  </tr>
                ) : pets.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-4 py-8 text-center text-gray-500">
                      No pets found. Add your first pet to get started!
                    </td>
                  </tr>
                ) : (
                  currentPets.map((pet, i) => (
                    <tr
                      key={pet.id}
                      className={`${
                        i % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'
                      } hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
                    >
                      {/* Pet ID (clickable) */}
                      <td
                        className="px-4 py-3 text-green-800 font-bold underline cursor-pointer hover:text-green-900"
                        onClick={() => handlePetIdClick(pet.pet_id)}
                      >
                        {pet.pet_id}
                      </td>
                      <td className="px-4 py-3">{pet.name}</td>
                      <td className="px-4 py-3">{pet.owner_name}</td>
                      <td className="px-4 py-3">{formatDate(pet.owner_birthday)}</td>
                      <td className="px-4 py-3 capitalize">{pet.species}</td>
                      <td className="px-4 py-3">{formatDate(pet.date_of_birth)}</td>
                      <td className="px-4 py-3">{calculateAge(pet.date_of_birth)}</td>
                      <td className="px-4 py-3">{pet.color || '-'}</td>
                      <td className="px-4 py-3">{pet.breed || '-'}</td>
                      <td className="px-4 py-3 capitalize">{pet.gender || '-'}</td>
                      {/* Reproductive Status */}
                      <td className="px-4 py-3">
                        {pet.reproductive_status ? (
                          <span className="capitalize text-sm font-medium">
                            {pet.reproductive_status === 'intact' ? 'Intact' : 
                             pet.reproductive_status === 'castrated' ? 'Castrated' : 
                             pet.reproductive_status === 'spayed' ? 'Spayed' : 
                             pet.reproductive_status}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      {/* Action icons */}
                      <td className="px-4 py-3 flex items-center gap-2">
                        <button 
                          className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-sm"
                          onClick={() => openEditModal(pet)}
                        >
                          <Edit size={18} className="text-green-600" />
                        </button>
                        <button 
                          className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 hover:shadow-sm"
                          onClick={() => openDeleteModal(pet)}
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
            {pets.length > 0 && totalPages > 1 && (
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
                      // Show first page, last page, current page, and pages around current page
                      const shouldShow = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      if (!shouldShow) {
                        // Show ellipsis for gaps
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
      <AddPetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPet}
        loading={loading}
      />

      <EditPetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdatePet}
        pet={selectedPet}
        loading={loading}
      />

      <DeletePetModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePet}
        pet={selectedPet}
        loading={loading}
      />

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
        userName={user?.name}
      />
    </div>
  );
};



export default PetRecordsPage; 