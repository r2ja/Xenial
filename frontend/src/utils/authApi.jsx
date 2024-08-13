import apiService from "./apiService";
import { API_ENDPOINTS } from "./apiConfig";

export const authApi = {
  login: async (emailOrUsername, password) => {
    try {
      const response = await apiService.post(`${API_ENDPOINTS.AUTH}/login`, { emailOrUsername, password });
      handleAuthResponse(response);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error.response ? error.response.data : { error: 'Network Error' };
    }
  },

  googleLogin: async (accessToken) => {
    try {
      const response = await apiService.post(`${API_ENDPOINTS.AUTH}/google-login`, { token: accessToken });
      handleAuthResponse(response);
      return response.data;
    } catch (error) {
      console.error("Google login error:", error);
      throw error.response ? error.response.data : { error: 'Network Error' };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiService.post(`${API_ENDPOINTS.AUTH}/register`, userData);
      handleAuthResponse(response);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error.response ? error.response.data : { error: 'Network Error' };
    }
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