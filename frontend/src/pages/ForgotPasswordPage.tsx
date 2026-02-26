import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import useForgotPassword from '../features/auth/hooks/useForgotPassword';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const { requestPasswordReset, loading } = useForgotPassword({
    onSuccess: (msg) => {
      setMessage(msg);
      setIsSuccess(true);
    },
    onError: (msg) => {
      setMessage(msg);
      setIsSuccess(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setIsSuccess(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage('Please enter a valid email address');
      setIsSuccess(false);
      return;
    }

    requestPasswordReset(email.trim());
  };

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
            <h1 className="text-4xl font-bold mb-4">Reset Your Password</h1>
            <p className="text-xl opacity-90">We'll help you get back into your account</p>
          </div>
        </div>
      </div>

      {/* Right Column - Forgot Password Form (40%) */}
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

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit}>
            {/* Instructional Text */}
            <p className="text-white text-center mb-8 text-lg">
              Enter your email address and we'll send you instructions to reset your password
            </p>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg shadow-lg border-2 ${
                isSuccess 
                  ? 'bg-green-600 border-green-400' 
                  : 'bg-red-600 border-red-400'
              } text-white animate-fadeIn relative`}>
                <button
                  onClick={() => setMessage('')}
                  className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
                  aria-label="Dismiss message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="flex items-center justify-center gap-2 pr-6">
                  {isSuccess ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-semibold">{message}</span>
                </div>
                {!isSuccess && (
                  <p className="text-sm mt-2 text-green-100">
                    Please verify your email address and try again.
                  </p>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-green-700 bg-opacity-50 rounded-lg p-4 mb-6 border-l-4 border-green-400">
              <p className="text-green-100 text-sm">
                💡 Don't worry! We'll send you an email with a link to reset your password. 
                Make sure to check your spam folder if you don't see it in your inbox.
              </p>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="email"
                  id="forgotEmail"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-green-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 border border-green-600"
                  disabled={loading}
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition duration-300 ease-in-out shadow-lg mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>

            {/* Back to Login Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate({ to: '/login' })}
                className="text-green-300 hover:underline"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
