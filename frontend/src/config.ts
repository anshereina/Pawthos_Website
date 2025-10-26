// Centralized config for API endpoints and other constants
// Using pawthos_app backend (mobile backend) for both mobile and web apps

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export const config = {
  apiUrl: API_BASE_URL,
}; 