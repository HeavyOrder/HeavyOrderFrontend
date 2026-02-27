'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, userApi } from '@/lib/api';
import { MemberResponse, LoginRequest, RoleType } from '@/types';

interface AuthContextType {
  user: MemberResponse | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  role: RoleType | null;
  isRepairShop: boolean;
  isSupplier: boolean;
  isDriver: boolean;
  login: (email: string, password: string) => Promise<MemberResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MemberResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await userApi.getMe();
      setUser(response.data.data);
    } catch {
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<MemberResponse> => {
    const loginData: LoginRequest = { email, password };
    await authApi.login(loginData);
    const response = await userApi.getMe();
    const userData = response.data.data;
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    checkAuth();
  }, [refreshUser]);

  const role = user?.roleType ?? null;

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    role,
    isRepairShop: role === 'REPAIR_SHOP',
    isSupplier: role === 'SUPPLIER',
    isDriver: role === 'DRIVER',
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
