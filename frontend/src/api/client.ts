import axios from 'axios';

// In development (Vite dev server), use empty baseURL so Vite proxy handles /api/*
// In production (Vercel), use the Render backend URL directly
const isDev = import.meta.env.DEV;
const baseURL = isDev ? '' : import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for auth-related endpoints, not for data CRUD
    // This prevents data loss when a background API call gets a 401
    const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
    
    if (error.response?.status === 401 && isAuthEndpoint) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
