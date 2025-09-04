
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

export interface AuthContextType {
  user: User | null;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function AuthProviderContent({ children }: { children: ReactNode }) {
  const session = useSession();
  const supabaseClient = useSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user) {
        const { data: profile, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error || !profile) {
            console.error("Error fetching user profile or profile not found:", error?.message || "No profile found for this user.");
            // Si el perfil no se encuentra, cerramos la sesión para evitar un estado inconsistente.
            await supabaseClient.auth.signOut();
            setUser(null);
        } else {
          setUser(profile as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [session, supabaseClient]);

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
    await supabaseClient.auth.signOut();
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() => supabase);
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionContextProvider>
  )
}
