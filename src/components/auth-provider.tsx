'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as AppUser } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';

// 1. Definir la forma del contexto
interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
}

// 2. Crear el contexto con un valor por defecto
export const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  isLoading: true 
});

// 3. Crear el componente Provider
interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Obtiene la sesión del cliente
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          // Si hay sesión, obtiene el perfil completo
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser(profile ? { ...session.user, ...profile } as AppUser : null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Listener para cambios de autenticación (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if(session) {
            fetchSession(); // Re-obtener sesión y perfil al cambiar
        } else {
            setUser(null); // Limpiar usuario al cerrar sesión
        }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Crear el hook personalizado para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
