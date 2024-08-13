import apiService from './apiService';
import { API_ENDPOINTS } from './apiConfig';

export const postApi = {
  getPosts: () => apiService.get(API_ENDPOINTS.POSTS),
  getTrendingPosts: () => apiService.get(`${API_ENDPOINTS.POSTS}/trending`),
  createPost: (postData) => apiService.post(API_ENDPOINTS.POSTS, postData),
  deletePost: (postId) => apiService.delete(`${API_ENDPOINTS.POSTS}/${postId}`),
  searchPosts: (query) => apiService.get(`${API_ENDPOINTS.POSTS}/search`, { params: { q: query } }),
  
  likePost: (postId) => apiService.post(`${API_ENDPOINTS.POSTS}/${postId}/like`),
  repostPost: (postId) => apiService.post(`${API_ENDPOINTS.POSTS}/${postId}/repost`),
  checkLikeStatus: (postId) => apiService.get(`${API_ENDPOINTS.POSTS}/${postId}/like/status`),
  checkRepostStatus: (postId) => apiService.get(`${API_ENDPOINTS.POSTS}/${postId}/repost/status`),
};