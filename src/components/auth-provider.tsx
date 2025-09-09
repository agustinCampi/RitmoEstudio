
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Definir un tipo más detallado para el perfil del usuario
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Suscribiéndose a cambios de estado de autenticación.");

    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("AuthProvider: Sesión inicial obtenida:", data.session);
      if (error) {
        console.error("AuthProvider: Error al obtener la sesión inicial:", error);
        setLoading(false);
        return;
      }

      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user);
      } else {
        console.log("AuthProvider: No hay sesión, estableciendo user a null.");
        setUser(null);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("AuthProvider: Evento de authStateChange detectado:", event);
      setSession(currentSession);

      if (event === 'SIGNED_IN' && currentSession?.user) {
        await fetchUserProfile(currentSession.user);
      } else if (event === 'SIGNED_OUT') {
        console.log("AuthProvider: Cierre de sesión, estableciendo user a null.");
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const fetchUserProfile = async (user: User) => {
    console.log("AuthProvider: fetchUserProfile iniciado.");
    if (!user) {
        console.log("AuthProvider: fetchUserProfile abortado, no hay usuario.");
        return;
    }
    console.log(`AuthProvider: Sesión activa, intentando obtener perfil para user ID: ${user.id}`);
    setLoading(true);
    try {
        const { data: profile, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', user.id)
            .single();

        console.log("Respuesta de Supabase - error:", error);
        if (error && error.code !== 'PGRST116') { // PGRST116: "exact-cardinality-violation", no rows found
            throw error;
        }

        if (profile) {
            console.log("AuthProvider: Perfil de usuario cargado exitosamente.");
            setUser(profile as UserProfile);
        } else {
            console.log("AuthProvider: No se encontró perfil para el usuario.");
            setUser(null);
        }
    } catch (error) {
        console.error("AuthProvider: Error al cargar el perfil del usuario:", error);
        setUser(null);
    } finally {
        console.log("AuthProvider: fetchUserProfile finalizado.");
        setLoading(false);
    }
  };

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
