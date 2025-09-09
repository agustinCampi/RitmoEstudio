
"use client";

import { useAuth } from "@/hooks/use-auth";
import {
    Avatar,
    AvatarFallback,
    // AvatarImage no se usará ya que no hay URL de avatar
  } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserMenu() {
    const { user, logout } = useAuth();

    if (!user) {
        return null;
    }

    const getInitials = (name: string) => {
        const names = name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  {/* Eliminamos AvatarImage ya que no tenemos una URL de imagen */}
                  <AvatarFallback>{getInitials(user.name || 'Usuario')}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert("Navegar a perfil...")}>
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("Navegar a ajustes...")}>
                Ajustes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
      </DropdownMenu>
    )
}
