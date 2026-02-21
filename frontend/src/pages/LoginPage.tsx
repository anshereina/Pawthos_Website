// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import LoginForm from '../features/auth/components/LoginForm';
import { useAuth } from '../features/auth/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage: React.FC = () => {
  const { setUser, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: '/dashboard' });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-gray-900 via-green-900 to-green-800">
      <div className="hidden md:block md:w-3/5 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/pictures/indexbg.png)',
            filter: 'brightness(0.4) sepia(1) hue-rotate(120deg) saturate(2)',
          }}
        />
        <div className="absolute inset-0 bg-green-900 bg-opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center h-full px-8">
          <div className="text-center text-white max-w-xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Welcome to Pawthos
            </h1>
            <p className="text-base lg:text-xl opacity-90">
              San Pedro City Veterinary Office management system for medical records, vaccination drives, and animal control.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-2/5 bg-green-900/90 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-0">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl md:rounded-none md:bg-transparent md:backdrop-blur-0 md:shadow-none shadow-lg border border-white/10 md:border-none">
          <div className="text-center px-4 pt-6 pb-6 sm:pt-8 sm:pb-8">
            <div className="flex justify-center items-center mb-4 sm:hidden gap-4">
              <img 
                src="/images/logos/SanPedro.png" 
                alt="San Pedro Logo" 
                className="h-10 w-auto"
              />
              <img 
                src="/images/logos/CityVet.jpg" 
                alt="CityVet Logo" 
                className="h-10 w-auto rounded-md"
              />
            </div>

            {/* Desktop/tablet logos */}
            <div className="hidden sm:flex justify-center items-center mb-6 gap-8">
              <img 
                src="/images/logos/SanPedro.png" 
                alt="San Pedro Logo" 
                className="h-16 w-auto"
              />
              <img 
                src="/images/logos/CityVet.jpg" 
                alt="CityVet Logo" 
                className="h-16 w-auto rounded-md"
              />
            </div>
            
            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              City Veterinary Office
            </h1>
            <p className="text-sm sm:text-lg text-green-100 font-medium">
              San Pedro, Laguna
            </p>
          </div>
          
          <div className="px-4 pb-6 sm:px-6 sm:pb-8">
            <LoginForm
              onLoginSuccess={(user) => {
                setUser(user);
                navigate({ to: '/dashboard' });
              }}
            />
            
            {/* Contact Admin Message */}
            <div className="text-center mt-4 sm:mt-6">
              <p className="text-green-100 text-xs sm:text-sm opacity-90">
                Need access? Contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
