// userApi.js
import apiService from './apiService';
import { API_ENDPOINTS } from './apiConfig';

export const userApi = {
  getUserProfile: (userId) => apiService.get(`${API_ENDPOINTS.USERS}/${userId}`),
  updateUserProfile: (userId, userData) => apiService.put(`${API_ENDPOINTS.USERS}/${userId}`, userData),
  // Add more user-related API calls as needed
};