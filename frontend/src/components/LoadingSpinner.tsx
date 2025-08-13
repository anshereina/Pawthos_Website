import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  fullScreen = true 
}) => {
  const content = (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen bg-gray-100 font-inter w-full items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner; 