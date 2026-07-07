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
  register: (data: { fullName: string; email: string; password: string; role?: string }) => api.post('/auth/register', {
    name: data.fullName,
    email: data.email,
    password: data.password,
    // Map display label → DB enum value ('hr-manager' matches the User model enum)
    role: data.role === 'HR Manager' ? 'hr-manager' : 'employee',
  }),
  /** Validate the stored token and return the current user from the server. */
  me: () => api.get('/auth/me'),
  logout: () => { localStorage.removeItem('token'); localStorage.removeItem('user'); },
};

export default api;
