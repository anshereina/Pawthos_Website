// src/pages/LoginPage.tsx
import React, { useState, useCallback } from 'react';

// Define a type for the user data that will be passed on login success
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Define props for LoginPage to receive toggleView and onLoginSuccess functions
interface LoginPageProps {
  toggleView: (view: 'login' | 'register') => void;
  onLoginSuccess: (user: UserData) => void; // Now expects full user object
}

const LoginPage: React.FC<LoginPageProps> = ({ toggleView, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = useCallback(async () => {
    setMessage(''); // Clear previous messages
    try {
      const backendUrl = 'http://localhost:5001/api/login';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Login successful! Role: ${data.user.role}`);
        console.log('Login successful:', data);
        // Call the onLoginSuccess callback passed from App.tsx with the full user object
        onLoginSuccess(data.user); // Pass the entire user object
      } else {
        setMessage(`Login failed: ${data.message}`);
        console.error('Login failed:', data);
      }
    } catch (error) {
      setMessage('An error occurred during login. Please try again.');
      console.error('Error during login:', error);
    }
  }, [email, password, onLoginSuccess]);

  return (
    <>
      {/* Login View */}
      <p className="text-gray-200 text-center mb-6 text-lg">
        Login to your account
      </p>

      {/* Message display area */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message}
        </div>
      )}

      {/* Email input field */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="email"
            id="loginEmail"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {/* Email icon */}
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

      {/* Password input field */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="password"
            id="loginPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {/* Password icon */}
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

      {/* Remember Me and Forgot Password links */}
      <div className="flex justify-between items-center mb-6 text-sm">
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

      {/* Login Button */}
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg"
        onClick={handleLogin}
      >
        Log In
      </button>

      {/* Don't have an account? and Register/Help links */}
      <div className="flex justify-center items-center mt-6 text-sm">
        <p className="text-gray-200">Don't have an account?</p>
        <a href="#" className="ml-2 text-green-300 hover:underline" onClick={(e) => { e.preventDefault(); toggleView('register'); }}>
          Register
        </a>
        <span className="text-gray-200 mx-2">|</span>
        <a href="#" className="text-green-300 hover:underline" onClick={(e) => e.preventDefault()}>
          Help!
        </a>
      </div>
    </>
  );
};

export default LoginPage;
