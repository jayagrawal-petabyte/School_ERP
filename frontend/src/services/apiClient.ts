import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
