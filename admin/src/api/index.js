import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (data) => api.post('/auth/login', data);
export const getStats = () => api.get('/stats');

export const getWallpapers = (params) => api.get('/wallpapers', { params });
export const createWallpaper = (data) => api.post('/wallpapers', data);
export const updateWallpaper = (id, data) => api.put(`/wallpapers/${id}`, data);
export const updateWallpaperStock = (id, stock) => api.put(`/wallpapers/${id}/stock`, { stock });
export const deleteWallpaper = (id) => api.delete(`/wallpapers/${id}`);

export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getContacts = () => api.get('/contacts');
export const markRead = (id) => api.put(`/contacts/${id}/read`);
export const deleteContact = (id) => api.delete(`/contacts/${id}`);

export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

export const getFeatures = () => api.get('/features');
export const createFeature = (data) => api.post('/features', data);
export const updateFeature = (id, data) => api.put(`/features/${id}`, data);
export const deleteFeature = (id) => api.delete(`/features/${id}`);

export const getHistory = () => api.get('/history');
export const createHistory = (data) => api.post('/history', data);
export const updateHistory = (id, data) => api.put(`/history/${id}`, data);
export const deleteHistory = (id) => api.delete(`/history/${id}`);

export const getReviews = () => api.get('/reviews/all');
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

export const getSiteRatings = () => api.get('/site-ratings');
export const getSiteRatingsSummary = () => api.get('/site-ratings/summary');
export const setSiteRatingFeatured = (id, featured) => api.patch(`/site-ratings/${id}/feature`, { featured });
export const deleteSiteRating = (id) => api.delete(`/site-ratings/${id}`);

export const getOrders = (params) => api.get('/orders', { params });
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

export default api;
