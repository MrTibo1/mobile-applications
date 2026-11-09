import { create } from 'zustand';
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
} from '../services/authService';
import type { User } from '../types/User';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  initialize: async () => {
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: user !== null, isLoading: false, authError: null });
    } catch (error) {
      set({ isLoading: false, authError: error instanceof Error ? error.message : 'Unable to restore session.' });
    }
  },
  setUser: (user) => set({ user, isAuthenticated: user !== null, isLoading: false, authError: null }),
  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    try {
      const user = await loginService(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    await logoutService();
    set({ user: null, isAuthenticated: false, authError: null });
  },
}));
