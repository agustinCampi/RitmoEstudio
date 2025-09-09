'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as AppUser, UserRole } from '@/lib/types';
import { AuthContext, useAuth as useAuthHook } from '@/hooks/use-auth';

interface AuthProviderProps {
  user: AppUser;
  children: React.ReactNode;
}

export default function AuthProvider({ user: initialUser, children }: AuthProviderProps) {
  const supabase = createClient();
  const [user, setUser] = useState<AppUser | null>(initialUser);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Si hay sesión, nos aseguramos de tener el perfil más reciente
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
            setUser({ ...session.user, ...profile } as AppUser);
        }

      } else {
        // Si la sesión se cierra, limpiamos el usuario y redirigimos
        setUser(null);
        window.location.href = '/';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
