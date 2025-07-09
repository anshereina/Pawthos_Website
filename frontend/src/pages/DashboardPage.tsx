// src/pages/DashboardPage.tsx
import React, { useState, useCallback } from 'react';

// Import Lucide React icons
import {
  LayoutDashboard,
  Users,
  PawPrint,
  BellRing,
  FileText,
  CalendarCheck,
  ClipboardList,
  UserCircle,
  ChevronDown,
  LogOut,
  Settings,
  User
} from 'lucide-react';

// Import the new UserManagementPage and PetRecordsPage components
import UserManagementPage from './UserManagementPage';
import PetRecordsPage from './PetRecordsPage'; // Import PetRecordsPage
import PetProfilePage from './PetProfilePage'; // Import PetProfilePage
import PetVaccineCardPage from './PetVaccineCardPage'; // Import PetVaccineCardPage
import PetMedicalHistoryPage from './PetMedicalHistoryPage'; // NEW: Import PetMedicalHistoryPage

// Define a type for the user data prop
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Define props for DashboardPage
interface DashboardPageProps {
  user: UserData; // Expects the logged-in user data
  onLogout: () => void; // Expects a logout handler
}

// Placeholder components for other sections (will be replaced later)
const DashboardContent = () => <div className="p-6 text-gray-700"><h2>Dashboard Overview</h2><p>Welcome to your dashboard!</p></div>;
const ReportsAlertsContent = () => <div className="p-6 text-gray-700"><h2>Reports & Alerts</h2><p>View reports and alerts here.</p></div>;
const RecordsContent = () => <div className="p-6 text-gray-700"><h2>Records</h2><p>Access various records here.</p></div>;
const AppointmentsContent = () => <div className="p-6 text-gray-700"><h2>Appointments</h2><p>Manage appointments here.</p></div>;
const PainAssessmentContent = () => <div className="p-6 text-gray-700"><h2>Pain Assessment</h2><p>Conduct pain assessments here.</p></div>;


