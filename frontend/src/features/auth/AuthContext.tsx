import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

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

interface AuthContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Decode JWT token to get user type
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          try {
            // Use a more robust base64 decoding
            const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            const userType = payload.user_type || 'admin';
            
            // Fetch user data using the stored token
            const response = await axios.get(`${API_BASE_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const userWithRole = {
              ...response.data,
              role: userType
            };
            
            setUser(userWithRole);
          } catch (decodeError) {
            console.error('Token decode error:', decodeError);
            // Fallback: try to determine user type from user data
            const response = await axios.get(`${API_BASE_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Check if it's an admin by looking for admin-specific fields
            const userData = response.data;
            const isAdmin = userData && !userData.address && userData.is_confirmed !== undefined;
            const userWithRole = {
              ...userData,
              role: isAdmin ? 'admin' : 'user'
            };
            
            setUser(userWithRole);
          }
        } else {
          throw new Error('Invalid token format');
        }
      } catch (error: any) {
        // If token is invalid, remove it
        console.error('Failed to restore session:', error);
        localStorage.removeItem('access_token');
        setUser(null);
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    // Ensure redirect to login from any page
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isAuthenticated: !!user, 
      isLoading,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 