import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', // Default to localhost:8000
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken'); // Or IndexedDB
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
