// Authentication utilities for API communication
export type AuthResult = { 
  success: boolean; 
  message?: string; 
  token?: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
};

import { getApiUrl } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = getApiUrl();

// Helper: fetch with timeout to avoid indefinite loading spinners
async function fetchWithTimeout(resource: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(resource, { ...options, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

// Remember Me functionality
export async function saveRememberMeCredentials(email: string, password: string): Promise<void> {
  try {
    const credentials = {
      email: email.toLowerCase().trim(),
      password: password,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem('rememberMe', JSON.stringify(credentials));
    console.log('✅ Remember Me credentials saved successfully');
  } catch (error) {
    console.error('❌ Error saving remember me credentials:', error);
    throw new Error('Failed to save credentials');
  }
}

export async function getRememberMeCredentials(): Promise<{ email: string; password: string; timestamp?: number } | null> {
  try {
    const credentials = await AsyncStorage.getItem('rememberMe');
    if (!credentials) return null;
    
    const parsedCredentials = JSON.parse(credentials);
    
    // Check if credentials are older than 30 days (optional security measure)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (parsedCredentials.timestamp && parsedCredentials.timestamp < thirtyDaysAgo) {
      console.log('🕒 Remember Me credentials expired, clearing...');
      await clearRememberMeCredentials();
      return null;
    }
    
    console.log('✅ Remember Me credentials retrieved successfully');
    return parsedCredentials;
  } catch (error) {
    console.error('❌ Error getting remember me credentials:', error);
    return null;
  }
}

export async function clearRememberMeCredentials(): Promise<void> {
  try {
    await AsyncStorage.removeItem('rememberMe');
    console.log('✅ Remember Me credentials cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing remember me credentials:', error);
    throw new Error('Failed to clear credentials');
  }
}

export async function hasRememberMeCredentials(): Promise<boolean> {
  try {
    const credentials = await getRememberMeCredentials();
    return credentials !== null;
  } catch (error) {
    console.error('❌ Error checking remember me credentials:', error);
    return false;
  }
}

export async function updateRememberMeCredentials(email: string, password: string): Promise<void> {
  try {
    const existingCredentials = await getRememberMeCredentials();
    if (existingCredentials && existingCredentials.email.toLowerCase() === email.toLowerCase()) {
      // Update existing credentials
      await saveRememberMeCredentials(email, password);
      console.log('✅ Remember Me credentials updated successfully');
    } else {
      // Save new credentials
      await saveRememberMeCredentials(email, password);
      console.log('✅ New Remember Me credentials saved successfully');
    }
  } catch (error) {
    console.error('❌ Error updating remember me credentials:', error);
    throw new Error('Failed to update credentials');
  }
}

// Complete app data reset function
export async function resetAllAppData(): Promise<void> {
  try {
    console.log('🔄 Resetting all app data...');
    
    // Clear all AsyncStorage data
    await AsyncStorage.clear();
    
    console.log('✅ All app data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing app data:', error);
    throw new Error('Failed to clear app data');
  }
}

// Debug function to see what's stored in AsyncStorage
export async function debugAsyncStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('📱 AsyncStorage Keys:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`🔑 ${key}:`, value);
    }
  } catch (error) {
    console.error('❌ Error reading AsyncStorage:', error);
  }
}

// Forgot Password functionality
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        success: false,
        message: "Please enter a valid email address"
      };
    }

    console.log('🔄 Requesting password reset for:', email);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    }, 10000);

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Password reset email sent successfully');
      return { 
        success: true, 
        message: data.message || "Password reset email sent successfully. Please check your inbox and spam folder." 
      };
    } else {
      console.log('❌ Password reset request failed:', data.detail);
      return { 
        success: false, 
        message: data.detail || "Failed to send password reset email. Please try again later." 
      };
    }
  } catch (error: any) {
    console.error('❌ Password reset request error:', error);
    const timedOut = typeof error?.name === 'string' && error.name === 'AbortError';
    return { 
      success: false, 
      message: timedOut
        ? 'Connection timed out. Please check your internet connection and try again.'
        : "Network error. Please check your connection and try again." 
    };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  try {
    // Validate password strength
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters long"
      };
    }

    console.log('🔄 Resetting password with token...');
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token, 
        new_password: newPassword 
      }),
    }, 10000);

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Password reset successfully');
      return { 
        success: true, 
        message: data.message || "Password reset successfully. You can now log in with your new password." 
      };
    } else {
      console.log('❌ Password reset failed:', data.detail);
      return { 
        success: false, 
        message: data.detail || "Failed to reset password. The token may be invalid or expired." 
      };
    }
  } catch (error: any) {
    console.error('❌ Password reset error:', error);
    const timedOut = typeof error?.name === 'string' && error.name === 'AbortError';
    return { 
      success: false, 
      message: timedOut
        ? 'Connection timed out. Please check your internet connection and try again.'
        : "Network error. Please check your connection and try again." 
    };
  }
}

