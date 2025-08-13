import { useState } from 'react';
import axios from 'axios';

interface LoginForm {
  email: string;
  password: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  address?: string;
  phone_number?: string;
  created_at?: string;
  is_confirmed?: boolean;
}

interface UseLoginOptions {
  onSuccess?: (user: UserData) => void;
  onError?: (msg: string) => void;
}

export default function useLogin(options: UseLoginOptions) {
  const [loading, setLoading] = useState(false);

  const login = async (form: LoginForm) => {
    setLoading(true);
    try {
      const loginRes = await axios.post(
        'http://localhost:8000/auth/login',
        { email: form.email, password: form.password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { access_token } = loginRes.data;
      localStorage.setItem('access_token', access_token);
      const userRes = await axios.get('http://localhost:8000/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      setLoading(false);
      options.onSuccess && options.onSuccess(userRes.data);
    } catch (err: any) {
      setLoading(false);
      const msg = err.response?.data?.detail || 'Login failed';
      options.onError && options.onError(msg);
    }
  };

  return { login, loading };
} 