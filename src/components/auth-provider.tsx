
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async (session: Session | null) => {
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile) {
        console.error("Error fetching user profile or profile not found:", error?.message);
        // If profile is missing, might be a partial signup, log them out client-side
        await supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(profile as User);
      }
      setLoading(false);
    };
    
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        fetchUserProfile(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        fetchUserProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/');
      } else if (event === 'USER_UPDATED' && session) {
        fetchUserProfile(session);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);


  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    setLoading(false);
  };

  const value = { user, logout, loading };

  // Don't show loading spinner for auth pages to prevent flashing
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