// Additional Forgot Password utility functions
export async function validatePasswordResetToken(token: string): Promise<AuthResult> {
  try {
    console.log('🔍 Validating password reset token...');
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/validate-reset-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    }, 8000);

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Password reset token is valid');
      return { 
        success: true, 
        message: data.message || "Token is valid" 
      };
    } else {
      console.log('❌ Password reset token is invalid:', data.detail);
      return { 
        success: false, 
        message: data.detail || "Invalid or expired reset token" 
      };
    }
  } catch (error: any) {
    console.error('❌ Token validation error:', error);
    const timedOut = typeof error?.name === 'string' && error.name === 'AbortError';
    return { 
      success: false, 
      message: timedOut
        ? 'Connection timed out. Please check your internet connection and try again.'
        : "Network error. Please check your connection and try again." 
    };
  }
}

export async function resendPasswordReset(email: string): Promise<AuthResult> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        success: false,
        message: "Please enter a valid email address"
      };
    }

    console.log('🔄 Resending password reset for:', email);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/resend-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    }, 10000);

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Password reset email resent successfully');
      return { 
        success: true, 
        message: data.message || "Password reset email resent successfully. Please check your inbox and spam folder." 
      };
    } else {
      console.log('❌ Resend password reset failed:', data.detail);
      return { 
        success: false, 
        message: data.detail || "Failed to resend password reset email. Please try again later." 
      };
    }
  } catch (error: any) {
    console.error('❌ Resend password reset error:', error);
    const timedOut = typeof error?.name === 'string' && error.name === 'AbortError';
    return { 
      success: false, 
      message: timedOut
        ? 'Connection timed out. Please check your internet connection and try again.'
        : "Network error. Please check your connection and try again." 
    };
  }
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<AuthResult> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }, 8000);

    const data = await response.json();
    
    if (response.ok && data.access_token) {
      // Store token in local storage for future requests
      await AsyncStorage.setItem('authToken', data.access_token);
      
      // Fetch complete user profile including photo_url
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (profileResponse.ok) {
          const fullUserData = await profileResponse.json();
          // Store complete user data including photo_url
          await AsyncStorage.setItem('user', JSON.stringify(fullUserData));
          console.log('Full user profile stored after login:', fullUserData);
        } else {
          // Fallback to basic data if profile fetch fails
          await AsyncStorage.setItem('user', JSON.stringify({
            id: data.id,
            email: data.email,
            name: data.name
          }));
        }
      } catch (profileError) {
        console.error('Error fetching full profile after login:', profileError);
        // Fallback to basic data
        await AsyncStorage.setItem('user', JSON.stringify({
          id: data.id,
          email: data.email,
          name: data.name
        }));
      }
      
      // Handle Remember Me functionality
      if (rememberMe) {
        await updateRememberMeCredentials(email, password);
      } else {
        // Clear saved credentials if "Remember me" is unchecked
        await clearRememberMeCredentials();
      }
      
      return { 
        success: true, 
        token: data.access_token,
        user: {
          id: data.id,
          email: data.email,
          name: data.name
        }
      };
    } else {
      return { 
        success: false, 
        message: data.detail || "Login failed" 
      };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    const timedOut = typeof error?.name === 'string' && error.name === 'AbortError';
    return {
      success: false,
      message: timedOut
        ? 'Connection timed out. Ensure your device can reach the API and try again.'
        : 'Network error. Please check your Wi‑Fi/VPN and API URL.'
    };
  }
}

