import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@tebeya/shared';
import { authApi, type LoginPayload } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  requestOtp: (email: string) => Promise<string>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('tb_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('tb_access_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // If token exists, verify or refresh current user
    if (token) {
      authApi
        .getCurrentUser()
        .then((fetchedUser) => {
          if (fetchedUser.role !== 'admin') {
            logout();
          } else {
            setUser(fetchedUser);
            localStorage.setItem('tb_user', JSON.stringify(fetchedUser));
          }
        })
        .catch(() => {
          // If offline or request fails, keep stored session if admin
          if (user && user.role !== 'admin') {
            logout();
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    if (res.user.role !== 'admin') {
      throw new Error('Access denied. Administrator privileges required.');
    }
    setUser(res.user);
    setToken(res.tokens.accessToken);
    localStorage.setItem('tb_access_token', res.tokens.accessToken);
    localStorage.setItem('tb_refresh_token', res.tokens.refreshToken);
    localStorage.setItem('tb_user', JSON.stringify(res.user));
  };

  const requestOtp = async (email: string): Promise<string> => {
    const res = await authApi.sendAdminOtp(email);
    return res.message;
  };

  const verifyOtp = async (email: string, otp: string): Promise<void> => {
    const res = await authApi.verifyAdminOtp(email, otp);
    if (res.user.role !== 'admin') {
      throw new Error('Access denied. Administrator privileges required.');
    }
    setUser(res.user);
    setToken(res.tokens.accessToken);
    localStorage.setItem('tb_access_token', res.tokens.accessToken);
    localStorage.setItem('tb_refresh_token', res.tokens.refreshToken);
    localStorage.setItem('tb_user', JSON.stringify(res.user));
  };

  const demoLogin = async () => {
    try {
      const res = await authApi.demoLogin();
      setUser(res.user);
      setToken(res.tokens.accessToken);
      localStorage.setItem('tb_access_token', res.tokens.accessToken);
      localStorage.setItem('tb_refresh_token', res.tokens.refreshToken);
      localStorage.setItem('tb_user', JSON.stringify(res.user));
    } catch (err) {
      console.warn('Backend demo-login failed, falling back to local demo admin:', err);
      const mockAdmin: User = {
        id: 'usr_admin_master',
        name: 'Operations Dispatcher',
        email: 'admin@tebeya.services',
        phone: '+91 98470 00001',
        phoneVerified: true,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(mockAdmin);
      setToken('mock_demo_token');
      localStorage.setItem('tb_access_token', 'mock_demo_token');
      localStorage.setItem('tb_user', JSON.stringify(mockAdmin));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tb_access_token');
    localStorage.removeItem('tb_refresh_token');
    localStorage.removeItem('tb_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && user.role === 'admin',
        isLoading,
        login,
        requestOtp,
        verifyOtp,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
