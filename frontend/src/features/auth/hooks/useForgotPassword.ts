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
        options.onSuccess && options.onSuccess(result.message || 'Password reset email sent successfully');
      } else {
        options.onError && options.onError(result.message || 'Failed to send password reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      options.onError && options.onError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { requestPasswordReset, loading };
}
