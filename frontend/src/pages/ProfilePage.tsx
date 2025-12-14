import React, { useState } from 'react';
import { UserCircle, ChevronDown, User, Settings, LogOut, Edit, Save, X, Heart } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '@tanstack/react-router';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Staff data initialized with current user info
  const [staffData, setStaffData] = useState({
    personal: {
      name: user?.name || 'Staff Member',
      email: user?.email || 'staff@vetoffice.com',
      phone: user?.phone_number || '09171234567',
      address: user?.address || '123 Main Street, Cityville, Metro Manila',
      dateOfBirth: '1990-05-15',
      gender: 'Female'
    },
    professional: {
      position: 'Staff',
      department: 'General Services',
      employeeId: `EMP-${user?.id || '001'}`,
      dateHired: '2020-03-15',
      supervisor: 'Department Head'
    },
    emergency: {
      name: 'Emergency Contact',
      relationship: 'Family',
      phone: '09181234567',
      address: '123 Main Street, Cityville, Metro Manila'
    }
  });

  // All hooks must be called before any conditional returns
  React.useEffect(() => {
    if (!isLoading && user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router, isLoading]);

  // Update staff data when user information changes
  React.useEffect(() => {
    if (user) {
      setStaffData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          name: user.name || prev.personal.name,
          email: user.email || prev.personal.email,
          phone: user.phone_number || prev.personal.phone,
          address: user.address || prev.personal.address,
        },
        professional: {
          ...prev.professional,
          employeeId: `EMP-${user.id || '001'}`,
        }
      }));
    }
  }, [user]);

  React.useEffect(() => {
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

  // Show loading state while restoring session
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render anything if user is not authenticated
  if (user === null) {
    return null;
  }

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleEdit = (section: string) => {
    setEditingSection(section);
  };

  const handleSave = (section: string) => {
    setEditingSection(null);
    // Here you would typically save the data to the backend
  };

  const handleCancel = () => {
    setEditingSection(null);
  };

  const handleInputChange = (section: string, field: string, value: string) => {
    setStaffData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100 font-inter w-full overflow-hidden">
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
        <header className="bg-white shadow-md p-4 flex justify-between items-center flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Staff Profile</h1>
          <div className="relative flex items-center space-x-4 user-info-area">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleDropdown}>
              <UserCircle size={28} className="text-gray-600" />
              <div className="flex flex-col items-start">
                <span className="text-gray-800 font-medium">{user?.name || ''}</span>
                <span className="text-gray-500 text-sm">{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</span>
              </div>
              <ChevronDown size={20} className="text-gray-500" />
            </div>
            {isDropdownOpen && (
              <div className="user-dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 top-full">
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}>
                  <User size={16} className="mr-2" /> Profile
                </button>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}>
                  <Settings size={16} className="mr-2" /> Account Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => { logout(); setIsDropdownOpen(false); }}>
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto min-h-0">
          <div className="max-w-4xl mx-auto space-y-6 pb-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-6">
                <div className="bg-green-100 rounded-full p-4">
                  <UserCircle size={48} className="text-green-800" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800">{staffData.personal.name}</h2>
                  <p className="text-green-600 font-medium">{staffData.professional.position}</p>
                  <p className="text-gray-600">{staffData.professional.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Employee ID</p>
                  <p className="font-semibold text-gray-800">{staffData.professional.employeeId}</p>
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <UserIcon size={20} className="mr-2 text-green-600" />
                  Personal Information
                </h3>
                {editingSection !== 'personal' ? (
                  <button
                    onClick={() => handleEdit('personal')}
                    className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave('personal')}
                      className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="text"
                      value={staffData.personal.name}
                      onChange={(e) => handleInputChange('personal', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.personal.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="email"
                      value={staffData.personal.email}
                      onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.personal.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="tel"
                      value={staffData.personal.phone}
                      onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.personal.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="date"
                      value={staffData.personal.dateOfBirth}
                      onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.personal.dateOfBirth}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  {editingSection === 'personal' ? (
                    <select
                      value={staffData.personal.gender}
                      onChange={(e) => handleInputChange('personal', 'gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-800">{staffData.personal.gender}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {editingSection === 'personal' ? (
                    <textarea
                      value={staffData.personal.address}
                      onChange={(e) => handleInputChange('personal', 'address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.personal.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Briefcase size={20} className="mr-2 text-green-600" />
                  Professional Information
                </h3>
                {editingSection !== 'professional' ? (
                  <button
                    onClick={() => handleEdit('professional')}
                    className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave('professional')}
                      className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      value={staffData.professional.position}
                      onChange={(e) => handleInputChange('professional', 'position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.professional.position}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      value={staffData.professional.department}
                      onChange={(e) => handleInputChange('professional', 'department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.professional.department}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <p className="text-gray-800">{staffData.professional.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Hired</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="date"
                      value={staffData.professional.dateHired}
                      onChange={(e) => handleInputChange('professional', 'dateHired', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.professional.dateHired}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      value={staffData.professional.supervisor}
                      onChange={(e) => handleInputChange('professional', 'supervisor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.professional.supervisor}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Heart size={20} className="mr-2 text-green-600" />
                  Emergency Contact
                </h3>
                {editingSection !== 'emergency' ? (
                  <button
                    onClick={() => handleEdit('emergency')}
                    className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave('emergency')}
                      className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  {editingSection === 'emergency' ? (
                    <input
                      type="text"
                      value={staffData.emergency.name}
                      onChange={(e) => handleInputChange('emergency', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.emergency.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  {editingSection === 'emergency' ? (
                    <input
                      type="text"
                      value={staffData.emergency.relationship}
                      onChange={(e) => handleInputChange('emergency', 'relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.emergency.relationship}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {editingSection === 'emergency' ? (
                    <input
                      type="tel"
                      value={staffData.emergency.phone}
                      onChange={(e) => handleInputChange('emergency', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.emergency.phone}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {editingSection === 'emergency' ? (
                    <textarea
                      value={staffData.emergency.address}
                      onChange={(e) => handleInputChange('emergency', 'address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="text-gray-800">{staffData.emergency.address}</p>
                  )}
                </div>
              </div>
            </div>


          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage; 