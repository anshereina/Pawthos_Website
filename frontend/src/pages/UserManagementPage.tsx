import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../components/useSidebar';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { useRouter } from '@tanstack/react-router';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';
import DeleteUserModal from '../components/DeleteUserModal';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const UserManagementPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { isExpanded, activeItem, navigationItems, toggleSidebar } = useSidebar();
  
  // User management state
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // View details modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedUser, setViewedUser] = useState<any | null>(null);

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

  // Default to USER tab when not an admin
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      setSelectedRole('user');
    }
  }, [user]);

  // Reset to first page when role or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, searchTerm]);

  // Pagination logic
  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

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


  // Fetch users from backend
  const fetchUsers = React.useCallback(async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      if (!user) {
        setLoadingUsers(false);
        return;
      }

      // Block admin fetch for non-admins to avoid 401 spam
      if (selectedRole === 'admin' && user.role !== 'admin') {
        setUsers([]);
        setError('Admin access required');
        setLoadingUsers(false);
        return;
      }

      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      
      let endpoint = '';
      if (selectedRole === 'admin') {
        endpoint = `${API_BASE_URL}/users/admins`;
      } else {
        endpoint = `${API_BASE_URL}/users/`;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated');
        setLoadingUsers(false);
        router.navigate({ to: '/login' });
        return;
      }
      
      const response = await axios.get(endpoint, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        router.navigate({ to: '/login' });
      } else if (status === 403) {
        setError('Admin access required');
      } else {
        const errorMessage = err.response?.data?.detail || 
                            (typeof err.response?.data === 'string' ? err.response.data : 'Failed to fetch users');
        setError(errorMessage);
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [selectedRole, searchTerm, router, logout, user]);

  React.useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [fetchUsers, user]);

  const handleItemClick = (path: string) => {
    router.navigate({ to: path });
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
          <th className="px-4 py-3 text-left font-semibold text-sm">ID</th>
          <th className="px-4 py-3 text-left font-semibold text-sm">Name</th>
          <th className="px-4 py-3 text-left font-semibold text-sm">E-mail</th>
          <th className="px-4 py-3 text-left font-semibold text-sm">Action</th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-sm">ID</th>
          <th className="px-4 py-3 text-left font-semibold text-sm">Name</th>
          <th className="px-4 py-3 text-left font-semibold text-sm">E-mail</th>
          <th className="px-4 py-3 text-left font-semibold text-sm">Address</th>
          <th className="px-4 py-3 text-left font-semibold text-sm">Phone Number</th>
          <th className="px-4 py-3 text-left font-semibold text-sm">Action</th>
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
            index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'
          } hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
          onClick={() => { setViewedUser(user); setIsViewModalOpen(true); }}
        >
          <td className="px-4 py-3 text-gray-900">{user.id}</td>
          <td className="px-4 py-3 text-gray-900 font-medium">{user.name}</td>
          <td className="px-4 py-3 text-gray-900">{user.email}</td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => { e.stopPropagation(); handleEditUser(user.id, user.name); }}
                className="p-2.5 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 hover:shadow-sm"
                title="Edit user"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id, user.name); }}
                className="p-2.5 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:shadow-sm"
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
            index % 2 === 0 ? 'bg-gradient-to-r from-green-50 to-white' : 'bg-white'
          } hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 transition-all duration-300 border-b border-gray-100`}
          onClick={() => { setViewedUser(user); setIsViewModalOpen(true); }}
        >
          <td className="px-4 py-3 text-gray-900">{user.id}</td>
          <td className="px-4 py-3 text-gray-900 font-medium">{user.name}</td>
          <td className="px-4 py-3 text-gray-900">{user.email}</td>
          <td className="px-4 py-3 text-gray-900">{user.address || '-'}</td>
          <td className="px-4 py-3 text-gray-900">{user.phone_number || '-'}</td>
          <td className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => { e.stopPropagation(); handleEditUser(user.id, user.name); }}
                className="p-2.5 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 hover:shadow-sm"
                title="Edit user"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id, user.name); }}
                className="p-2.5 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 hover:shadow-sm"
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
        <PageHeader title="User Management" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Top Control Panel */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center">
              {/* User Role Tabs */}
              <div className="flex space-x-2">
                <button
                  onClick={() => user?.role === 'admin' && setSelectedRole('admin')}
                  disabled={user?.role !== 'admin'}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedRole === 'admin'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                      : 'bg-white text-green-700 border border-green-300 hover:bg-green-50 hover:border-green-400'
                  } ${user?.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  ADMIN
                </button>
                <button
                  onClick={() => setSelectedRole('user')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedRole === 'user'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                      : 'bg-white text-green-700 border border-green-300 hover:bg-green-50 hover:border-green-400'
                  }`}
                >
                  USER
                </button>
              </div>

              {/* Search and Add Actions */}
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  <input
                    type="text"
                    placeholder="Search here"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off"
                    name="user-search-field"
                    id="user-search-field"
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 hover:border-green-300"
                  />
                </div>

                {/* Add New User Button */}
                <button
                  onClick={handleAddNewUser}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Plus size={20} />
                  <span className="font-semibold">Add New User</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instructional Note */}
          <div className="mb-4 text-green-700 text-sm font-medium">
            Note: You can view the details by clicking the row.
          </div>

          {/* User Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 mb-4">
            {error && (
              <div className="px-4 py-4 text-red-700 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                {typeof error === 'string' ? error : 'An error occurred'}
              </div>
            )}
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                {getTableHeaders()}
              </thead>
              
              {/* Table Body */}
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={selectedRole === 'admin' ? 4 : 6} className="px-4 py-8 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={selectedRole === 'admin' ? 4 : 6} className="px-4 py-8 text-center text-gray-500">
                      No {selectedRole}s found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => renderTableRow(user, index))
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {users.length > 0 && totalPages > 1 && (
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
      {isViewModalOpen && viewedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsViewModalOpen(false);
              setViewedUser(null);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => { setIsViewModalOpen(false); setViewedUser(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">ID</span><span className="text-gray-900 font-medium">{viewedUser.id}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="text-gray-900 font-medium">{viewedUser.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">E-mail</span><span className="text-gray-900 font-medium">{viewedUser.email}</span></div>
              {viewedUser.role && (
                <div className="flex justify-between text-sm"><span className="text-gray-500">Role</span><span className="text-gray-900 font-medium capitalize">{viewedUser.role}</span></div>
              )}
              {viewedUser.address !== undefined && (
                <div className="flex justify-between text-sm"><span className="text-gray-500">Address</span><span className="text-gray-900 font-medium text-right max-w-[60%] truncate" title={viewedUser.address || '-'}>{viewedUser.address || '-'}</span></div>
              )}
              {viewedUser.phone_number !== undefined && (
                <div className="flex justify-between text-sm"><span className="text-gray-500">Phone Number</span><span className="text-gray-900 font-medium">{viewedUser.phone_number || '-'}</span></div>
              )}
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => { setIsViewModalOpen(false); setViewedUser(null); }}
                className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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