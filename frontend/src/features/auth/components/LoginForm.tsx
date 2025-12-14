import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import useLogin from '../hooks/useLogin';
import { rememberMeService } from '../../../services/authService';

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

interface LoginFormProps {
  onLoginSuccess: (user: UserData) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<{ email: string; password: string } | null>(null);
  const navigate = useNavigate();

  // Don't load saved credentials - start fresh every time
  // const loadSavedCredentials = () => {
  //   const credentials = rememberMeService.getCredentials();
  //   if (credentials) {
  //     setSavedCredentials(credentials);
  //     setRememberMe(true);
  //     console.log('✅ Remember Me credentials loaded but not auto-filled');
  //   }
  // };

  // const saveCredentials = (email: string, password: string) => {
  //   rememberMeService.saveCredentials(email, password);
  // };

  // const clearCredentials = () => {
  //   rememberMeService.clearCredentials();
  //   setSavedCredentials(null);
  //   setRememberMe(false);
  //   setEmail('');
  //   setPassword('');
  // };

  // Clear old credentials on component mount to ensure clean start
  useEffect(() => {
    // Clear any existing credentials to start fresh
    rememberMeService.clearAllAuthData();
    setSavedCredentials(null);
    setRememberMe(false);
    setEmail('');
    setPassword('');
    console.log('🧹 Cleared all authentication data for fresh start');
  }, []);

  // Remove the aggressive clearing that was preventing typing
  // useEffect(() => {
  //   setEmail('');
  //   setPassword('');
  //   setRememberMe(false);
  // });

  const { login, loading } = useLogin({
    onSuccess: (user) => {
      if (user.role !== 'admin') {
        setMessage('Access denied. Only administrators can access this system.');
        return;
      }
      setMessage('Login successful!');
      
      // Don't save credentials - start fresh every time
      // if (rememberMe) {
      //   saveCredentials(email, password);
      // } else {
      //   clearCredentials();
      // }
      
      onLoginSuccess(user);
    },
    onError: (msg) => setMessage(msg),
  });

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    // Only clear password if there are saved credentials to prevent autofill
    if (savedCredentials && newEmail.trim() !== '' && newEmail.toLowerCase().trim() === savedCredentials.email.toLowerCase()) {
      setPassword(savedCredentials.password);
    } else {
      setPassword('');
    }
  };

  const handleEmailFocus = () => {
    // Only clear if there are saved credentials to prevent autofill
    if (savedCredentials) {
      setEmail('');
      setPassword('');
      setRememberMe(false);
    }
  };

  const handlePasswordFocus = () => {
    // Only clear if there are saved credentials to prevent autofill
    if (savedCredentials) {
      setPassword('');
    }
  };

  const handleLogin = () => {
    setMessage('');
    login({ email, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Hidden inputs to prevent browser autofill */}
      <input type="text" style={{ display: 'none' }} autoComplete="username" />
      <input type="password" style={{ display: 'none' }} autoComplete="current-password" />
      
      {/* Instructional Text */}
      <p className="text-white text-center mb-8 text-lg">
        Login to your account
      </p>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-center ${message.includes('successful') ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {message}
        </div>
      )}

      {/* Email Field */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="email"
            id="loginEmail"
            placeholder="Email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onFocus={handleEmailFocus}
            className="w-full pl-12 pr-4 py-4 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 border border-green-600"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-mail absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.27 6.08a2 2 0 0 1-2.46 0L2 7" />
          </svg>
        </div>
      </div>

      {/* Password Field */}
      <div className="mb-6">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="loginPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handlePasswordFocus}
            className="w-full pl-12 pr-12 py-4 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 border border-green-600"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-eye-off"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-eye"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Helper Controls */}
      <div className="flex justify-between items-center mb-8 text-sm">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="form-checkbox h-4 w-4 text-green-400 rounded border-gray-300 focus:ring-green-400"
          />
          <label htmlFor="rememberMe" className="ml-2 text-gray-200">
            Remember me
          </label>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: '/forgot-password' })}
          className="text-green-300 hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      {/* Log In Button */}
      <button
        type="button"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg mb-8"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>

    </form>
  );
};

export default LoginForm; 