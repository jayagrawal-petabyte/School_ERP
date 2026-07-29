import apiClient from './client';
import { API_ROUTES } from './routes';

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    user: {
      id: string;
      email: string;
      role: string;
      [key: string]: any;
    };
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

/**
 * Login user and store access token
 * POST /api/auth/login
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post(API_ROUTES.auth.login, credentials);
    const apiData = response.data?.data;
    const normalizedRole = credentials.role || apiData?.user?.role || apiData?.user?.user_metadata?.role || 'admin';
    
    // Store access token in localStorage
    const accessToken = apiData?.access_token || apiData?.accessToken || apiData?.token;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    
    // Store user data
    if (apiData?.user) {
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...apiData.user,
          role: normalizedRole,
        })
      );
    }
    
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

/**
 * Logout user and clear access token
 * POST /api/auth/logout
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post(API_ROUTES.auth.logout);
  } catch (error) {
    console.error('Error during logout:', error);
    // Continue with local cleanup even if API call fails
  } finally {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Get current authenticated user details
 * GET /api/auth/me
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get(API_ROUTES.auth.me);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * Get stored access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Get stored user data from localStorage
 */
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }
  return null;
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
