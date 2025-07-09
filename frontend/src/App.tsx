// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; // Import the new DashboardPage
import UserManagementPage from './pages/UserManagementPage'; // Import UserManagementPage

// Define a type for the user data
interface UserData {
  id: number;
  name: string; 
  email: string;
  role: string;
}

// Main App component for the login/registration/dashboard
const App = () => {
  // State to toggle between 'login', 'register', and 'dashboard' views
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', or 'dashboard'
  // State for authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State to store logged-in user data
  const [loggedInUser, setLoggedInUser] = useState<UserData | null>(null); // Initialize as null

  // Function to handle successful login, redirecting to dashboard
  const handleLoginSuccess = useCallback((user: UserData) => { // Now expects full user object
    setIsAuthenticated(true);
    setLoggedInUser(user); // Store the logged-in user's data
    setCurrentView('dashboard'); // Switch to dashboard view on successful login
    // In a real app, you'd store token/user info in localStorage and verify on app load
  }, []);

  // Function to handle logout
  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setLoggedInUser(null);
    setCurrentView('login'); // Redirect to login page
    // In a real app, you'd clear the token from localStorage here
  }, []);

  // Function to switch views (for login/register toggle)
  const toggleView = useCallback((view: 'login' | 'register') => {
    setCurrentView(view);
    // Clear login/register form states if needed
  }, []);

  // Effect to handle initial load or refresh (simple check for now)
  // In a real app, you'd check for a stored token here
  useEffect(() => {
    // For now, if isAuthenticated is true, we assume user is logged in
    // and render dashboard. Otherwise, default to login.
    // More robust check would involve verifying a token from localStorage
    if (isAuthenticated && loggedInUser) { // Also check if loggedInUser exists
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  }, [isAuthenticated, loggedInUser]); // Rerun if isAuthenticated or loggedInUser changes

  // Render content based on authentication status and current view
  const renderAppContent = () => {
    if (isAuthenticated && currentView === 'dashboard' && loggedInUser) {
      return <DashboardPage user={loggedInUser} onLogout={handleLogout} />; // Pass user data and logout handler
    } else if (currentView === 'login') {
      return <LoginPage toggleView={toggleView} onLoginSuccess={handleLoginSuccess} />;
    } else if (currentView === 'register') {
      return <RegisterPage toggleView={toggleView} />;
    }
    return null; // Should not happen
  };

  return (
    // Main container for the entire page, using flexbox for layout
    // This outer div remains consistent for all views
    <div className="min-h-screen w-full flex items-center justify-center bg-green-900 font-inter">
      {/* Conditional rendering of the main content based on view */}
      {/* If authenticated and on dashboard, render DashboardPage directly */}
      {isAuthenticated && currentView === 'dashboard' && loggedInUser ? (
        <DashboardPage user={loggedInUser} onLogout={handleLogout} /> // Pass user data and logout handler
      ) : (
        // Otherwise, render the shared login/register card structure
        <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto rounded-lg shadow-2xl overflow-hidden">
          {/* Left section: Image background with a dark overlay */}
          <div className="relative flex-1 bg-cover bg-center h-64 md:h-auto"
               style={{ backgroundImage: `url('/images/pictures/indexbg.png')` }}>
            <div className="absolute inset-0 bg-green-900 opacity-70"></div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <p className="text-white text-3xl font-bold text-center">
                SAN PEDRO, LAGUNA <br/> PHILIPPINES
              </p>
            </div>
          </div>

          {/* Right section: Login/Registration form container */}
          <div className="flex-1 bg-green-800 p-8 md:p-12 flex flex-col justify-center">
            {/* Header with logos and office name */}
            <div className="text-center mb-8">
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
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                City Veterinary Office
              </h1>
              <h2 className="text-white text-xl md:text-2xl font-semibold">
                San Pedro, Laguna
              </h2>
            </div>

            {/* Render either LoginPage or RegisterPage based on currentView */}
            {currentView === 'login' ? (
              <LoginPage toggleView={toggleView} onLoginSuccess={handleLoginSuccess} />
            ) : (
              <RegisterPage toggleView={toggleView} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
