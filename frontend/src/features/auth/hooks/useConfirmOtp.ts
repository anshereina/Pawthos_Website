import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';

interface ConfirmOtpForm {
  email: string;
  otp_code: string;
}

interface UseConfirmOtpOptions {
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export default function useConfirmOtp(options: UseConfirmOtpOptions) {
  const [loading, setLoading] = useState(false);

  const confirmOtp = async (form: ConfirmOtpForm) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/confirm-otp`, form);
      setLoading(false);
      options.onSuccess && options.onSuccess();
    } catch (err: any) {
      setLoading(false);
      const msg = err.response?.data?.detail || 'OTP confirmation failed';
      options.onError && options.onError(msg);
    }
  };

  return { confirmOtp, loading };
} 