// apiService.js
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from './apiConfig';

const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiService.interceptors.request.use(
  (config) => {
    // You can add authentication headers here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here (e.g., unauthorized, server errors)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized error
          break;
        case 404:
          // Handle not found error
          break;
        case 500:
          // Handle server error
          break;
        default:
          // Handle other errors
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default apiService;