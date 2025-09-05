
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
  BookUser,
  LogOut,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { adminNav, teacherNav, studentNav } from '@/config/nav-config';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  let navItems = adminNav;
  if (user?.role === 'teacher') {
    navItems = teacherNav;
  } else if (user?.role === 'student') {
    navItems = studentNav;
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Logo />
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
                  {item.icon}
                  <span className="sr-only">{item.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.title}</TooltipContent>
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

    