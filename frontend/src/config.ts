// Centralized config for API endpoints and other constants
// Using pawthos_app backend (mobile backend) for both mobile and web apps

// Force HTTPS for Railway backend - NUCLEAR FIX
const getApiBaseUrl = () => {
  // Ignore localhost URLs completely
  const envUrl = process.env.REACT_APP_API_URL || 
    (process.env.REACT_APP_API_BASE_URL && !process.env.REACT_APP_API_BASE_URL.includes('localhost') ? process.env.REACT_APP_API_BASE_URL : null) ||
    'https://pawthoswebsite-production.up.railway.app';
  
  console.log('🔧 Raw envUrl from environment:', envUrl);
  
  // ALWAYS force HTTPS for Railway - no exceptions
  if (envUrl.includes('pawthoswebsite-production.up.railway.app')) {
    const httpsUrl = 'https://pawthoswebsite-production.up.railway.app';
    console.log('🔧 Forcing HTTPS for Railway:', httpsUrl);
    return httpsUrl;
  }
  
  // Force HTTPS for any Railway URL
  if (envUrl.includes('.railway.app')) {
    const httpsUrl = envUrl.replace('http://', 'https://');
    console.log('🔧 Converting Railway URL to HTTPS:', httpsUrl);
    return httpsUrl;
  }
  
  // If it's HTTP and contains railway, force HTTPS
  if (envUrl.startsWith('http://') && envUrl.includes('railway')) {
    const httpsUrl = envUrl.replace('http://', 'https://');
    console.log('🔧 Converting HTTP Railway to HTTPS:', httpsUrl);
    return httpsUrl;
  }
  
  console.log('🔧 Using original URL:', envUrl);
  return envUrl;
};

let API_BASE_URL = getApiBaseUrl();

// FINAL SAFETY CHECK - Never allow HTTP for Railway
if (API_BASE_URL.startsWith('http://') && API_BASE_URL.includes('railway')) {
  API_BASE_URL = API_BASE_URL.replace('http://', 'https://');
  console.log('🚨 FINAL SAFETY: Converted HTTP Railway to HTTPS:', API_BASE_URL);
}

// ABSOLUTE FINAL CHECK - Force HTTPS for ANY Railway URL (catch-all)
if (API_BASE_URL.includes('railway.app')) {
  API_BASE_URL = API_BASE_URL.replace(/^http:\/\//, 'https://');
  console.log('🔒 ABSOLUTE FINAL: Forced HTTPS for Railway:', API_BASE_URL);
}

export { API_BASE_URL };

// Debug logging
console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);
console.log('🔧 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🔧 REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

export const config = {
  apiUrl: API_BASE_URL,
}; 