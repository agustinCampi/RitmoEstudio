
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

// Definir un tipo más detallado para el perfil del usuario, que coincida con la DB
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

// Definir la forma del contexto de autenticación
interface AuthContextType {
  user: UserProfile | null;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Iniciar con la sesión actual, si existe
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
            // Si hay una sesión, siempre intentar obtener el perfil
            await fetchUserProfile(currentSession.user);
        } else {
            // Si no hay sesión, limpiar el usuario
            setUser(null);
        }
        // La carga solo finaliza después de procesar el evento
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
          // Si el error es que no se encuentra la fila, es normal en un flujo de registro
          if (error.code !== 'PGRST116') {
             throw error;
          }
          setUser(null);
      } else {
          setUser(profile as UserProfile);
      }
    } catch (error) {
      console.error("Error al cargar el perfil del usuario:", error);
      setUser(null);
    } finally {
        // Asegurarse de que el estado de carga termine aquí
        setLoading(false);
    }
  };
  
  const value = {
    user,
    session,
    loading,
  };

  // No renderizar nada hasta que se haya determinado el estado de autenticación
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
