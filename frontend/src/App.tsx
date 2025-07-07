import React, { useState, useCallback } from 'react';

// Main App component for the login page
const App = () => {
  // State for username and password inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // State for messages (e.g., login success/error)
  const [message, setMessage] = useState('');

  // Handler for the login button click
  const handleLogin = useCallback(async () => {
    setMessage(''); // Clear previous messages
    try {
      // Backend URL - ensure this matches your Node.js backend port (5001)
      const backendUrl = 'http://localhost:5001/api/login';

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Login successful! Token: ${data.token}`);
        console.log('Login successful:', data);
        // In a real app, you would save the token (e.g., in localStorage)
        // and redirect the user to the dashboard.
      } else {
        setMessage(`Login failed: ${data.message}`);
        console.error('Login failed:', data);
      }
    } catch (error) {
      setMessage('An error occurred during login. Please try again.');
      console.error('Error during login:', error);
    }
  }, [username, password]); // Depend on username and password to re-create handler if they change

  return (
    // Main container for the entire login page, using flexbox for layout
    // It takes full viewport height and width, centers content, and uses a dark green background
    <div className="min-h-screen w-full flex items-center justify-center bg-green-900 font-inter">
      {/* Container for the login card, applying rounded corners and shadow */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto rounded-lg shadow-2xl overflow-hidden">
        {/* Left section: Image background with a dark overlay */}
        <div className="relative flex-1 bg-cover bg-center h-64 md:h-auto"
             style={{ backgroundImage: `url('/images/pictures/indexbg.png')` }}>
          {/* Dark overlay for the image */}
          <div className="absolute inset-0 bg-green-900 opacity-70"></div>
          {/* Content over the image (e.g., flag, building name) - Placeholder for now */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <p className="text-white text-3xl font-bold text-center">
              SAN PEDRO, LAGUNA <br/> PHILIPPINES
            </p>
          </div>
        </div>

        {/* Right section: Login form */}
        <div className="flex-1 bg-green-800 p-8 md:p-12 flex flex-col justify-center">
          {/* Header with logos and office name */}
          <div className="text-center mb-8">
            {/* Logos */}
            <div className="flex justify-center space-x-4 mb-4">
              <img
                src="/images/logos/CityVet.jpg"
                alt="City Veterinary Office Logo"
                className="w-20 h-20 rounded-full"
              />
              <img
                src="/images/logos/SanPedro.png"
                alt="San Pedro Logo"
                className="w-20 h-20 rounded-full"
              />
            </div>
            {/* Office Name */}
            <h1 className="text-white text-2xl md:text-3xl font-bold">
              City Veterinary Office
            </h1>
            <h2 className="text-white text-xl md:text-2xl font-semibold">
              San Pedro, Laguna
            </h2>
          </div>

          {/* Login prompt */}
          <p className="text-gray-200 text-center mb-6 text-lg">
            Login to your account
          </p>

          {/* Message display area */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-center ${message.includes('successful') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {message}
            </div>
          )}

          {/* Username input field */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                id="username"
                placeholder="Username"
                value={username} // Controlled component: value is tied to state
                onChange={(e) => setUsername(e.target.value)} // Update state on change
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {/* Username icon */}
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

          {/* Password input field */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password} // Controlled component: value is tied to state
                onChange={(e) => setPassword(e.target.value)} // Update state on change
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
            onClick={handleLogin} // Call handleLogin when button is clicked
          >
            Log In
          </button>

          {/* Don't have an account? and Register/Help links */}
          <div className="flex justify-center items-center mt-6 text-sm">
            <p className="text-gray-200">Don't have an account?</p>
            <a href="#" className="ml-2 text-green-300 hover:underline" onClick={(e) => e.preventDefault()}>
              Register
            </a>
            <span className="text-gray-200 mx-2">|</span>
            <a href="#" className="text-green-300 hover:underline" onClick={(e) => e.preventDefault()}>
              Help!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
