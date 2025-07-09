// src/pages/RegisterPage.tsx
import React, { useState, useCallback } from 'react';

// Define props for RegisterPage to receive toggleView function
interface RegisterPageProps {
  toggleView: (view: 'login' | 'register') => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ toggleView }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = useCallback(async () => {
    setMessage(''); // Clear previous messages
    try {
      const backendUrl = 'http://localhost:5001/api/register';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // IMPORTANT CHANGE: Set role to 'admin' for web app registration
        body: JSON.stringify({ name, email, password, role: 'admin' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Registration successful! User: ${data.user.name}, Role: ${data.user.role}`); // Show role
        console.log('Registration successful:', data);
        // Switch to login view after successful registration
        toggleView('login');
        // Clear form fields
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setMessage(`Registration failed: ${data.message}`);
        console.error('Registration failed:', data);
      }
    } catch (error) {
      setMessage('An error occurred during registration. Please try again.');
      console.error('Error during registration:', error);
    }
  }, [name, email, password, toggleView]);

  return (
    <>
      {/* Registration View */}
      <p className="text-gray-200 text-center mb-6 text-lg">
        Create your account
      </p>

      {/* Message display area */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message}
        </div>
      )}

      {/* Name input field */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            id="registerName"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {/* Name icon */}
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
            className="lucide lucide-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>

      {/* Email input field for registration */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="email"
            id="registerEmail"
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

      {/* Password input field for registration */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="password"
            id="registerPassword"
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

      {/* Register Button */}
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg"
        onClick={handleRegister}
      >
        Register
      </button>

      {/* Already have an account? and Login link */}
      <div className="flex justify-center items-center mt-6 text-sm">
        <p className="text-gray-200">Already have an account?</p>
        <a href="#" className="ml-2 text-green-300 hover:underline" onClick={(e) => { e.preventDefault(); toggleView('login'); }}>
          Log In
        </a>
      </div>
    </>
  );
};

export default RegisterPage;
