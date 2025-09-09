'use client';

import { createContext, useContext } from 'react';
import type { User } from '@/lib/types';

// Definimos la forma del contexto
interface AuthContextType {
  user: User | null;
}

// Creamos el contexto con un valor por defecto
export const AuthContext = createContext<AuthContextType>({ user: null });

// Creamos un hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Esto asegura que el hook se usa dentro de un AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
