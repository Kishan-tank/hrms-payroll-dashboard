import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, RegisterRequest } from '../types';
import { authAPI } from '../services/api';
import { useTheme } from './ThemeContext';

interface AuthContextValue {
  user: User | null;
  login: (credentials: { email: string; password: string }, selectedRole: 'employee' | 'hr-manager') => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
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
        const normalized = u.role?.toLowerCase() || '';
        u.role = (normalized === 'hr-manager' || normalized.includes('hr') || normalized === 'admin') ? 'hr-manager' : 'employee';
        setUser(u);
      } catch (err) {
        console.error('Token validation failed', err);
        // localStorage is cleared by the interceptor
        setUser(null);
        navigate('/login');
      }
    };
    initAuth();
  }, [navigate]);

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
        const normalized = u.role?.toLowerCase() || '';
        const actualRole = (normalized === 'hr-manager' || normalized.includes('hr') || normalized === 'admin') ? 'hr-manager' : 'employee';

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

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true); setError(null);
    try {
      const res = await authAPI.register(data);
      const { token, user: u } = res.data as { token: string; user: User };
      
      const actualRole = (u.role === 'hr-manager' || u.role === 'admin' || u.role?.toLowerCase() === 'hr') ? 'hr-manager' : 'employee';
      u.role = actualRole;

      localStorage.setItem("hrms_registered_user", JSON.stringify({ email: u.email, name: u.name, role: u.role }));
      localStorage.setItem('token', token); 
      localStorage.setItem('user', JSON.stringify(u));
      
      setUser(u); 
      // Navigation is now handled by the RegisterPage after the success animation
    } catch (err: unknown) {
      const message = ((err as { response?: { data?: { message?: string } } })?.response?.data?.message) || 'Registration failed';
      setError(message);
      throw err;
    } finally { 
      setIsLoading(false); 
    }
  }, [navigate]);

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
      value={{ user, login, register, logout, isLoading, error, clearError }}
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
