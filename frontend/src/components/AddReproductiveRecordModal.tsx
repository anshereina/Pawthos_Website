import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { CreatePetData } from '../services/petService';
import { API_BASE_URL } from '../config';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AddReproductiveRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePetData) => Promise<void>;
  loading: boolean;
}

const AddReproductiveRecordModal: React.FC<AddReproductiveRecordModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState<CreatePetData>({
    name: '',
    owner_name: '',
    species: '',
    date_of_birth: '',
    color: '',
    breed: '',
    gender: '',
    reproductive_status: '',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [date, setDate] = useState('');

  const ownerInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (userSearch) {
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [userSearch, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/users/`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch {}
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreatePetData = {
      ...formData,
      // Keep date_of_birth distinct; the separate 'date' will be sent to RR API via page
    };
    await onSubmit(payload);
    if (!loading) {
      setFormData({
        name: '', owner_name: '', species: '', date_of_birth: '', color: '', breed: '', gender: '', reproductive_status: ''
      });
      setDate('');
      onClose();
    }
  };

  const selectUser = (user: User) => {
    setFormData(prev => ({ ...prev, owner_name: user.name }));
    setUserSearch('');
    setIsUserDropdownOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (isUserDropdownOpen && !ownerInputRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        setIsUserDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isUserDropdownOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Add New Record</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
              <div className="relative">
                <input ref={ownerInputRef} type="text" value={formData.owner_name} onChange={(e) => { setFormData(prev => ({ ...prev, owner_name: e.target.value })); setUserSearch(e.target.value); setIsUserDropdownOpen(true); }} onFocus={() => setIsUserDropdownOpen(true)} placeholder="Search for owner..." required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" disabled={loading} />
                <button type="button" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <ChevronDown size={20} className="text-gray-400" />
                </button>
                {isUserDropdownOpen && (
                  <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <button key={user.id} type="button" onClick={() => selectUser(user)} className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">No users found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
              <select name="species" value={formData.species} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" disabled={loading}>
                <option value="">Select Species</option>
                <option value="canine">Canine</option>
                <option value="feline">Feline</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" disabled={loading}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reproductive Status</label>
              <select name="reproductive_status" value={formData.reproductive_status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" disabled={loading}>
                <option value="">Select Status</option>
                <option value="castrated">Castrated</option>
                <option value="spayed">Spayed</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{loading ? 'Saving...' : 'Add Record'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddReproductiveRecordModal;

