import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextValue {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginAs: (role: 'employee' | 'hr') => void;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /** Redirect based on role after any successful login */
  const redirectByRole = useCallback(
    (u: User) => {
      if (u.role === 'hr' || u.role === 'admin' || u.role === 'manager') {
        navigate('/hr-dashboard');
      } else {
        navigate('/dashboard');
      }
    },
    [navigate],
  );

  /** Real API login */
  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authAPI.login(credentials);
        const { token, user: u } = res.data as { token: string; user: User };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(u));
        setUser(u);
        redirectByRole(u);
      } catch (err: unknown) {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? 'Login failed',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [redirectByRole],
  );

  /**
   * Demo / mock login — used by the two login buttons so the app works
   * without a real backend running.
   */
  const loginAs = useCallback(
    (role: 'employee' | 'hr') => {
      const mockUser: User =
        role === 'hr'
          ? {
              id: 'hr-001',
              name: 'Anil Kumar',
              email: 'anil@company.com',
              role: 'hr',
              designation: 'HR Manager',
            }
          : {
              id: 'emp-001',
              name: 'Krishna Reddy',
              email: 'krishna@company.com',
              role: 'employee',
              designation: 'Software Engineer',
            };

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', `mock-token-${role}`);
      setUser(mockUser);
      redirectByRole(mockUser);
    },
    [redirectByRole],
  );

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, login, loginAs, logout, isLoading, error, clearError }}
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
