import { useState } from 'react';
import { forgotPasswordService } from '../../../services/authService';

interface UseForgotPasswordOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function useForgotPassword(options: UseForgotPasswordOptions) {
  const [loading, setLoading] = useState(false);

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    try {
      const result = await forgotPasswordService.requestPasswordReset(email);
      
      if (result.success) {
        options.onSuccess && options.onSuccess(result.message || 'Password reset email sent successfully! Check your inbox.');
      } else {
        options.onError && options.onError(result.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      // Provide user-friendly error messages
      let msg = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail;
        
        if (status === 404) {
          msg = 'Email address not found. Please check and try again.';
        } else if (status === 422) {
          msg = 'Invalid email format. Please enter a valid email address.';
        } else if (status >= 500) {
          msg = 'Server error. Please try again later or contact support.';
        } else if (detail) {
          msg = detail;
        }
      } else if (error.request) {
        msg = 'Network error. Please check your internet connection.';
      }
      
      options.onError && options.onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return { requestPasswordReset, loading };
}
