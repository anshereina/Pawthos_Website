// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import LoginForm from '../features/auth/components/LoginForm';
import { useAuth } from '../features/auth/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const { setUser, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: '/dashboard' });
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render login form if user is authenticated
  if (user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full">
      {/* Left Column - Background Image (60%) */}
      <div className="w-3/5 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/pictures/indexbg.png)',
            filter: 'brightness(0.4) sepia(1) hue-rotate(120deg) saturate(2)',
          }}
        />
        <div className="absolute inset-0 bg-green-900 bg-opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to Pawthos</h1>
            <p className="text-xl opacity-90">Your trusted veterinary management system</p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form (40%) */}
      <div className="w-2/5 bg-green-800 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Branding Section */}
          <div className="text-center mb-12">
            {/* Logos */}
            <div className="flex justify-center items-center mb-6">
              <img 
                src="/images/logos/SanPedro.png" 
                alt="San Pedro Logo" 
                className="h-16 w-auto mr-8"
              />
              <img 
                src="/images/logos/CityVet.jpg" 
                alt="CityVet Logo" 
                className="h-16 w-auto"
              />
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-1">
              City Veterinary Office
            </h1>
            <p className="text-lg text-white font-medium">
              San Pedro, Laguna
            </p>
          </div>
          
          <LoginForm
            onLoginSuccess={(user) => {
              setUser(user);
              navigate({ to: '/dashboard' });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
