import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { 
  UserCircle, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import LoadingSpinner from '../components/LoadingSpinner';
import { AddUserModal, EditUserModal, DeleteUserModal } from '../features/user-management/components';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const UserManagementPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  
  // User management state
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('access_token');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  React.useEffect(() => {
    if (!isLoading && user === null) {
      router.navigate({ to: '/login' });
    }
  }, [user, router, isLoading]);

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

  // Fetch users from backend
  const fetchUsers = React.useCallback(async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      
      let endpoint = '';
      if (selectedRole === 'admin') {
        endpoint = `${API_BASE_URL}/users/admins`;
      } else {
        endpoint = `${API_BASE_URL}/users/`;
      }
      
      const response = await axios.get(endpoint, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          (typeof err.response?.data === 'string' ? err.response.data : 'Failed to fetch users');
      setError(errorMessage);
    } finally {
      setLoadingUsers(false);
    }
  }, [selectedRole, searchTerm, token]);

  React.useEffect(() => {
    if (user && token) {
      fetchUsers();
    }
  }, [fetchUsers, user, token]);

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // Remove mockUsers and use fetched users
  const filteredUsers = users;

  const handleEditUser = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsDeleteModalOpen(true);
  };

  const handleAddNewUser = () => {
    setIsAddModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchUsers();
  };

  // Show loading state while restoring session
  if (isLoading || loadingUsers) {
    return <LoadingSpinner />;
  }

  // Don't render anything if user is not authenticated
  if (user === null) {
    return null;
  }

  // Update table structure to handle different fields for admin vs user
  const getTableHeaders = () => {
    if (selectedRole === 'admin') {
      return (
        <tr>
          <th className="px-6 py-4 text-left font-medium">ID</th>
          <th className="px-6 py-4 text-left font-medium">Name</th>
          <th className="px-6 py-4 text-left font-medium">E-mail</th>
          <th className="px-6 py-4 text-left font-medium">Action</th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th className="px-6 py-4 text-left font-medium">ID</th>
          <th className="px-6 py-4 text-left font-medium">Name</th>
          <th className="px-6 py-4 text-left font-medium">E-mail</th>
          <th className="px-6 py-4 text-left font-medium">Address</th>
          <th className="px-6 py-4 text-left font-medium">Phone Number</th>
          <th className="px-6 py-4 text-left font-medium">Action</th>
        </tr>
      );
    }
  };

  const renderTableRow = (user: any, index: number) => {
    if (selectedRole === 'admin') {
      return (
        <tr 
          key={user.id}
          className={`${
            index % 2 === 0 ? 'bg-green-50' : 'bg-white'
          } hover:bg-green-100 transition-colors duration-150`}
        >
          <td className="px-6 py-4 text-gray-900">{user.id}</td>
          <td className="px-6 py-4 text-gray-900 font-medium">{user.name}</td>
          <td className="px-6 py-4 text-gray-900">{user.email}</td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleEditUser(user.id, user.name)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                title="Edit user"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteUser(user.id, user.name)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                title="Delete user"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      );
    } else {
      return (
        <tr 
          key={user.id}
          className={`${
            index % 2 === 0 ? 'bg-green-50' : 'bg-white'
          } hover:bg-green-100 transition-colors duration-150`}
        >
          <td className="px-6 py-4 text-gray-900">{user.id}</td>
          <td className="px-6 py-4 text-gray-900 font-medium">{user.name}</td>
          <td className="px-6 py-4 text-gray-900">{user.email}</td>
          <td className="px-6 py-4 text-gray-900">{user.address || '-'}</td>
          <td className="px-6 py-4 text-gray-900">{user.phone_number || '-'}</td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleEditUser(user.id, user.name)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                title="Edit user"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteUser(user.id, user.name)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                title="Delete user"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </td>
        </tr>
      );
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
        {/* Top Header/Navbar */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
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
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => { e.preventDefault(); router.navigate({ to: '/profile' }); setIsDropdownOpen(false); }}
                >
                  <User size={16} className="mr-2" /> Profile
                </button>
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => { e.preventDefault(); router.navigate({ to: '/account-settings' }); setIsDropdownOpen(false); }}
                >
                  <Settings size={16} className="mr-2" /> Account Settings
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => { logout(); setIsDropdownOpen(false); }}
                >
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Top Control Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              {/* User Role Tabs */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedRole('admin')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    selectedRole === 'admin'
                      ? 'bg-green-800 text-white'
                      : 'bg-white text-green-800 border border-green-800 hover:bg-green-50'
                  }`}
                >
                  ADMIN
                </button>
                <button
                  onClick={() => setSelectedRole('user')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    selectedRole === 'user'
                      ? 'bg-green-800 text-white'
                      : 'bg-white text-green-800 border border-green-800 hover:bg-green-50'
                  }`}
                >
                  USER
                </button>
              </div>

              {/* Search and Add Actions */}
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search here"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Add New User Button */}
                <button
                  onClick={handleAddNewUser}
                  className="flex items-center space-x-2 px-4 py-2 border border-green-800 bg-white text-green-800 rounded-lg hover:bg-green-50 transition-colors duration-200"
                >
                  <Plus size={20} />
                  <span>Add New User</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Data Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {error && (
              <div className="px-6 py-4 text-red-600 bg-red-50 border-b border-red-200">
                {typeof error === 'string' ? error : 'An error occurred'}
              </div>
            )}
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-green-800 text-white">
                {getTableHeaders()}
              </thead>
              
              {/* Table Body */}
              <tbody>
                {filteredUsers.map((user, index) => renderTableRow(user, index))}
                
                {/* Empty state */}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={selectedRole === 'admin' ? 4 : 6} className="px-6 py-8 text-center text-gray-500">
                      No {selectedRole}s found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleModalSuccess}
        userType={selectedRole}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleModalSuccess}
        userType={selectedRole}
        userId={selectedUserId}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleModalSuccess}
        userType={selectedRole}
        userId={selectedUserId}
        userName={selectedUserName}
      />
    </div>
  );
};

export default UserManagementPage; 