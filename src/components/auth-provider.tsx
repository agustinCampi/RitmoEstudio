
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, UserRole } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';


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
  const supabase = createClient();

  useEffect(() => {
    const processSession = async (session: Session | null) => {
      if (session) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile as User);
        } else {
          // Fallback if profile doesn't exist for some reason
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name || 'Usuario',
            role: session.user.user_metadata.role || 'student',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      processSession(session);
    });

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      processSession(session);
    };

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

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

  // login is handled by Supabase UI now, this is for compatibility
  const login = (role: UserRole, email?: string) => {
     console.warn("Manual login function is deprecated. Please use Supabase authentication forms.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
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
