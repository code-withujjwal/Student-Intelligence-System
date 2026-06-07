import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  achievements: string[];
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  institution?: string;
  profile?: { xp: number; level: number; targetExam?: string; subjects: string[] };
  streak?: { current: number; longest: number };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; name: string; password: string; role?: string }) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message ?? 'Login failed');
          const { user, accessToken, refreshToken } = json.data;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.message ?? 'Registration failed');
          const { user, accessToken, refreshToken } = json.data;
          set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;
        try {
          const res = await fetch(`${API}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          const json = await res.json();
          if (res.ok) {
            set({ accessToken: json.data.accessToken, refreshToken: json.data.refreshToken });
          }
        } catch {
          get().logout();
        }
      },

      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'nexusiq-auth',
      partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
