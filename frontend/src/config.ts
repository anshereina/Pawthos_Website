// Centralized config for API endpoints and other constants
// Using pawthos_app backend (mobile backend) for both mobile and web apps

// Force HTTPS for Railway backend - NUCLEAR FIX
const getApiBaseUrl = () => {
  // Ignore localhost URLs completely
  const envUrl = process.env.REACT_APP_API_URL || 
    (process.env.REACT_APP_API_BASE_URL && !process.env.REACT_APP_API_BASE_URL.includes('localhost') ? process.env.REACT_APP_API_BASE_URL : null) ||
    'https://pawthoswebsite-production.up.railway.app';
  
  // ALWAYS force HTTPS for Railway - no exceptions
  if (envUrl.includes('pawthoswebsite-production.up.railway.app')) {
    const httpsUrl = 'https://pawthoswebsite-production.up.railway.app';
    return httpsUrl;
  }
  
  // Force HTTPS for any Railway URL
  if (envUrl.includes('.railway.app')) {
    const httpsUrl = envUrl.replace('http://', 'https://');
    return httpsUrl;
  }
  
  // If it's HTTP and contains railway, force HTTPS
  if (envUrl.startsWith('http://') && envUrl.includes('railway')) {
    const httpsUrl = envUrl.replace('http://', 'https://');
    return httpsUrl;
  }
  
  return envUrl;
};

let API_BASE_URL = getApiBaseUrl();

// FINAL SAFETY CHECK - Never allow HTTP for Railway
if (API_BASE_URL.startsWith('http://') && API_BASE_URL.includes('railway')) {
  API_BASE_URL = API_BASE_URL.replace('http://', 'https://');
}

// ABSOLUTE FINAL CHECK - Force HTTPS for ANY Railway URL (catch-all)
if (API_BASE_URL.includes('railway.app')) {
  API_BASE_URL = API_BASE_URL.replace(/^http:\/\//, 'https://');
}

export { API_BASE_URL };

export const config = {
  apiUrl: API_BASE_URL,
}; 