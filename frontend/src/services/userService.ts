import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  photo_url?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const userService = {
  // Update current user's profile
  updateProfile: async (userData: UpdateUserData) => {
    const response = await axios.put(
      `${API_BASE_URL}/users/update-profile`,
      userData,
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  },
};
