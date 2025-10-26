import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
}

// Forgot Password Service
export const forgotPasswordService = {
  // Request password reset
  async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      console.log('🔄 Requesting password reset for:', email);
      
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: email.trim().toLowerCase()
      }, {
        timeout: 10000
      });

      console.log('✅ Password reset request sent successfully');
      return {
        success: true,
        message: response.data.message || "Password reset email sent successfully. Please check your inbox and spam folder."
      };
    } catch (error: any) {
      console.error('❌ Password reset request error:', error);
      
      if (error.response?.data?.detail) {
        return {
          success: false,
          message: error.response.data.detail
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Connection timed out. Please check your internet connection and try again.'
        };
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      // Validate password strength
      if (!newPassword || newPassword.length < 8) {
        return {
          success: false,
          message: "Password must be at least 8 characters long"
        };
      }

      console.log('🔄 Resetting password with token...');
      
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        new_password: newPassword
      }, {
        timeout: 10000
      });

      console.log('✅ Password reset successfully');
      return {
        success: true,
        message: response.data.message || "Password reset successfully. You can now log in with your new password."
      };
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      
      if (error.response?.data?.detail) {
        return {
          success: false,
          message: error.response.data.detail
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Connection timed out. Please check your internet connection and try again.'
        };
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  },

  // Validate reset token
  async validateResetToken(token: string): Promise<AuthResult> {
    try {
      console.log('🔍 Validating password reset token...');
      
      // Note: This endpoint might not exist in the backend yet
      // We'll implement a simple validation by trying to reset with a dummy password
      // and checking if we get a "token expired" vs "invalid token" error
      const response = await axios.post(`${API_BASE_URL}/auth/validate-reset-token`, {
        token
      }, {
        timeout: 8000
      });

      console.log('✅ Password reset token is valid');
      return {
        success: true,
        message: response.data.message || "Token is valid"
      };
    } catch (error: any) {
      console.error('❌ Token validation error:', error);
      
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data.detail || "Invalid or expired reset token"
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Connection timed out. Please check your internet connection and try again.'
        };
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    }
  }
};

// Remember Me Service
export const rememberMeService = {
  // Save credentials
  saveCredentials(email: string, password: string): void {
    try {
      const credentials = {
        email: email.toLowerCase().trim(),
        password: password,
        timestamp: Date.now()
      };
      localStorage.setItem('rememberMe', JSON.stringify(credentials));
      console.log('✅ Remember Me credentials saved successfully');
    } catch (error) {
      console.error('❌ Error saving remember me credentials:', error);
    }
  },

  // Get credentials
  getCredentials(): { email: string; password: string; timestamp?: number } | null {
    try {
      const credentials = localStorage.getItem('rememberMe');
      if (!credentials) return null;
      
      const parsedCredentials = JSON.parse(credentials);
      
      // Check if credentials are older than 30 days (optional security measure)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (parsedCredentials.timestamp && parsedCredentials.timestamp < thirtyDaysAgo) {
        console.log('🕒 Remember Me credentials expired, clearing...');
        this.clearCredentials();
        return null;
      }
      
      console.log('✅ Remember Me credentials retrieved successfully');
      return parsedCredentials;
    } catch (error) {
      console.error('❌ Error getting remember me credentials:', error);
      return null;
    }
  },

  // Clear credentials
  clearCredentials(): void {
    try {
      localStorage.removeItem('rememberMe');
      console.log('✅ Remember Me credentials cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing remember me credentials:', error);
    }
  },

  // Check if credentials exist
  hasCredentials(): boolean {
    return this.getCredentials() !== null;
  },

  // Clear all authentication data
  clearAllAuthData(): void {
    try {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('access_token');
      console.log('✅ All authentication data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing all auth data:', error);
    }
  }
};
