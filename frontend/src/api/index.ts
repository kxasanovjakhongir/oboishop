import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('admin_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const IMG = BASE.replace('/api', '');

export const getWallpapers = (params?: Record<string, string>) => api.get('/wallpapers', { params });
export const getWallpaper = (id: string) => api.get(`/wallpapers/${id}`);
export const getFeatured = () => api.get('/wallpapers/featured');
export const getDiscounted = () => api.get('/wallpapers/discounted');
export const getCategories = () => api.get('/categories');
export const createContact = (data: object) => api.post('/contacts', data);

export default api;
