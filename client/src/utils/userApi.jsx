import apiService from "./apiService";
import { API_ENDPOINTS, API_BASE_URL } from "./apiConfig";

export const userApi = {
  getCurrentUserProfile: () => apiService.get(`${API_ENDPOINTS.USERS}/profile`),
  getCurrentUserPosts: () => apiService.get(`${API_ENDPOINTS.USERS}/posts`),
  getUserProfile: (userId) => apiService.get(`${API_ENDPOINTS.USERS}/${userId}`),
  updateUserProfile: async (formData) => {
    try {
      const response = await apiService.put(`${API_ENDPOINTS.USERS}/profile`, formData, {
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
    return `${API_BASE_URL}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`;
  },
};

export default userApi;