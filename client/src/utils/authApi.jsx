import apiService from "./apiService";
import { API_ENDPOINTS } from "./apiConfig";

export const authApi = {
  login: async (emailOrUsername, password) => {
    const response = await apiService.post(`${API_ENDPOINTS.AUTH}/login`, { emailOrUsername, password });
    handleAuthResponse(response);
    return response.data;
  },

  googleLogin: async (accessToken) => {
    const response = await apiService.post(`${API_ENDPOINTS.AUTH}/google-login`, { token: accessToken });
    handleAuthResponse(response);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiService.post(`${API_ENDPOINTS.AUTH}/register`, userData);
    handleAuthResponse(response);
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    try {
      const response = await apiService.post(`${API_ENDPOINTS.AUTH}/refresh-token`, { refreshToken });
      localStorage.setItem("token", response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  },

  isAuthenticated: () => !!localStorage.getItem("token"),
};

function handleAuthResponse(response) {
  localStorage.setItem("token", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  
  // Ensure consistent user data structure
  const userData = {
    user_id: response.data.user.user_id,
    username: response.data.user.username,
    email: response.data.user.email,
    full_name: response.data.user.full_name || '',
    avatar_url: response.data.user.avatar_url || null,
  };
  
  localStorage.setItem("user", JSON.stringify(userData));
}

export default authApi;