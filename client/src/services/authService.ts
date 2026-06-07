import type { AuthResponse, LoginForm, RegisterForm } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

async function request<TResponse, TPayload>(
  endpoint: string,
  payload?: TPayload,
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    body: payload ? JSON.stringify(payload) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
    method: payload ? 'POST' : 'GET',
  });

  if (!response.ok) {
    throw new Error('Request failed');
  }

  return response.json() as Promise<TResponse>;
}

export const authService = {
  login(credentials: LoginForm) {
    return request<AuthResponse, LoginForm>('/auth/login', credentials);
  },

  register(data: RegisterForm) {
    const payload = {
      email: data.email,
      name: data.name,
      password: data.password,
    };

    return request<AuthResponse, typeof payload>('/auth/register', payload);
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
