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
      console.log('Attempting login with:', form.email);
      
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://pawthoswebsite-production.up.railway.app';
      
      const loginRes = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email: form.email, password: form.password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log('Login response:', JSON.stringify(loginRes.data, null, 2));
      const { access_token, user_type } = loginRes.data;
      localStorage.setItem('access_token', access_token);
      
      // Fallback: if user_type is not in response, determine from user data
      let finalUserType = user_type;
      
      const userRes = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      
      console.log('User data response:', JSON.stringify(userRes.data, null, 2));
      
      // If user_type is not provided, determine from user data
      if (!finalUserType) {
        const userData = userRes.data;
        finalUserType = userData && !userData.address && userData.is_confirmed !== undefined ? 'admin' : 'user';
      }
      
      // Add the user_type as role to the user data
      const userData = {
        ...userRes.data,
        role: finalUserType
      };
      
      console.log('Final user data:', JSON.stringify(userData, null, 2));
      setLoading(false);
      options.onSuccess && options.onSuccess(userData);
    } catch (err: any) {
      console.error('Login error:', err);
      setLoading(false);
      const msg = err.response?.data?.detail || 'Login failed';
      options.onError && options.onError(msg);
    }
  };

  return { login, loading };
} 