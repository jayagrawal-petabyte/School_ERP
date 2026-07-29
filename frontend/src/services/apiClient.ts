import axios from 'axios';

// In development (Vite dev server), use empty baseURL so Vite proxy handles /api/*
// In production (Vercel), use the Render backend URL directly
const isDev = import.meta.env.DEV;
const baseURL = isDev ? '' : import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // Check for JWT token in localStorage (if backend implements JWT)
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

// Response interceptor - handle errors and auth failures
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized responses
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Redirect to login
      window.location.href = '/login';
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;
