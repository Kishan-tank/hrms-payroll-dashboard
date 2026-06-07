import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import type { LoginRequest, RegisterRequest, User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true); setError(null);
    try {
      const res = await authAPI.login(credentials);
      const { token, user: u } = res.data as { token: string; user: User };
      localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(u));
      setUser(u); navigate('/dashboard');
    } catch (err: unknown) {
      setError(((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || 'Login failed');
    } finally { setIsLoading(false); }
  }, [navigate]);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true); setError(null);
    try {
      const res = await authAPI.register(data);
      const { token, user: u } = res.data as { token: string; user: User };
      localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(u));
      setUser(u); navigate('/dashboard');
    } catch (err: unknown) {
      setError(((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || 'Registration failed');
    } finally { setIsLoading(false); }
  }, [navigate]);

  const logout = useCallback(() => { authAPI.logout(); setUser(null); navigate('/login'); }, [navigate]);
  const clearError = useCallback(() => setError(null), []);

  return { user, isLoading, error, login, register, logout, clearError };
}
