import { create } from 'zustand';
import { User, AuthTokens } from '@tebeya/shared';
import { secureStorage } from '../utils/secureStorage';

const TOKEN_KEY = 'tebeya_access_token';
const REFRESH_TOKEN_KEY = 'tebeya_refresh_token';
const USER_KEY = 'tebeya_user_data';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setSession: (user: User, tokens: AuthTokens) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  setSession: async (user: User, tokens: AuthTokens) => {
    await secureStorage.setItem(TOKEN_KEY, tokens.accessToken);
    await secureStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await secureStorage.setItem(USER_KEY, JSON.stringify(user));

    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (partialUser: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updated = { ...currentUser, ...partialUser };
    secureStorage.setItem(USER_KEY, JSON.stringify(updated)).catch(() => {});
    set({ user: updated });
  },

  logout: async () => {
    await secureStorage.removeItem(TOKEN_KEY);
    await secureStorage.removeItem(REFRESH_TOKEN_KEY);
    await secureStorage.removeItem(USER_KEY);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: async () => {
    try {
      const accessToken = await secureStorage.getItem(TOKEN_KEY);
      const refreshToken = await secureStorage.getItem(REFRESH_TOKEN_KEY);
      const userStr = await secureStorage.getItem(USER_KEY);

      if (accessToken && userStr) {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }
    } catch {
      // Failed to restore session
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    });
  },
}));
