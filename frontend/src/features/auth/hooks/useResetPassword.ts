import { useState } from 'react';
import { forgotPasswordService } from '../../../services/authService';

interface UseResetPasswordOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function useResetPassword(options: UseResetPasswordOptions) {
  const [loading, setLoading] = useState(false);

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true);
    try {
      const result = await forgotPasswordService.resetPassword(token, newPassword);
      
      if (result.success) {
        options.onSuccess && options.onSuccess(result.message || 'Password reset successfully');
      } else {
        options.onError && options.onError(result.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      options.onError && options.onError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading };
}
