
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User as AppUser, UserRole } from '@/lib/types';

// Definir la forma del contexto de autenticación
interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  session: Session | null;
}

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType>({ user: null, loading: true, session: null });

// Definir las props para el AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Crear el componente proveedor de autenticación
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async (authUser: SupabaseUser) => {
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

        if (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
        } else {
            setUser(profile as AppUser);
        }
        setLoading(false);
    };
    
    // Iniciar con la sesión actual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  
  const value = {
    user,
    session,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Exportar el hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
