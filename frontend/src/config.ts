// Centralized config for API endpoints and other constants
// Using pawthos_app backend (mobile backend) for both mobile and web apps

// Force HTTPS for Railway backend - NUCLEAR FIX
const getApiBaseUrl = () => {
  // Ignore localhost URLs completely
  const envUrl = process.env.REACT_APP_API_URL || 
    (process.env.REACT_APP_API_BASE_URL && !process.env.REACT_APP_API_BASE_URL.includes('localhost') ? process.env.REACT_APP_API_BASE_URL : null) ||
    'https://pawthoswebsite-production.up.railway.app';
  
  // Always force HTTPS for Railway
  if (envUrl.includes('pawthoswebsite-production.up.railway.app')) {
    return 'https://pawthoswebsite-production.up.railway.app';
  }
  
  // Force HTTPS for any Railway URL
  if (envUrl.includes('.railway.app')) {
    return envUrl.replace('http://', 'https://');
  }
  
  return envUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Debug logging
console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);
console.log('🔧 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🔧 REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

export const config = {
  apiUrl: API_BASE_URL,
}; 