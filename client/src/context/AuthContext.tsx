import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { authAPI } from '../services/api';
import { useTheme } from './ThemeContext';

interface AuthContextValue {
  user: User | null;
  login: (credentials: { email: string; password: string }, selectedRole: 'employee' | 'hr-manager') => Promise<void>;
  loginAs: (role: 'employee' | 'hr-manager') => void;
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

  const { setTheme } = useTheme();

  /** Redirect based on role after any successful login */
  const redirectByRole = useCallback(
    (u: User) => {
      if (u.role === 'employee') {
        setTheme('dark');
      }
      if (u.role === 'hr-manager') {
        navigate('/hr-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    },
    [navigate, setTheme],
  );

  /** Real API login */
  const login = useCallback(
    async (credentials: { email: string; password: string }, selectedRole: 'employee' | 'hr-manager') => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authAPI.login(credentials);
        const { token, user: u } = res.data as { token: string; user: User };
        const value = String(u.role || '').toLowerCase().replace(/\s+/g, "-");
        const actualRole = value.includes("hr") ? "hr-manager" : "employee";

        if (actualRole !== selectedRole) {
          throw new Error(
            actualRole === "hr-manager"
              ? "This account is registered as HR Manager. Please select HR Manager to continue."
              : "This account is registered as Employee. Please select Employee to continue."
          );
        }
        
        u.role = actualRole;
        
        // Save for mock consistency
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

  /**
   * Demo / mock login — used by the two login buttons so the app works
   * without a real backend running.
   */
  const loginAs = useCallback(
    (role: 'employee' | 'hr-manager') => {
      const mockUser: User =
        role === 'hr-manager'
          ? {
              id: 'hr-001',
              name: 'Anil Kumar',
              email: 'anil@company.com',
              role: 'hr-manager',
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
