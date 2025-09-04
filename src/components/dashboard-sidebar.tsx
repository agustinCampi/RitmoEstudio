"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Home,
  Users,
  Calendar,
  ClipboardCheck,
  BookUser,
  LogOut,
  Swords,
  Music,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

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

const navIcons = {
  'Danza Clásica': Music,
  'Danza Urbana': Swords,
  'Ritmos Latinos': Heart,
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems =
    user?.role === 'admin'
      ? adminNavItems
      : user?.role === 'teacher'
      ? teacherNavItems
      : studentNavItems;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <WindIcon className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">RitmoEstudio</span>
          </Link>

          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && 'bg-accent text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={logout}
                variant="ghost"
                size="icon"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Cerrar sesión</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}

function WindIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
        <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
        <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
      </svg>
    )
  }
