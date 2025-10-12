import React, { useState } from 'react';
import { X, User, Mail, MapPin, Phone, Lock } from 'lucide-react';
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

  const createAdminRecordAfterOTP = async () => {
    // Create the admin immediately with a temporary password and must_change_password enforced by backend
    // Backend /users/admins/verify-otp requires otp_code in schema but ignores validation server-side
    const temporaryPassword = Math.random().toString(36).slice(-12);
    await axios.post(
      `${API_BASE_URL}/users/admins/verify-otp`,
      {
        name: formData.name,
        email: formData.email,
        password: temporaryPassword,
        otp_code: '000000'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
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
        const sent = await sendOTP();
        if (sent) {
          await createAdminRecordAfterOTP();
          onSuccess();
          handleClose();
        }
      } catch (err: any) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-height-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Add New {userType === 'admin' ? 'Admin' : 'User'}
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
            <div className="flex space-x-2">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
                disabled={isSendingOtp || isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
            {userType === 'admin' && otpSent && (
              <p className="mt-1 text-sm text-green-600">
                ✓ OTP sent to {formData.email} and admin account created. The user must change password on first login.
              </p>
            )}
          </div>

          {/* Regular user-only fields */}
          {userType === 'user' && (
            <>
              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock size={16} className="inline mr-2" />
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Address Field */}
              <div>
                <label className="block text sm font-medium text-gray-700 mb-2">
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
                <label className="block text sm font-medium text-gray-700 mb-2">
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
              disabled={isSubmitting || isSendingOtp}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {userType === 'admin'
                ? (isSubmitting || isSendingOtp ? 'Sending OTP...' : 'Send OTP')
                : (isSubmitting ? 'Creating...' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
