import axios from 'axios';

// Create Axios client with backend Base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('incubein_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (like 401 Unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is 401 (Session Expired/Invalid token)
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request detected, clearing session.');
      localStorage.removeItem('incubein_token');
      // If we are not already on login page, redirect to login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
