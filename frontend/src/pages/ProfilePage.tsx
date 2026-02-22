import React, { useState } from 'react';
import { UserCircle, ChevronDown, User, Settings, LogOut, Edit, Save, X, User as UserIcon, Briefcase } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '@tanstack/react-router';
import LoadingSpinner from '../components/LoadingSpinner';
import { userService } from '../services/userService';

const ProfilePage: React.FC = () => {
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  const { user, logout, isLoading, setUser } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  
  // Dark mode detection - check localStorage or URL params
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check URL params first (if navigating from mobile app)
    const urlParams = new URLSearchParams(window.location.search);
    const darkModeParam = urlParams.get('darkMode');
    if (darkModeParam === 'true') {
      return true;
    }
    // Check localStorage
    const savedTheme = localStorage.getItem('@theme');
    if (savedTheme === 'dark') {
      return true;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return false; // Don't auto-enable, but could be changed
    }
    return false;
  });

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

  // Sync dark mode preference from URL params or localStorage
  React.useEffect(() => {
    // Check URL params (if navigating from mobile app)
    const urlParams = new URLSearchParams(window.location.search);
    const darkModeParam = urlParams.get('darkMode');
    if (darkModeParam === 'true') {
      setIsDarkMode(true);
      localStorage.setItem('@theme', 'dark');
    } else if (darkModeParam === 'false') {
      setIsDarkMode(false);
      localStorage.setItem('@theme', 'light');
    } else {
      // Check localStorage
      const savedTheme = localStorage.getItem('@theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      } else if (savedTheme === 'light') {
        setIsDarkMode(false);
      }
    }
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

  const handleSave = async (section: string) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    
    try {
      // Prepare data based on section - only include non-empty values
      const updateData: any = {};
      
      if (section === 'personal') {
        const trimmedName = staffData.personal.name?.trim();
        if (trimmedName && trimmedName !== user?.name) {
          updateData.name = trimmedName;
        }
        
        // Only include email if it's a valid email format and different from current
        const trimmedEmail = staffData.personal.email?.trim();
        if (trimmedEmail) {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(trimmedEmail)) {
            if (trimmedEmail !== user?.email) {
              updateData.email = trimmedEmail;
            }
          } else {
            setSaveError('Please enter a valid email address (e.g., user@example.com)');
            setIsSaving(false);
            return;
          }
        }
        
        const trimmedPhone = staffData.personal.phone?.trim();
        if (trimmedPhone && trimmedPhone !== user?.phone_number) {
          // Validate phone number: must be exactly 11 digits
          const phoneDigitsOnly = trimmedPhone.replace(/\D/g, '');
          if (phoneDigitsOnly.length !== 11) {
            setSaveError('Phone number must be exactly 11 digits');
            setIsSaving(false);
            return;
          }
          updateData.phone_number = phoneDigitsOnly;
        }
        
        const trimmedAddress = staffData.personal.address?.trim();
        if (trimmedAddress && trimmedAddress !== user?.address) {
          updateData.address = trimmedAddress;
        }
      }
      
      // Validate that we have at least one field to update
      if (Object.keys(updateData).length === 0) {
        setSaveError('Please fill in at least one field to update');
        setIsSaving(false);
        return;
      }
      
      // Log what we're sending for debugging
      console.log('Sending update data:', updateData);
      console.log('Update data keys:', Object.keys(updateData));
      
      // Ensure we only send allowed fields (exclude any extra fields)
      const cleanUpdateData: any = {};
      if (updateData.name !== undefined) cleanUpdateData.name = updateData.name;
      if (updateData.email !== undefined) cleanUpdateData.email = updateData.email;
      if (updateData.phone_number !== undefined) cleanUpdateData.phone_number = updateData.phone_number;
      if (updateData.address !== undefined) cleanUpdateData.address = updateData.address;
      
      console.log('Clean update data:', cleanUpdateData);
      
      // Call API to update profile
      const updatedUser = await userService.updateProfile(cleanUpdateData);
      
      // Update user in AuthContext
      if (setUser) {
        setUser(updatedUser);
      }
      
      setEditingSection(null);
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error: any) {
      // Better error handling for 422 validation errors
      let errorMessage = 'Failed to update profile';
      console.error('Full error object:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      
      if (error?.response?.status === 422) {
        const detail = error.response.data?.detail;
        console.error('422 Validation detail:', detail);
        
        if (Array.isArray(detail)) {
          // Pydantic validation errors
          errorMessage = detail.map((err: any) => {
            const field = err.loc?.slice(1).join('.') || 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (detail?.message) {
          errorMessage = detail.message;
        } else if (detail) {
          errorMessage = JSON.stringify(detail);
        }
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSaveError(errorMessage);
      console.error('Error updating profile:', errorMessage);
    } finally {
      setIsSaving(false);
    }
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

  // Dark mode color variables
  const backgroundColor = isDarkMode ? '#000000' : '#f3f4f6';
  const cardBackground = isDarkMode ? '#1a1a1a' : '#ffffff';
  const textColor = isDarkMode ? '#FFFFFF' : '#1f2937';
  const secondaryTextColor = isDarkMode ? '#CCCCCC' : '#6b7280';
  const borderColor = isDarkMode ? '#333333' : '#e5e7eb';
  const iconColor = isDarkMode ? '#045b26' : '#045b26';
  const inputBackground = isDarkMode ? '#1a1a1a' : '#ffffff';
  const hoverBackground = isDarkMode ? '#2a2a2a' : '#f9fafb';

  return (
    <div className="flex min-h-screen font-inter w-full overflow-x-hidden" style={{ backgroundColor }}>
      <Sidebar
        items={navigationItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        isExpanded={isExpanded}
        onToggleExpand={toggleSidebar}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? 'lg:ml-64 ml-0' : 'lg:ml-16 ml-0'
        }`}
      >
        {/* Header */}
        <header className="shadow-md p-4 flex justify-between items-center flex-shrink-0" style={{ backgroundColor: cardBackground, borderBottom: `1px solid ${borderColor}` }}>
          <h1 className="text-2xl font-bold" style={{ color: textColor }}>Staff Profile</h1>
          <div className="relative flex items-center space-x-4 user-info-area">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleDropdown}>
              {user?.photo_url ? (
                <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden' }}>
                  <img 
                    src={user.photo_url.startsWith('http') ? user.photo_url : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${user.photo_url}`}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('Failed to load user avatar:', user.photo_url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <UserCircle size={28} style={{ color: secondaryTextColor }} />
              )}
              <div className="flex flex-col items-start">
                <span className="font-medium" style={{ color: textColor }}>{user?.name || ''}</span>
                <span className="text-sm" style={{ color: secondaryTextColor }}>{user?.role === 'admin' ? 'SuperAdmin' : user?.role || ''}</span>
              </div>
              <ChevronDown size={20} style={{ color: secondaryTextColor }} />
            </div>
            {isDropdownOpen && (
              <div className="user-dropdown-menu absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 top-full" style={{ backgroundColor: cardBackground, border: `1px solid ${borderColor}` }}>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity" style={{ color: textColor }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBackground} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}>
                  <User size={16} className="mr-2" /> Profile
                </button>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity" style={{ color: textColor }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBackground} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}>
                  <Settings size={16} className="mr-2" /> Account Settings
                </button>
                <div className="my-1" style={{ borderTop: `1px solid ${borderColor}` }}></div>
                <button className="flex items-center w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity" style={{ color: '#DC3545' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#2a1a1a' : '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} onClick={() => { logout(); setIsDropdownOpen(false); }}>
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto min-h-0">
          <div className="max-w-4xl mx-auto space-y-6 pb-6">
            {/* Success Message */}
            {saveSuccess && (
              <div className="px-4 py-3 rounded relative" style={{ backgroundColor: isDarkMode ? '#1a3a1a' : '#d1fae5', border: `1px solid ${isDarkMode ? '#2d5a2d' : '#86efac'}`, color: isDarkMode ? '#86efac' : '#065f46' }}>
                {saveSuccess}
              </div>
            )}

            {/* Error Message */}
            {saveError && (
              <div className="px-4 py-3 rounded relative" style={{ backgroundColor: isDarkMode ? '#3a1a1a' : '#fee2e2', border: `1px solid ${isDarkMode ? '#5a2d2d' : '#fca5a5'}`, color: isDarkMode ? '#fca5a5' : '#991b1b' }}>
                {saveError}
              </div>
            )}

            {/* Profile Header Card */}
            <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: cardBackground, border: `1px solid ${borderColor}` }}>
              <div className="flex items-center space-x-6">
                {user?.photo_url ? (
                  <div className="rounded-full overflow-hidden" style={{ width: 96, height: 96 }}>
                    <img 
                      src={user.photo_url.startsWith('http') ? user.photo_url : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${user.photo_url}`}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('Failed to load profile image:', user.photo_url);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<div style="width: 96px; height: 96px; border-radius: 50%; background-color: ${isDarkMode ? '#1a3a1a' : '#d1fae5'}; display: flex; align-items: center; justify-content: center;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg></div>`;
                      }}
                    />
                  </div>
                ) : (
                  <div className="rounded-full p-4" style={{ backgroundColor: isDarkMode ? '#1a3a1a' : '#d1fae5' }}>
                    <UserCircle size={48} style={{ color: iconColor }} />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold" style={{ color: textColor }}>{staffData.personal.name}</h2>
                  <p className="font-medium" style={{ color: iconColor }}>{staffData.professional.position}</p>
                  <p style={{ color: secondaryTextColor }}>{staffData.professional.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ color: secondaryTextColor }}>Employee ID</p>
                  <p className="font-semibold" style={{ color: textColor }}>{staffData.professional.employeeId}</p>
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: cardBackground, border: `1px solid ${borderColor}` }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center" style={{ color: textColor }}>
                  <UserIcon size={20} className="mr-2" style={{ color: iconColor }} />
                  Personal Information
                </h3>
                {editingSection !== 'personal' ? (
                  <button
                    onClick={() => handleEdit('personal')}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors"
                    style={{ color: iconColor }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBackground}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave('personal')}
                      disabled={isSaving}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: iconColor }}
                      onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = hoverBackground)}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Save size={16} />
                      <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors"
                      style={{ color: secondaryTextColor }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBackground}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Full Name</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="text"
                      value={staffData.personal.name}
                      onChange={(e) => handleInputChange('personal', 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  ) : (
                    <p style={{ color: textColor }}>{staffData.personal.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Email</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="email"
                      value={staffData.personal.email}
                      onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  ) : (
                    <p style={{ color: textColor }}>{staffData.personal.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Phone Number</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="tel"
                      value={staffData.personal.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                        if (value.length <= 11) {
                          handleInputChange('personal', 'phone', value);
                        }
                      }}
                      maxLength={11}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                      placeholder="11 digits only"
                    />
                  ) : (
                    <p style={{ color: textColor }}>{staffData.personal.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Date of Birth</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="date"
                      value={staffData.personal.dateOfBirth}
                      onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  ) : (
                    <p style={{ color: textColor }}>{staffData.personal.dateOfBirth}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Gender</label>
                  {editingSection === 'personal' ? (
                    <select
                      value={staffData.personal.gender}
                      onChange={(e) => handleInputChange('personal', 'gender', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p style={{ color: textColor }}>{staffData.personal.gender}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Address</label>
                  {editingSection === 'personal' ? (
                    <textarea
                      value={staffData.personal.address}
                      onChange={(e) => handleInputChange('personal', 'address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  ) : (
                    <p style={{ color: textColor }}>{staffData.personal.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information Card */}
            <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: cardBackground, border: `1px solid ${borderColor}` }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center" style={{ color: textColor }}>
                  <Briefcase size={20} className="mr-2" style={{ color: iconColor }} />
                  Professional Information
                </h3>
                {editingSection !== 'professional' ? (
                  <button
                    onClick={() => handleEdit('professional')}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors"
                    style={{ color: iconColor }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBackground}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave('professional')}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors"
                      style={{ color: iconColor }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBackground}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors"
                      style={{ color: secondaryTextColor }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverBackground}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Position</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      value={staffData.professional.position}
                      onChange={(e) => handleInputChange('professional', 'position', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  ) : (
                    <p style={{ color: textColor }}>{staffData.professional.position}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Department</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      value={staffData.professional.department}
                      onChange={(e) => handleInputChange('professional', 'department', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  ) : (
                    <p style={{ color: textColor }}>{staffData.professional.department}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Employee ID</label>
                  <p style={{ color: textColor }}>{staffData.professional.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Date Hired</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="date"
                      value={staffData.professional.dateHired}
                      onChange={(e) => handleInputChange('professional', 'dateHired', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  ) : (
                    <p style={{ color: textColor }}>{staffData.professional.dateHired}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: textColor }}>Supervisor</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      value={staffData.professional.supervisor}
                      onChange={(e) => handleInputChange('professional', 'supervisor', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{ backgroundColor: inputBackground, border: `1px solid ${borderColor}`, color: textColor }}
                    />
                  ) : (
                    <p style={{ color: textColor }}>{staffData.professional.supervisor}</p>
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