export async function signup(
  email: string,
  password: string,
  name?: string,
  phoneNumber?: string,
  address?: string,
  otpMethod: 'email' | 'sms' = 'email'
): Promise<AuthResult> {
  try {
    const signupUrl = `${API_BASE_URL}/register`;
    console.log('🔵 Signup URL:', signupUrl);
    console.log('🔵 Signup payload:', { email, name, phone_number: phoneNumber, address });
    
    const response = await fetchWithTimeout(signupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Align payload keys with backend expectations (FastAPI UserCreate)
      body: JSON.stringify({
        email,
        password,
        name,
        phone_number: phoneNumber,
        address,
      }),
    }, 30000); // Increased to 30 seconds

    if (!response.ok) {
      // Try to parse structured error; fallback to text
      const errorText = await response.text();
      try {
        const errJson = JSON.parse(errorText);
        return { success: false, message: errJson.detail || 'Signup failed' };
      } catch (_) {
        return { success: false, message: errorText || 'Signup failed' };
      }
    }

    const user = await response.json();
    return {
      success: true,
      message: 'Registration successful. You can now log in.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    const timedOut = typeof error?.name === 'string' && error.name === 'AbortError';
    return {
      success: false,
      message: timedOut
        ? 'Connection timed out. Ensure your device can reach the API and try again.'
        : 'Network error. Please check your Wi‑Fi/VPN and API URL.'
    };
  }
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
  // Don't clear saved credentials on logout - keep them for auto-fill functionality
  // await clearRememberMeCredentials();
}

export async function logoutAndClearCredentials(): Promise<void> {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
  // Clear saved credentials when user explicitly wants to remove them
  await clearRememberMeCredentials();
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('authToken');
    console.log('🔑 getAuthToken - Retrieved token:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<any> {
  try {
    // First try to get fresh user data from API (with timeout)
    const token = await getAuthToken();
    if (token) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_BASE_URL}/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const userData = await response.json();
          // Update stored user data with fresh data including photo_url
          await updateStoredUser(userData).catch(err => {
            console.warn('Failed to update stored user:', err);
          });
          return userData;
        }
      } catch (networkError: any) {
        // Network error - silently fall back to stored data
        if (networkError.name !== 'AbortError') {
          console.warn('Network error fetching user, using stored data:', networkError.message);
        }
      }
    }
    
    // Fallback to stored user data if API call fails
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (storageError) {
      console.warn('Error reading stored user:', storageError);
      return null;
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Final fallback - try to get stored data
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
}

export async function updateStoredUser(userData: any): Promise<void> {
  try {
    // Preserve existing photo_url if backend returns it missing/empty (common during partial updates)
    try {
      const existingStr = await AsyncStorage.getItem('user');
      const existing = existingStr ? JSON.parse(existingStr) : null;
      if (existing && existing.photo_url && (!userData?.photo_url || String(userData.photo_url).trim() === '')) {
        userData = { ...userData, photo_url: existing.photo_url };
      }
    } catch {
      // ignore merge issues; still write userData below
    }

    await AsyncStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error updating stored user:', error);
    throw error;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

export async function verifyOTP(
  contactInfo: string,
  otpCode: string,
  otpMethod: 'email' | 'sms' = 'email'
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactInfo,
        otp_code: otpCode,
        otpMethod: 'email',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errJson = JSON.parse(errorText);
        return { success: false, message: errJson.detail || 'OTP verification failed' };
      } catch (_) {
        return { success: false, message: errorText || 'OTP verification failed' };
      }
    }

    const data = await response.json();
    return { success: true, message: data.message || 'Email verified successfully' };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

export async function getUserProfile(): Promise<AuthResult> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Get profile error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
} 

