import { API_CONFIG } from '../config/apiConfig';
import { getToken, removeToken } from '../utils/security';



const authApi = {
  // ================= LOGIN =================
  login: async (
    identifier: string,
    password: string,
    _role: string
  ) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: identifier,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result.message || 'Login failed',
        };
      }

      return {
        success: result.success,
        ...result.data,
      };
    } catch (error) {
      console.error('Login Error:', error);

      return {
        success: false,
        message: 'Unable to connect to server',
      };
    }
  },

  // ================= CURRENT USER =================
  getCurrentUser: async () => {
    try {
      const token = await getToken('auth_token');

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/auth/me`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result.message || 'Unable to fetch current user',
        };
      }

      return result;
    } catch (error) {
      console.error('Get Current User Error:', error);

      return {
        success: false,
        message: 'Unable to fetch current user',
      };
    }
  },

  // ================= LOGOUT =================
  logout: async () => {
    try {
      const token = await getToken('auth_token');

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/auth/logout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        await removeToken('auth_token');
        await removeToken('refresh_token');
      }

      return result;
    } catch (error) {
      console.error('Logout Error:', error);

      return {
        success: false,
        message: 'Logout failed',
      };
    }
  },

  // ================= PASSWORD RESET =================
  forgotPassword: async (identifier: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Forgot Password Error:', error);
      return { success: false, message: 'Unable to connect to server' };
    }
  },

  verifyOTP: async (identifier: string, otp: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, otp }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Verify OTP Error:', error);
      return { success: false, message: 'Unable to connect to server' };
    }
  },

  resetPassword: async (identifier: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, newPassword }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Reset Password Error:', error);
      return { success: false, message: 'Unable to connect to server' };
    }
  },
};

export default authApi;