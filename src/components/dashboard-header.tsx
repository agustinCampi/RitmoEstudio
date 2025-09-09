
'use client';

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { adminNav, teacherNav, studentNav } from "@/config/nav-config";
import { Logo } from "./logo";
import { useState } from "react";


export default function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin': return adminNav;
      case 'teacher': return teacherNav;
      case 'student': return studentNav;
      default: return [];
    }
  }

  const navItems = getNavItems();

  const pageTitles: { [key: string]: string } = {
    '/dashboard': `¡Hola, ${user?.name.split(' ')[0]}!`,
    '/dashboard/classes': 'Clases',
    '/dashboard/students': 'Gestionar Alumnos',
    '/dashboard/teachers': 'Gestionar Profesores',
    '/dashboard/assigned-classes': 'Mis Clases Asignadas',
    '/dashboard/my-classes': 'Mis Clases Reservadas',
    '/dashboard/calendar': 'Calendario de Clases',
  };

  const getTitle = () => {
    if (pathname.startsWith('/dashboard/attendance/')) {
        return 'Tomar Asistencia';
    }
    return pageTitles[pathname] || 'RitmoEstudio';
  }


  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 bg-background z-30">
       <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
            <SheetHeader className="p-6 pb-2 border-b">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
            </SheetHeader>
            <nav className="grid gap-2 text-lg font-medium p-6">
              {navItems.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                  href={item.href}
                  className={cn(
                      "flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                      pathname === item.href && "bg-muted text-foreground"
                  )}
                  >
                  {item.icon}
                  {item.title}
                  </Link>
                </SheetClose>
              ))}
            </nav>
        </SheetContent>
        </Sheet>

        <div className="w-full flex-1">
           <h1 className="text-lg font-semibold">{getTitle()}</h1>
        </div>
    </header>
  );
}