export const predictPainWithELD = async (imageFile: File | any, token: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE_URL}/predict-eld`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        const errorDetail = errorJson.detail || errorText;
        
        // Check for specific error types and format them for the frontend
        if (errorDetail.includes('No Cat Face Detected')) {
          throw new Error(`SPECIFIC_ERROR:NO_CAT_DETECTED:No cat face detected in the image:Please upload a clear photo of a cat's face for pain assessment.`);
        } else if (errorDetail.includes('Cat too far') || errorDetail.includes('too far')) {
          throw new Error(`SPECIFIC_ERROR:CAT_TOO_FAR:Cat face is too far from camera:Please move closer to the cat and ensure the face fills most of the frame.`);
        } else if (errorDetail.includes('Cat too close') || errorDetail.includes('too close')) {
          throw new Error(`SPECIFIC_ERROR:CAT_TOO_CLOSE:Cat face is too close to camera:Please move back slightly to get the full face in view.`);
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${errorDetail}`);
        }
      } catch (parseError) {
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    }

    const result = await response.json();
    
    // Log ELD-specific information
    if (result.model_type && result.model_type.includes('ELD')) {
      console.log('🎯 ELD Model Results:');
      console.log('- Model Type:', result.model_type);
      console.log('- Landmarks Detected:', result.landmarks_detected);
      console.log('- Expected Landmarks:', result.expected_landmarks);
      console.log('- Features Extracted:', result.features_extracted);
      console.log('- Confidence:', result.confidence);
      console.log('- Pain Level:', result.pain_level);
      
      // Log enhanced comprehensive data if available
      if (result.fgs_breakdown) {
        console.log('🔍 FGS Breakdown:', result.fgs_breakdown);
      }
      if (result.detailed_explanation) {
        console.log('📝 Detailed Explanation:', result.detailed_explanation);
      }
      if (result.actionable_advice) {
        console.log('💡 Actionable Advice:', result.actionable_advice);
      }
      if (result.landmark_analysis) {
        console.log('🎯 Landmark Analysis:', result.landmark_analysis);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error predicting pain with ELD:', error);
    throw error;
  }
};

// Enhanced ELD prediction with detailed logging
export const predictPainWithELDEnhanced = async (imageFile: File, token: string): Promise<any> => {
  try {
    console.log('🚀 Starting ELD (Ensemble Landmark Detector) analysis...');
    const result = await predictPainWithELD(imageFile, token);
    
    // Add additional processing if needed
    if (result.model_type && result.model_type.includes('ELD')) {
      console.log('✅ ELD analysis completed successfully');
      console.log('📊 Analysis Summary:');
      console.log(`   • Pain Level: ${result.pain_level}`);
      console.log(`   • Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   • Landmarks: ${result.landmarks_detected}/${result.expected_landmarks}`);
      console.log(`   • Features: ${result.features_extracted}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ ELD analysis failed:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData: any): Promise<AuthResult> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "No authentication token found" };
    }

    const response = await fetch(`${API_BASE_URL}/update-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errJson = JSON.parse(errorText);
        return { success: false, message: errJson.detail || 'Profile update failed' };
      } catch (_) {
        return { success: false, message: errorText || 'Profile update failed' };
      }
    }

    const data = await response.json();
    
    // Update stored user data with the response from the server
    console.log('Profile updated successfully, storing new data:', data);
    await updateStoredUser(data);
    
    return { success: true, message: 'Profile updated successfully', user: data };
  } catch (error) {
    console.error('Update profile error:', error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
};

// Change password (current + new) for logged-in user
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<AuthResult> => {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters' };
  }

  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: 'No authentication token found' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_password: currentPassword || undefined,
        new_password: newPassword,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = (data as any)?.detail || (data as any)?.message;
      return { success: false, message: detail || 'Failed to change password' };
    }

    // Attempt to keep Remember Me credentials in sync when email is known
    try {
      const storedUser = await getCurrentUser();
      if (storedUser?.email) {
        await updateRememberMeCredentials(storedUser.email, newPassword);
      }
    } catch (err) {
      console.warn('Failed to sync remember-me credentials after password change:', err);
    }

    return { success: true, message: (data as any)?.message || 'Password updated successfully' };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.'
    };
  }
};