import React, { useState } from 'react';
import useLogin from '../hooks/useLogin';

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
  const [message, setMessage] = useState('');

  const { login, loading } = useLogin({
    onSuccess: (user) => {
      setMessage('Login successful!');
      onLoginSuccess(user);
    },
    onError: (msg) => setMessage(msg),
  });

  const handleLogin = () => {
    setMessage('');
    login({ email, password });
  };

  return (
    <>
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
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 border border-green-600"
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
            type="password"
            id="loginPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 border border-green-600"
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
        </div>
      </div>

      {/* Helper Controls */}
      <div className="flex justify-between items-center mb-8 text-sm">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            className="form-checkbox h-4 w-4 text-green-400 rounded border-gray-300 focus:ring-green-400"
          />
          <label htmlFor="rememberMe" className="ml-2 text-gray-200">
            Remember me
          </label>
        </div>
        <a href="#" className="text-green-300 hover:underline" onClick={(e) => e.preventDefault()}>
          Forgot Password?
        </a>
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


    </>
  );
};

export default LoginForm; 