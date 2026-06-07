import { create } from 'zustand';

export interface User {
  id?: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

// Helper: decode JWT and check if it's expired (client-side check)
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    // exp is in seconds, Date.now() is ms
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; // If decode fails, treat as expired
  }
}

// Load initial state from localStorage — validate token isn't expired
const storedToken = localStorage.getItem('jwt_token');
const storedUser = localStorage.getItem('user_data');

// Clear expired sessions immediately on app start
const isTokenValid = storedToken ? !isJwtExpired(storedToken) : false;
if (!isTokenValid && storedToken) {
  // Token is expired — clear all auth state so user sees login page
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
}

export const useAuthStore = create<AuthState>((set) => ({
  user: isTokenValid && storedUser ? JSON.parse(storedUser) : null,
  token: isTokenValid ? storedToken : null,
  isAuthenticated: isTokenValid,

  login: (user, token, refreshToken) => {
    localStorage.setItem('jwt_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    localStorage.setItem('user_data', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

