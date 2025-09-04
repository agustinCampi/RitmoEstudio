"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import Link from 'next/link';
import { Home, Users, Calendar, BookUser, Swords, LogOut, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';

const adminNavItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/dashboard/classes', icon: Calendar, label: 'Gestionar Clases' },
  { href: '/dashboard/students', icon: Users, label: 'Gestionar Alumnos' },
];

const teacherNavItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/dashboard/classes', icon: Calendar, label: 'Mis Clases' },
];

const studentNavItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/dashboard/classes', icon: Swords, label: 'Catálogo de Clases' },
  { href: '/dashboard/my-classes', icon: BookUser, label: 'Mis Clases' },
];


export function DashboardHeader({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };
  
  const navItems =
    user?.role === 'admin'
      ? adminNavItems
      : user?.role === 'teacher'
      ? teacherNavItems
      : studentNavItems;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mb-4">
       <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
             <SheetHeader className="sr-only">
              <SheetTitle>Navegación</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 font-semibold">
                    <Logo />
                </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                  pathname === item.href && "text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
               <button
                onClick={logout}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      <h1 className="font-headline text-2xl md:text-3xl font-bold">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} alt={user?.name} />
                <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p>{user?.name}</p>
              <p className="text-xs text-muted-foreground font-normal">
                {user?.role.charAt(0).toUpperCase() + user!.role.slice(1)}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
