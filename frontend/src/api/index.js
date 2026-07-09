import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getWallpapers = (params) => api.get('/wallpapers', { params });
export const getWallpaper = (id) => api.get(`/wallpapers/${id}`);
export const getFeatured = () => api.get('/wallpapers/featured');
export const getDiscounted = () => api.get('/wallpapers/discounted');

export const getCategories = () => api.get('/categories');
export const getCategory = (id) => api.get(`/categories/${id}`);

export const createContact = (data) => api.post('/contacts', data);

export const getStats = () => api.get('/stats');
export const getSettings = () => api.get('/settings');
export const getFeatures = () => api.get('/features');
export const getContacts = () => api.get('/contacts');
export const markContactRead = (id) => api.put(`/contacts/${id}/read`);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);

export const login = (data) => api.post('/auth/login', data);

export const createWallpaper = (data) => api.post('/wallpapers', data);
export const updateWallpaper = (id, data) => api.put(`/wallpapers/${id}`, data);
export const deleteWallpaper = (id) => api.delete(`/wallpapers/${id}`);

export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getReviews = (params) => api.get('/reviews', { params });
export const createReview = (data) => api.post('/reviews', data);

export const getSiteRatingsSummary = () => api.get('/site-ratings/summary');
export const getFeaturedSiteRatings = () => api.get('/site-ratings/featured');
export const createSiteRating = (data) => api.post('/site-ratings', data);

export const createOrder = (data) => api.post('/orders', data);

export default api;