const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null); // State for selected pet ID
  const [selectedPetName, setSelectedPetName] = useState<string | null>(null); // New state for selected pet name

  // Function to handle viewing a specific pet's profile
  const handleViewPetProfile = useCallback((petId: number, petName: string) => {
    setSelectedPetId(petId);
    setSelectedPetName(petName);
    setActiveItem('Pet Profile');
  }, []);

  // Function to handle viewing a specific pet's vaccine card
  const handleViewVaccineCard = useCallback((petId: number, petName: string) => {
    setSelectedPetId(petId);
    setSelectedPetName(petName);
    setActiveItem('Pet Vaccine Card');
  }, []);

  // NEW: Function to handle viewing a specific pet's medical history
  const handleViewMedicalHistory = useCallback((petId: number, petName: string) => {
    setSelectedPetId(petId);
    setSelectedPetName(petName);
    setActiveItem('Pet Medical History'); // Set active item to the new medical history page
  }, []);

  // Function to go back to the full pet records list
  const handleBackToPetRecords = useCallback(() => {
    setSelectedPetId(null);
    setSelectedPetName(null);
    setActiveItem('Pets');
  }, []);

  // Function to go back from Vaccine Card or Medical History to Pet Profile
  const handleBackToPetProfile = useCallback(() => {
    // We retain selectedPetId and selectedPetName to go back to the correct profile
    setActiveItem('Pet Profile');
  }, []);

  // Function to render content based on activeItem and selectedPetId
  const renderContent = useCallback(() => {
    switch (activeItem) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'User Management':
        return <UserManagementPage loggedInUserRole={user.role} />;
      case 'Pets':
        // If a pet is selected, show its profile (this case is mostly for direct navigation from PetRecordsPage)
        if (selectedPetId !== null) {
          return (
            <PetProfilePage
              petId={selectedPetId}
              petName={selectedPetName || ''}
              loggedInUserRole={user.role}
              onBackToRecords={handleBackToPetRecords}
              onViewVaccineCard={handleViewVaccineCard}
              onViewMedicalHistory={handleViewMedicalHistory} // Pass the new handler
            />
          );
        }
        return (
          <PetRecordsPage
            loggedInUserRole={user.role}
            onViewPetProfile={handleViewPetProfile}
          />
        );
      case 'Pet Profile':
        if (selectedPetId !== null) {
          return (
            <PetProfilePage
              petId={selectedPetId}
              petName={selectedPetName || ''}
              loggedInUserRole={user.role}
              onBackToRecords={handleBackToPetRecords}
              onViewVaccineCard={handleViewVaccineCard}
              onViewMedicalHistory={handleViewMedicalHistory} // Pass the new handler
            />
          );
        }
        return <div className="p-6 text-center text-gray-600">No pet selected for profile.</div>;
      case 'Pet Vaccine Card':
        if (selectedPetId !== null && selectedPetName !== null) {
          return (
            <PetVaccineCardPage
              petId={selectedPetId}
              petName={selectedPetName}
              onBackToProfile={handleBackToPetProfile}
              loggedInUserRole={user.role}
            />
          );
        }
        return <div className="p-6 text-center text-gray-600">No pet selected for vaccine card.</div>;
      case 'Pet Medical History': // NEW: Case for Medical History page
        if (selectedPetId !== null && selectedPetName !== null) {
          return (
            <PetMedicalHistoryPage
              petId={selectedPetId}
              petName={selectedPetName}
              onBackToProfile={handleBackToPetProfile}
              loggedInUserRole={user.role}
            />
          );
        }
        return <div className="p-6 text-center text-gray-600">No pet selected for medical history.</div>;
      case 'Reports & Alerts':
        return <ReportsAlertsContent />;
      case 'Records':
        return <RecordsContent />;
      case 'Appointments':
        return <AppointmentsContent />;
      case 'Pain Assessment':
        return <PainAssessmentContent />;
      default:
        return <DashboardContent />;
    }
  }, [activeItem, selectedPetId, selectedPetName, user.role, handleViewPetProfile, handleViewVaccineCard, handleViewMedicalHistory, handleBackToPetRecords, handleBackToPetProfile]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.closest('.user-info-area') === null &&
      target.closest('.user-dropdown-menu') === null
    ) {
      setIsDropdownOpen(false);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);


  return (
    <div className="flex min-h-screen bg-gray-100 font-inter w-full">
      {/* Sidebar */}
      <aside
        className={`bg-green-900 text-white transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'w-64' : 'w-20'
        } flex flex-col shadow-lg`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {/* Logo and Office Name */}
        <div className="p-4 flex flex-col items-center justify-center border-b border-green-700 pb-4">
          <img
            src="/images/logos/CityVet.jpg"
            alt="CityVet Logo"
            className={`rounded-full transition-all duration-300 ${isSidebarExpanded ? 'w-16 h-16' : 'w-12 h-12'}`}
          />
          {isSidebarExpanded && (
            <div className="mt-2 text-center">
              <h1 className="text-lg font-bold">City Veterinary Office</h1>
              <p className="text-sm">San Pedro, Laguna</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 mt-6">
          <ul>
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'User Management', icon: Users },
              { name: 'Pets', icon: PawPrint },
              { name: 'Reports & Alerts', icon: BellRing },
              { name: 'Records', icon: FileText },
              { name: 'Appointments', icon: CalendarCheck },
              { name: 'Pain Assessment', icon: ClipboardList },
            ].map((item) => (
              <li key={item.name} className="mb-2">
                <button
                  onClick={() => {
                    setActiveItem(item.name);
                    setSelectedPetId(null); // Clear selected pet when switching main tabs
                    setSelectedPetName(null); // Clear selected pet name
                  }}
                  className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200
                    ${activeItem === item.name ? 'bg-green-700 text-white' : 'hover:bg-green-700 hover:text-white'}
                    ${isSidebarExpanded ? 'justify-start' : 'justify-center'}
                  `}
                >
                  <item.icon size={24} className={isSidebarExpanded ? 'mr-3' : ''} />
                  {isSidebarExpanded && <span className="whitespace-nowrap">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header/Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{activeItem}</h1>
          <div className="relative flex items-center space-x-4 user-info-area">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleDropdown}>
              <UserCircle size={28} className="text-gray-600" />
              <div className="flex flex-col items-start">
                <span className="text-gray-800 font-medium">{user.name}</span>
                <span className="text-gray-500 text-sm">{user.role === 'admin' ? 'SuperAdmin' : user.role}</span>
              </div>
              <ChevronDown size={20} className="text-gray-500" />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="user-dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 top-full">
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => { e.preventDefault(); console.log('Profile clicked'); setIsDropdownOpen(false); }}
                >
                  <User size={16} className="mr-2" /> Profile
                </button>
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => { e.preventDefault(); console.log('Account Settings clicked'); setIsDropdownOpen(false); }}
                >
                  <Settings size={16} className="mr-2" /> Account Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                >
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area for selected item - Now handles overflow */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
