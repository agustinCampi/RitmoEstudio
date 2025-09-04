
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/types/supabase';

export interface AuthContextType {
  user: User | null;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser(profile as User ?? null);
      }
      setLoading(false);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(profile as User ?? null);
      } else {
        setUser(null);
      }
       setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

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

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const value = { user, logout, loading };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
