// Centralized config for API endpoints and other constants
// Using pawthos_app backend (mobile backend) for both mobile and web apps

// Force HTTPS for Railway backend
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'https://pawthoswebsite-production.up.railway.app';
  // Ensure HTTPS for Railway
  if (envUrl.includes('pawthoswebsite-production.up.railway.app')) {
    return envUrl.replace('http://', 'https://');
  }
  return envUrl;
};

export const API_BASE_URL = getApiBaseUrl();

export const config = {
  apiUrl: API_BASE_URL,
}; 