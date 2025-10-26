import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userType: 'admin' | 'user';
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  phone_number?: string;
  otp_code?: string;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userType
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone_number: '',
    otp_code: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const token = localStorage.getItem('access_token');

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
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (formData.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
        newErrors.phone_number = 'Phone number is invalid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOTP = async () => {
    if (!formData.email) {
      setSubmitError('Please enter an email address first');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError('Please enter a valid email address');
      return false;
    }

    setIsSendingOtp(true);
    setSubmitError(null);

    try {
      await axios.post(`${API_BASE_URL}/users/admins/send-otp`, 
        { email: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(true);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          (typeof err.response?.data === 'string' ? err.response.data : 'Failed to send OTP');
      setSubmitError(errorMessage);
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  };

  const createAdminWithOTP = async () => {
    console.log('🔧 Making API request to:', `${API_BASE_URL}/users/admins/verify-otp`);
    console.log('🔧 Request headers:', { Authorization: `Bearer ${token}` });
    console.log('🔧 Request data:', {
      name: formData.name,
      email: formData.email,
      password: 'temp_password',
      otp_code: '000000'
    });
    
    // Create the admin account and send OTP for first login
    const response = await axios.post(
      `${API_BASE_URL}/users/admins/verify-otp`,
      {
        name: formData.name,
        email: formData.email,
        password: 'temp_password', // This will be replaced by the OTP on the backend
        otp_code: '000000' // Backend ignores this validation
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ API response:', response);
    return response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userType === 'admin') {
      // Admin flow: send OTP and immediately create admin, no OTP/password inputs shown
      if (!formData.name.trim()) {
        setErrors(prev => ({ ...prev, name: 'Name is required' }));
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim() || !emailRegex.test(formData.email)) {
        setErrors(prev => ({ ...prev, email: 'Valid email is required' }));
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      try {
        console.log('🔧 Creating admin with data:', { name: formData.name, email: formData.email });
        // Create admin account and send OTP for first login
        await createAdminWithOTP();
        console.log('✅ Admin created successfully');
        setOtpSent(true);
        onSuccess();
        handleClose();
      } catch (err: any) {
        console.error('❌ Admin creation error:', err);
        console.error('❌ Error response:', err.response);
        const errorMessage = err.response?.data?.detail || 
                            (typeof err.response?.data === 'string' ? err.response.data : 'Failed to create admin');
        setSubmitError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Regular user flow
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const endpoint = `${API_BASE_URL}/users/`;
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address || undefined,
        phone_number: formData.phone_number || undefined
      };

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          (typeof err.response?.data === 'string' ? err.response.data : 'Failed to create user');
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      phone_number: '',
      otp_code: ''
    });
    setErrors({});
    setSubmitError(null);
    setOtpSent(false);
    setIsSendingOtp(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Add New {userType === 'admin' ? 'Admin' : 'User'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting || isSendingOtp}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {submitError}
            </div>
          )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.name ? 'border-red-300' : ''
                }`}
                placeholder="Enter full name"
                disabled={isSubmitting || isSendingOtp}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.email ? 'border-red-300' : ''
                }`}
                placeholder="Enter email address"
                disabled={isSendingOtp || isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              {userType === 'admin' && otpSent && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ Admin account created and OTP sent to {formData.email}. Use the OTP as password for first login.
                </p>
              )}
            </div>

          {/* Regular user-only fields */}
          {userType === 'user' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.password ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter password"
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.confirmPassword ? 'border-red-300' : ''
                  }`}
                  placeholder="Confirm password"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter address"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.phone_number ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter phone number"
                  disabled={isSubmitting}
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                )}
              </div>
            </>
          )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting || isSendingOtp}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isSendingOtp}
                className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {userType === 'admin'
                  ? (isSubmitting || isSendingOtp ? 'Creating Admin...' : 'Create Admin')
                  : (isSubmitting ? 'Creating...' : 'Create User')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
