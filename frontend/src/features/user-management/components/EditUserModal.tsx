import React, { useState, useEffect } from 'react';
import { X, User, Mail, MapPin, Phone } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userType: 'admin' | 'user';
  userId: number | null;
}

interface FormData {
  name: string;
  email: string;
  address?: string;
  phone_number?: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  address?: string;
  phone_number?: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userType,
  userId
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    address: '',
    phone_number: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const token = localStorage.getItem('access_token');

  // Fetch user data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
    }
  }, [isOpen, userId]);

  const fetchUserData = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const endpoint = userType === 'admin' 
        ? `${API_BASE_URL}/users/admins/${userId}`
        : `${API_BASE_URL}/users/${userId}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData: UserData = response.data;
      setFormData({
        name: userData.name,
        email: userData.email,
        address: userData.address || '',
        phone_number: userData.phone_number || ''
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          (typeof err.response?.data === 'string' ? err.response.data : 'Failed to fetch user data');
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (userType === 'user') {
      if (formData.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
        newErrors.phone_number = 'Phone number is invalid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const endpoint = userType === 'admin' 
        ? `${API_BASE_URL}/users/admins/${userId}`
        : `${API_BASE_URL}/users/${userId}`;

      const payload = {
        name: formData.name,
        email: formData.email,
        ...(userType === 'user' && {
          address: formData.address || undefined,
          phone_number: formData.phone_number || undefined
        })
      };

      await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          (typeof err.response?.data === 'string' ? err.response.data : 'Failed to update user');
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      address: '',
      phone_number: ''
    });
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit {userType === 'admin' ? 'Admin' : 'User'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {submitError}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading user data...</span>
            </div>
          ) : (
            <>
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* User-specific fields */}
              {userType === 'user' && (
                <>
                  {/* Address Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter address"
                      rows={3}
                    />
                  </div>

                  {/* Phone Number Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.phone_number ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phone_number && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                    )}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditUserModal; 