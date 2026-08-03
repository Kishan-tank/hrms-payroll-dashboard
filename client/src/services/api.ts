import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear storage — let React Router / AuthContext handle the redirect
      // so the SPA doesn't do a hard full-page reload on 401.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  /** Validate the stored token and return the current user from the server. */
  me: () => api.get('/auth/me'),
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); },
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (password: string, resetToken: string) => api.put(`/auth/reset-password/${resetToken}`, { password }),
};

export const userAPI = {
  getUsers: (params?: { search?: string; role?: string; page?: number; limit?: number }) =>
    api.get('/users', { params }),
  createUser: (data: { name: string; email: string; role: string; password?: string; department?: string; designation?: string }) =>
    api.post('/users', data),
  updateRole: (id: string, role: string) =>
    api.patch(`/users/${id}/role`, { role }),
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
};

export default api;
