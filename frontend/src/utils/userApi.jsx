import apiService from "./apiService";
import { API_ENDPOINTS } from "./apiConfig";

export const userApi = {
  getCurrentUserProfile: async () => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.USERS}/me/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  getCurrentUserPosts: async () => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.USERS}/me/posts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  getUserProfile: (username) => apiService.get(`${API_ENDPOINTS.USERS}/${username}`),
  getUserPosts: (username) => apiService.get(`${API_ENDPOINTS.USERS}/${username}/posts`),
  getUserStats: async (username) => {
    try {
      const response = await apiService.get(`${API_ENDPOINTS.USERS}/${username}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
  getFollowStatus: (username) => apiService.get(`${API_ENDPOINTS.USERS}/${username}/follow-status`),
  toggleFollow: (username) => apiService.post(`${API_ENDPOINTS.USERS}/${username}/follow`),
  updateUserProfile: async (formData) => {
    try {
      const response = await apiService.put(`${API_ENDPOINTS.USERS}/me/settings`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      if (error.response) {
        throw new Error(`Server responded with error: ${error.response.status} ${error.response.data.message}`);
      } else if (error.request) {
        throw new Error("No response received from server. Please check your network connection.");
      } else {
        throw new Error(`Error setting up the request: ${error.message}`);
      }
    }
  },
  getFullAvatarUrl: (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith("http")) return avatarUrl;
    return `${API_ENDPOINTS.BASE_URL}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`;
  },
};

export default userApi;