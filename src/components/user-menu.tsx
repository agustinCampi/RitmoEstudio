'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, LifeBuoy, Settings } from 'lucide-react';
import { useAuth } from './auth-provider'; // Importar el hook de autenticación

export default function UserMenu() {
  const { user } = useAuth(); // Usar el hook para obtener el usuario
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // La redirección ahora se maneja globalmente en el AuthProvider
    // al detectar un cambio de estado de autenticación.
    router.push('/'); 
  };

  // Si el usuario no ha cargado o no existe, no renderizar el componente
  if (!user) {
    return null;
  }

  // Función para obtener las iniciales para el avatar
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // El nombre puede estar en `user_metadata` o directamente en `full_name` del perfil
  const displayName = user.full_name || user.user_metadata?.full_name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={user.avatar_url || user.user_metadata?.avatar_url || ''} 
              alt={displayName || 'User'} 
            />
            <AvatarFallback>{getInitials(displayName || user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName || 'Usuario'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
