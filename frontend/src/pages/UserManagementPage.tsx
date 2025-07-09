// src/pages/UserManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Search, PlusCircle, XCircle, AlertTriangle } from 'lucide-react'; // Import icons for actions and modals

// Define a type for a User object as received from the backend
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  address?: string | null; // Optional: address can be null
  phone_number?: string | null; // Optional: phone_number can be null
}

// Define props for UserManagementPage to receive loggedInUserRole
interface UserManagementPageProps {
  loggedInUserRole: string; // The role of the currently logged-in user
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ loggedInUserRole }) => {
  const [users, setUsers] = useState<UserData[]>([]); // State to store all users
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]); // State for filtered users
  const [activeTab, setActiveTab] = useState('ADMIN'); // 'ADMIN' or 'USER'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // For success/error messages

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // Form states for Add/Edit User
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState(''); // Corrected: Should be useState('')
  const [formRole, setFormRole] = useState<'admin' | 'pet_owner'>('pet_owner'); // Default to pet_owner - this will be set dynamically now
  const [formAddress, setFormAddress] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');

  // Function to fetch users from the backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5001/api/users', {
        headers: {
          'X-User-Role': loggedInUserRole,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data.users); // Store all fetched users
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  }, [loggedInUserRole]);

  // Effect to fetch users on component mount and when loggedInUserRole changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Effect to filter users whenever users, activeTab, or searchTerm changes
  useEffect(() => {
    let currentUsers = [...users]; // Start with all users

    // Apply role filtering
    if (activeTab === 'ADMIN') {
      currentUsers = currentUsers.filter(user => user.role === 'admin');
    } else if (activeTab === 'USER') {
      currentUsers = currentUsers.filter(user => user.role === 'pet_owner');
    }

    // Apply search term filtering
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentUsers = currentUsers.filter(user =>
        user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        (user.address && user.address.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (user.phone_number && user.phone_number.includes(lowerCaseSearchTerm)) ||
        String(user.id).includes(lowerCaseSearchTerm)
      );
    }

    setFilteredUsers(currentUsers);
  }, [users, activeTab, searchTerm]);

  // --- Modal Control Functions ---
  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole(activeTab === 'ADMIN' ? 'admin' : 'pet_owner');
    setFormAddress('');
    setFormPhoneNumber('');
    setIsAddModalOpen(true);
    setMessage(null); // Clear messages
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (user: UserData) => {
    setUserToEdit(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role as 'admin' | 'pet_owner'); // Cast to the correct type
    setFormAddress(user.address || '');
    setFormPhoneNumber(user.phone_number || '');
    setIsEditModalOpen(true);
    setMessage(null); // Clear messages
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  const openDeleteModal = (user: UserData) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    setMessage(null); // Clear messages
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // --- CRUD Operation Handlers ---

  // Handle Add User submission
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    // The role is already set by openAddModal based on activeTab
    const roleToCreate = formRole; // Use the role determined when the modal was opened

    try {
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': loggedInUserRole,
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: roleToCreate, // Use the dynamically set role
          address: formAddress,
          phone_number: formPhoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('User added successfully!');
        closeAddModal();
        fetchUsers(); // Refresh the user list
      } else {
        setMessage(`Failed to add user: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error adding user:', err);
      setMessage('An error occurred while adding user.');
    }
  };

  // Handle Edit User submission
  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages
    if (!userToEdit) return;

    try {
      const response = await fetch(`http://localhost:5001/api/users/${userToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': loggedInUserRole,
        },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          role: formRole, // Use the role from the form (if editable)
          address: formAddress,
          phone_number: formPhoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('User updated successfully!');
        closeEditModal();
        fetchUsers(); // Refresh the user list
      } else {
        setMessage(`Failed to update user: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      setMessage('An error occurred while updating user.');
    }
  };

  // Handle Delete User confirmation
  const handleConfirmDelete = async () => {
    setMessage(null); // Clear previous messages
    if (!userToDelete) return;

    try {
      const response = await fetch(`http://localhost:5001/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': loggedInUserRole,
        },
      });

      if (response.ok) {
        setMessage('User deleted successfully!');
        closeDeleteModal();
        fetchUsers(); // Refresh the user list
      } else {
        const data = await response.json();
        setMessage(`Failed to delete user: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setMessage('An error occurred while deleting user.');
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading users...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-80px)]"> {/* Adjusted min-height */}

      {/* Message display area */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message}
        </div>
      )}

      {/* Controls: Admin/User buttons, Search, Add New User */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Role Filter Buttons */}
        <div className="flex space-x-2">
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200
              ${activeTab === 'ADMIN' ? 'bg-green-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
            onClick={() => setActiveTab('ADMIN')}
          >
            ADMIN
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200
              ${activeTab === 'USER' ? 'bg-green-700 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
            onClick={() => setActiveTab('USER')}
          >
            USER
          </button>
        </div>

        {/* Search Bar and Add New User Button */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search here"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Add New User Button */}
          <button
            className="flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-md"
            onClick={openAddModal} // Open Add User modal
          >
            <PlusCircle size={20} className="mr-2" /> Add New User
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                E-mail
              </th>
              {activeTab === 'USER' && ( // Only show Address and Phone for USER tab
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Phone Number
                  </th>
                </>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  {activeTab === 'USER' && ( // Display Address and Phone for USER tab
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.address || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phone_number || 'N/A'}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => openEditModal(user)} // Open Edit modal with user data
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit User"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)} // Open Delete modal with user data
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeTab === 'USER' ? 6 : 4} className="px-6 py-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Add New User Modal --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add New User</h3>
              <button onClick={closeAddModal} className="text-gray-300 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {message}
              </div>
            )}
            <form onSubmit={handleAddUserSubmit}>
              <div className="mb-4">
                <label htmlFor="addName" className="block text-sm font-bold mb-2">
                  Full Name:
                </label>
                <input
                  type="text"
                  id="addName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-green-700 text-white placeholder-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="addEmail" className="block text-sm font-bold mb-2">
                  E-mail:
                </label>
                <input
                  type="email"
                  id="addEmail"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-green-700 text-white placeholder-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="addPassword" className="block text-sm font-bold mb-2">
                  Password:
                </label>
                <input
                  type="password"
                  id="addPassword"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-green-700 text-white placeholder-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>

              {/* Removed Conditional Role selection for Add User */}
              {/* The role is now automatically set based on the active tab (Admin or User) */}

              {/* Conditional fields for Pet Owner */}
              {formRole === 'pet_owner' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="addAddress" className="block text-sm font-bold mb-2">
                      Address:
                    </label>
                    <input
                      type="text"
                      id="addAddress"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-green-700 text-white placeholder-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="addPhoneNumber" className="block text-sm font-bold mb-2">
                      Phone Number:
                    </label>
                    <input
                      type="text"
                      id="addPhoneNumber"
                      value={formPhoneNumber}
                      onChange={(e) => setFormPhoneNumber(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-green-700 text-white placeholder-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </>
              )}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit User Modal --- */}
      {isEditModalOpen && userToEdit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 p-8 rounded-lg shadow-xl w-full max-w-md text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit User Information</h3>
              <button onClick={closeEditModal} className="text-gray-300 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {message}
              </div>
            )}
            <form onSubmit={handleUpdateUserSubmit}>
              <div className="mb-4">
                <label htmlFor="editName" className="block text-sm font-bold mb-2">
                  Full Name:
                </label>
                <input
                  type="text"
                  id="editName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-green-700 text-white placeholder-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="editEmail" className="block text-sm font-bold mb-2">
                  E-mail:
                </label>
                <input
                  type="email"
                  id="editEmail"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 bg-green-700 text-white placeholder-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  required
                />
              </div>
              {/* Role selection for Edit User */}
              <div className="mb-4">
                <label htmlFor="editRole" className="block text-sm font-bold mb-2">
                  Role:
                </label>
                <select
                  id="editRole"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as 'admin' | 'pet_owner')}
                  className="shadow border rounded w-full py-2 px-3 bg-green-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                  required
                >
                  <option value="pet_owner">Pet Owner</option>
                  {loggedInUserRole === 'admin' && ( // Only show Admin option if logged-in user is 'admin' (SuperAdmin)
                    <option value="admin">Admin</option>
                  )}
                </select>
              </div>
              {/* Conditional fields for Pet Owner */}
              {formRole === 'pet_owner' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="editAddress" className="block text-sm font-bold mb-2">
                      Address:
                    </label>
                    <input
                      type="text"
                      id="editAddress"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-green-700 text-white placeholder-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="editPhoneNumber" className="block text-sm font-bold mb-2">
                      Phone Number:
                    </label>
                    <input
                      type="text"
                      id="editPhoneNumber"
                      value={formPhoneNumber}
                      onChange={(e) => setFormPhoneNumber(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 bg-green-700 text-white placeholder-gray-300 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </>
              )}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Delete User Confirmation Modal --- */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-green-800 p-8 rounded-lg shadow-xl w-full max-w-sm text-center text-white">
            <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-4">Are you sure?</h3>
            <p className="mb-6">
              Do you really want to delete user "<strong>{userToDelete.name}</strong>"? This action cannot be undone.
            </p>
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {message}
              </div>
            )}
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default UserManagementPage;
