import { API_CONFIG } from '../config/apiConfig';
import { getToken, removeToken } from '../utils/security';

const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

  // ================= TEMPORARY MOCKS =================
  // Replace these when backend APIs become available.

  forgotPassword: async (_identifier: string) => {
    await delay();

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  },

  verifyOTP: async (_identifier: string, otp: string) => {
    await delay();

    if (otp === '123456') {
      return {
        success: true,
        message: 'OTP verified',
      };
    }

    return {
      success: false,
      message: 'Invalid OTP',
    };
  },

  resetPassword: async (
    _identifier: string,
    _newPassword: string
  ) => {
    await delay();

    return {
      success: true,
      message: 'Password reset successfully',
    };
  },
};

export default authApi;