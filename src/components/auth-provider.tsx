
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
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserProfile = async (session: Session | null) => {
      console.log("AuthProvider: fetchUserProfile iniciado.");
      if (!session) {
        console.log("AuthProvider: No hay sesión, estableciendo user a null.");
        setUser(null);
        setLoading(false);
        return;
      }

      console.log("AuthProvider: Sesión activa, intentando obtener perfil para user ID:", session.user.id);
      // *** CAMBIO CLAVE: Corregimos la consulta optimizada ***
      // Eliminamos 'avatar_url' porque no existe en la tabla.
      const { data: profile, error } = await supabase
        .from('users')
        .select('id, name, email, role') // Consulta corregida
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile) {
        console.error("AuthProvider: Error al obtener el perfil o perfil no encontrado:", error?.message);
        await supabase.auth.signOut();
        setUser(null);
        router.push('/?error=profile_not_found'); 
        setLoading(false);
        return;
      } else {
        console.log("AuthProvider: Perfil de usuario cargado exitosamente.");
        setUser(profile as User);
      }
      setLoading(false);
      console.log("AuthProvider: fetchUserProfile finalizado.");
    };
    
    console.log("AuthProvider: Suscribiéndose a cambios de estado de autenticación.");
    supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("AuthProvider: Sesión inicial obtenida:", session);
        fetchUserProfile(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthProvider: Evento de authStateChange detectado:", event);
      if (event === 'SIGNED_IN') {
        fetchUserProfile(session);
      } else if (event === 'SIGNED_OUT') {
        console.log("AuthProvider: Usuario desautenticado, redirigiendo a /.");
        setUser(null);
        router.push('/');
      } else if (event === 'USER_UPDATED' && session) {
        fetchUserProfile(session);
      }
    });

    return () => {
      console.log("AuthProvider: Desuscribiendo del listener de authStateChange.");
      authListener.subscription.unsubscribe();
    };
  }, [router]);


  const logout = async () => {
    console.log("AuthProvider: Iniciando logout.");
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    setLoading(false);
    console.log("AuthProvider: Logout finalizado.");
  };

  const value = { user, logout, loading };

  const isAuthPage = pathname === '/';

  if (loading && !isAuthPage) {
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
