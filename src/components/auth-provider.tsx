"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';

export interface AuthContextType {
  user: User | null;
  login: (role: UserRole, email?: string) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking for a logged-in user in session storage
    try {
      const storedUser = sessionStorage.getItem('ritmo-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from sessionStorage", error);
      sessionStorage.removeItem('ritmo-user');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/' || pathname === '/signup';
      if (!user && !isAuthPage) {
        router.push('/');
      }
      if (user && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const login = (role: UserRole, email?: string) => {
    const userToLogin = MOCK_USERS.find(u => u.role === role && (email ? u.email === email : true)) || MOCK_USERS.find(u => u.role === role)!;
    setUser(userToLogin);
    sessionStorage.setItem('ritmo-user', JSON.stringify(userToLogin));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ritmo-user');
    router.push('/');
  };

  const value = { user, login, logout, loading };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
