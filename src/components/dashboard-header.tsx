
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
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import Link from 'next/link';
import { LogOut, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { adminNav, teacherNav, studentNav } from "@/config/nav-config";


export function DashboardHeader({ title, children }: { title: string, children?: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };
  
  let navItems: { title: string; href: string; icon: React.ReactNode }[] = adminNav;

  if (user?.role === 'teacher') {
    navItems = teacherNav;
  } else if (user?.role === 'student') {
    navItems = studentNav;
  }

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
            <nav className="grid gap-6 text-lg font-medium mt-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold mb-4">
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
                  {item.icon}
                  {item.title}
                </Link>
              ))}
               <button
                onClick={logout}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground mt-auto"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      <h1 className="font-headline text-2xl md:text-3xl font-bold">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        {children}
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
              {user?.role && (
                <p className="text-xs text-muted-foreground font-normal capitalize">
                  {user.role}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

    