import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { authAPI } from '../services/api';
import { useTheme } from './ThemeContext';

interface AuthContextValue {
  user: User | null;
  login: (credentials: { email: string; password: string }, selectedRole?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch (err) {
      console.error('Failed to parse stored user from localStorage', err);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { setTheme } = useTheme();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await authAPI.me();
        const { user: u } = res.data as { user: User };
        setUser(u);
      } catch (err) {
        console.error('Token validation failed', err);
        setUser(null);
        navigate('/login');
      }
    };
    initAuth();
  }, [navigate]);

  /** Redirect based on role after any successful login */
  const redirectByRole = useCallback(
    (u: User) => {
      const role = String(u.role).toLowerCase();
      if (role === 'admin') {
        navigate('/admin/users');
      } else if (['hr-manager', 'hr manager', 'hr'].includes(role)) {
        navigate('/hr-dashboard');
      } else {
        setTheme('dark');
        navigate('/employee-dashboard');
      }
    },
    [navigate, setTheme],
  );

  /** Real API login */
  const login = useCallback(
    async (credentials: { email: string; password: string }, selectedRole?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authAPI.login(credentials);
        const { token, user: u } = res.data as { token: string; user: User };

        const actualRole = String(u.role).toLowerCase();

        if (actualRole !== 'admin' && selectedRole && selectedRole !== actualRole) {
          const expected = actualRole === 'hr-manager' ? 'HR Manager' : 'Employee';
          throw new Error(`This account is registered as ${expected}. Please select ${expected} to continue.`);
        }

        localStorage.setItem("hrms_registered_user", JSON.stringify({ email: u.email, name: u.name, role: u.role }));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(u));
        setUser(u);
        redirectByRole(u);
      } catch (err: any) {
        console.error('Login error:', err);
        let msg = 'Login failed';
        if (err instanceof Error) {
          msg = err.message;
        } else if (err?.response?.data?.message) {
          msg = err.response.data.message;
        } else if (err?.message) {
          msg = err.message;
        }
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [redirectByRole],
  );

  const logout = useCallback(() => {
    authAPI.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, error, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
